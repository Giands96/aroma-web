import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './app/shared/lib/supabase/proxy';
import { ROUTES } from './app/shared/routes/routes';
 
function requiresSessionRefresh(pathname: string){

  return (
    pathname === ROUTES.LOGIN ||
    pathname === ROUTES.DASHBOARD.HOME ||
    pathname.startsWith(`${ROUTES.DASHBOARD.HOME}/`)
  )
} 

// This function can be marked `async` if using `await` inside
export function proxy(request: NextRequest) {
  return requiresSessionRefresh(request.nextUrl.pathname) ? updateSession(request) : NextResponse.next();
}
 




export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ],
}