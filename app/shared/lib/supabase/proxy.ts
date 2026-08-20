import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function redirectWithCookies(response: NextResponse, destination: URL) {
  const redirectResponse = NextResponse.redirect(destination);
  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });
  return redirectResponse;
}

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      "Las variables públicas de Supabase no están configuradas",
    );
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(
            ({ name, value, options }) => {
              response.cookies.set(
                name,
                value,
                options,
              );
            },
          );

          Object.entries(headers).forEach(
            ([name, value]) => {
              response.headers.set(name, value);
            },
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  const isDashboardRoute =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  if (isDashboardRoute && !user) {
    return redirectWithCookies(response, new URL("/login", request.url));
  }

  const isAuthorizationError = request.nextUrl.searchParams.has("error");
  if (pathname === "/login" && user && !isAuthorizationError) {
    return redirectWithCookies(response, new URL("/dashboard", request.url));
  }

  return response;
}
