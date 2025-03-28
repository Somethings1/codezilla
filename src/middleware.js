// middleware.js (or src/middleware.js)
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

// Define public routes that don't require authentication
const publicRoutes = ['/', '/signin', '/signup', '/auth/callback', '/complete-profile'];
// Define routes logged-in users shouldn't access (usually auth pages)
const authRoutes = ['/signin', '/signup'];
// Define the main private route destination
const privateHome = '/problems';

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) { return req.cookies.get(name)?.value },
        set(name, value, options) { res.cookies.set({ name, value, ...options }) },
        remove(name, options) { res.cookies.set({ name, value: '', ...options }) },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  // Note: getSession() implicitly refreshes
  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl;

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route =>
      pathname === route || (route.endsWith('/*') && pathname.startsWith(route.slice(0, -2))) // Basic wildcard check for /api/* etc.
  ) || pathname.startsWith('/_next') || pathname.startsWith('/api') || /\.(.*)$/.test(pathname); // Also allow static files, API routes


  // --- Redirection Logic ---

  // 1. If NOT logged in and trying to access a PRIVATE route -> redirect to signin
  if (!session && !isPublicRoute) {
    console.log(`Redirecting unauthenticated user from ${pathname} to /signin`);
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/signin';
    // Optional: Add ?redirect=/original-path to redirect back after login
    // redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. If LOGGED IN...
  if (session) {
      // 2a. ...and trying to access an AUTH route (signin/signup) -> redirect to private home
      if (authRoutes.includes(pathname)) {
        console.log(`Redirecting authenticated user from ${pathname} to ${privateHome}`);
        return NextResponse.redirect(new URL(privateHome, req.url));
      }

      // 2b. ...and needs to complete profile (username is null) -> redirect to /complete-profile (unless already there)
      // (Make sure handle_new_oauth_user trigger sets username to NULL)
      if (pathname !== '/complete-profile' && !pathname.startsWith('/api')) { // Avoid API loops
         // Fetch profile minimally only when needed
         const { data: profile, error } = await supabase
             .from('profiles')
             .select('username')
             .eq('id', session.user.id)
             .single();

          if (error && error.code !== 'PGRST116') { // Ignore 'missing row' error if profile creation failed/delayed
              console.error("Middleware profile check error:", error.message);
          }

         if (profile && profile.username === null) {
             console.log(`Redirecting authenticated user ${session.user.id} from ${pathname} to /complete-profile`);
             return NextResponse.redirect(new URL('/complete-profile', req.url));
         }
      }
  }

  // Allow request to proceed
  return res;
}

// Keep the config the same as before
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
