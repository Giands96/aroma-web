import type { NextRequest } from 'next/server'
import { updateSession } from './app/shared/lib/supabase/proxy';
 
// This function can be marked `async` if using `await` inside
export function proxy(request: NextRequest) {
  return updateSession(request);
}
 
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ],
}