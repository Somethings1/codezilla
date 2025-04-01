// src/app/auth/callback/route.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers'; // Import cookies from next/headers

export async function GET(request: NextRequest) {
    console.log("--- API Route /auth/callback START ---");
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/problems'; // Default redirect

    console.log(`Callback received. Code: ${code ? 'present' : 'MISSING'}, Origin: ${origin}, Next path: ${next}`);


    if (code) {
        const cookieStore = cookies(); // Get cookie store instance
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    // Provide the get/set/remove functions using the CookieStore
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: any) {
                        try {
                            cookieStore.set({ name, value, ...options });
                        } catch (error) {
                             // Handle potential errors setting cookies in Route Handler context
                             console.error(`Error setting cookie ${name} in callback route:`, error);
                        }
                    },
                    remove(name: string, options: any) {
                       try {
                           cookieStore.set({ name, value: '', ...options });
                       } catch (error) {
                           console.error(`Error removing cookie ${name} in callback route:`, error);
                       }
                    },
                },
            }
        );

        console.log("Exchanging code for session...");
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            console.log("Code exchange successful. Redirecting to:", `${origin}${next}`);
            // Ensure origin is correctly determined or use a relative path if appropriate
             return NextResponse.redirect(`${origin}${next}`);
            // Or safer: return NextResponse.redirect(new URL(next, origin).toString());

        } else {
            console.error("Error exchanging code for session:", error.message);
             // Redirect to an error page or signin page with error message
            return NextResponse.redirect(`${origin}/signin?error=auth_callback_failed`);
        }
    } else {
         console.error("Callback route called without authorization code.");
         // Redirect to an error page or signin page
         return NextResponse.redirect(`${origin}/signin?error=missing_auth_code`);
    }
}
