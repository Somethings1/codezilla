// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

// Keep your route definitions
const publicRoutes = ['/', '/signin', '/signup', '/complete-profile', '/auth/callback'];
const authRoutes = ['/signin', '/signup'];
const privateHome = '/problems';
const profileCompletionRoute = '/complete-profile';
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
    // --- Session Handling - USE getUser() ---
    console.log("Middleware: Calling getUser()...");
    // Note: getUser() returns { data: { user }, error } directly
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log("Middleware: getUser() finished.");
    if (userError) {
        // Log error but don't necessarily block if it's just a validation glitch
        console.error('Middleware: Error during getUser():', userError.message);
    }
    // 'user' object will be null if no valid session, otherwise it's the User object
    console.log('Middleware: User object after getUser():', user ? `User ID: ${user.id}` : 'null');

    const { pathname } = req.nextUrl;
    const isPublic = publicRoutes.includes(pathname) || pathname.startsWith('/_next') || pathname.startsWith('/api') || /\.(.*)$/.test(pathname);

    // --- Routing Logic ---

    // 1. Use the 'user' object (which is null if not logged in)
    if (!user && !isPublic) {
        console.log(`Middleware Decision: No user and not public (${pathname}). Redirecting to /signin.`);
        return NextResponse.redirect(new URL('/signin', req.url));
    }

    // 2. If LOGGED IN (user object exists)...
    if (user) {
        console.log(`Middleware Decision: User found ${user.id}. Checking path ${pathname}.`);

        // 2a. Auth route check
        if (authRoutes.includes(pathname)) {
            console.log(`Middleware Decision: User found but path is auth route (${pathname}). Redirecting to ${privateHome}.`);
            return NextResponse.redirect(new URL(privateHome, req.url));
        }

        // 2b. *** Profile Completion Check ***
        if (pathname !== profileCompletionRoute && !pathname.startsWith('/api')) {
            try {
                // Use the validated user.id
                console.log(`Middleware: Checking profile completion for user ${user.id}...`);
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('username')
                    .eq('id', user.id) // Use the ID from the validated user object
                    .single();

                if (profileError && profileError.code !== 'PGRST116') {
                    console.error("Middleware profile check error:", profileError.message);
                } else if (profile && profile.username === null) {
                    console.log(`Middleware Decision: User found but profile incomplete (username is null). Redirecting to ${profileCompletionRoute}.`);
                    return NextResponse.redirect(new URL(profileCompletionRoute, req.url));
                } else if (profile && profile.username !== null) {
                    console.log(`Middleware: Profile complete (username found).`);
                } else {
                    console.log(`Middleware: Profile not found or username check inconclusive (profile: ${JSON.stringify(profile)}) - Allowing access.`);
                }
            } catch (profileCheckError) {
                console.error("Middleware: CRITICAL Error during profile check query:", profileCheckError);
            }
        } else if (pathname === profileCompletionRoute) {
            console.log("Middleware: Already on profile completion route. No check needed.");
        }
    }

    // 3. Allow request
    console.log(`Middleware Decision: Allowing request to proceed for path: ${pathname}`);
    console.log(`--- Middleware End: Path = ${pathname} ---`);
    return res;
}

// Keep config
export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',],
}
