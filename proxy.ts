import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './app/shared/lib/supabase/proxy';
import { RateLimitedError, checkLoginPageRateLimit } from './app/shared/lib/rate-limit';
import { ROUTES } from './app/shared/routes/routes';
 
function requiresSessionRefresh(pathname: string){

  return (
    pathname === ROUTES.LOGIN ||
    pathname === ROUTES.DASHBOARD.HOME ||
    pathname.startsWith(`${ROUTES.DASHBOARD.HOME}/`)
  )
} 

// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === ROUTES.LOGIN) {
    try {
      await checkLoginPageRateLimit(request.headers);
    } catch (error) {
      if (error instanceof RateLimitedError) {
        return new NextResponse("Demasiados intentos. Probá de nuevo más tarde.", {
          status: 429,
          headers: { "Retry-After": String(error.retryAfterSeconds) },
        });
      }
      throw error;
    }
  }
  return requiresSessionRefresh(request.nextUrl.pathname) ? updateSession(request) : NextResponse.next();
}
 




export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ],
}