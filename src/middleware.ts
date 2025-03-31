// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

// Keep your route definitions
const publicRoutes = ['/', '/signin', '/signup', '/complete-profile', '/auth/callback'];
const authRoutes = ['/signin', '/signup'];
const privateHome = '/problems';
// const callbackRoute = '/auth/callback'; // We don't need to explicitly handle this path for redirection anymore

export async function middleware(req: NextRequest) {
    console.log(`\n--- Middleware Start: Path = ${req.nextUrl.pathname} ---`);
    let res = NextResponse.next({
        request: { headers: new Headers(req.headers) },
    });

    const isLocalhost = req.nextUrl.protocol === 'http:';

    // Keep your Supabase client creation with cookie handlers...
    let supabase = createServerClient(
        // ... same config as before ...
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    // console.log(`Middleware Cookie Get: Requesting ${name}`); // Optional: Log cookie gets
                    return req.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: Partial<ResponseCookie>) {
                    const cookieOptions = { ...options };
                     if (isLocalhost) {
                        cookieOptions.secure = false;
                        if (cookieOptions.sameSite === undefined || cookieOptions.sameSite === 'none') {
                            cookieOptions.sameSite = 'lax';
                        }
                        // console.log(`Middleware Cookie Set: Overriding secure/sameSite for localhost`);
                    }
                    try {
                        // console.log(`Middleware Cookie Set: Attempting to set ${name}`);
                        res.cookies.set({ name, value, ...cookieOptions });
                    } catch (error) {
                        console.error(`Middleware Cookie Set Error: Failed to set ${name}:`, error);
                    }
                },
                remove(name: string, options: Partial<ResponseCookie>) {
                    const cookieOptions = { ...options };
                     if (isLocalhost) {
                        cookieOptions.secure = false;
                        if (cookieOptions.sameSite === undefined || cookieOptions.sameSite === 'none') {
                            cookieOptions.sameSite = 'lax';
                        }
                     }
                    try {
                        // console.log(`Middleware Cookie Remove: Attempting to remove ${name}`);
                        res.cookies.set({ name, value: '', ...cookieOptions });
                    } catch (error) {
                        console.error(`Middleware Cookie Remove Error: Failed to remove ${name}:`, error);
                    }
                },
            },
        }
    );

    // --- Session Handling ---
    // Now, calling getSession WILL implicitly handle the callback if necessary
    // and use the cookie helpers to set the session.
    console.log("Middleware: Calling getSession()...");
    const { data: { session }, error: sessionError } = await supabase!.auth.getSession();
    console.log("Middleware: getSession() finished.");
    if (sessionError) {
        console.error('Middleware: Error during getSession():', sessionError.message);
        // Potentially return early or handle differently if session fetch fails critically
    }
    console.log('Middleware: Session object after getSession():', session ? `User ID: ${session.user.id}` : 'null');

    const { pathname } = req.nextUrl;

    // --- REMOVE EXPLICIT CALLBACK HANDLING ---
    // if (pathname === callbackRoute) {
    //    // DELETE THIS BLOCK
    // }

    // --- Routing Logic (Keep this) ---
    const isPublic = publicRoutes.includes(pathname) || pathname.startsWith('/_next') || pathname.startsWith('/api') || /\.(.*)$/.test(pathname);

    if (!session && !isPublic) {
        console.log(`Middleware Decision: No session and not public (${pathname}). Redirecting to /signin.`);
        return NextResponse.redirect(new URL('/signin', req.url));
    }

    if (session) {
        console.log(`Middleware Decision: Session found for user ${session.user.id}. Checking path ${pathname}.`);
        if (authRoutes.includes(pathname)) {
            console.log(`Middleware Decision: Session found but path is auth route (${pathname}). Redirecting to ${privateHome}.`);
            return NextResponse.redirect(new URL(privateHome, req.url));
        }

        // Profile completion check... keep this
         if (pathname !== '/complete-profile' && !pathname.startsWith('/api')) {
             // ... (profile check logic remains the same) ...
              try {
                  const { data: profile, error: profileError } = await supabase!.from('profiles').select('username').eq('id', session.user.id).single();
                  if (profileError && profileError.code !== 'PGRST116') console.error("Middleware profile check error:", profileError.message);
                  if (profile && profile.username === null) {
                      console.log(`Middleware Decision: Session found but profile incomplete. Redirecting to /complete-profile.`);
                      return NextResponse.redirect(new URL('/complete-profile', req.url));
                  }
              } catch (profileCheckError) {
                  console.error("Middleware: Error during profile check query:", profileCheckError);
              }
         }
    }

    console.log(`Middleware Decision: Allowing request to proceed for path: ${pathname}`);
    console.log(`--- Middleware End: Path = ${pathname} ---`);
    return res; // Return the potentially modified response (with cookies set if callback was handled)
}

// Keep config
export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',],
}
