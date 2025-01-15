import {
  Routes_App,
  Routes_LoginRegister,
  Routes_Prefix_auth,
  Routes_Prefix_dashboard,
  Routes_AfterLogin_redirect,
  Routes_Prefix_admin,
  Routes_Login,
  Routes_Register
} from '@/src/validroutes'
import { getCookieSessionId } from '@/src/lib/cookie_server'

export default async function middleware(req: any): Promise<any> {
  const functionName = 'middleware'
  const { nextUrl } = req

  // if (process.env.CUSTOM_ENV === 'localhost') return null
  //
  //  Requested path name
  //
  const pathnameNew = req.nextUrl.pathname
  //
  //  Current path name
  //
  const pathnameCurrentobj = req.headers.get('referer')
  let pathnameCurrent = '/'
  if (pathnameCurrentobj) {
    const previousUrl = new URL(pathnameCurrentobj)
    pathnameCurrent = previousUrl.pathname
  }
  //
  //  Login status
  //
  const sessionId = await getCookieSessionId()
  const isLoggedInCookie = !!sessionId
  //-------------------------------------------------------------------------------------------------
  //  Allow all API routes
  //-------------------------------------------------------------------------------------------------
  if (pathnameNew.startsWith(Routes_Prefix_auth)) return null
  //-------------------------------------------------------------------------------------------------
  //  Allow App route
  //-------------------------------------------------------------------------------------------------
  if (Routes_App.includes(pathnameNew)) return null
  //-------------------------------------------------------------------------------------------------
  //  If no change in path, allow
  //-------------------------------------------------------------------------------------------------
  if (pathnameNew === pathnameCurrent) return null
  //-------------------------------------------------------------------------------------------------
  //  Login/Register
  //-------------------------------------------------------------------------------------------------
  if (Routes_LoginRegister.includes(pathnameCurrent)) {
    //
    // If not logged in then do not redirect
    //
    if (!isLoggedInCookie) return null
    //
    //  Redirect to Login or Register
    //
    if (pathnameNew === Routes_Login || pathnameNew === Routes_Register) return null
    //
    // Logged in and already redirected
    //
    if (pathnameNew === Routes_AfterLogin_redirect) return null
    //
    //  Logged in then Redirect to dashboard
    //
    return Response.redirect(new URL(Routes_AfterLogin_redirect, nextUrl))
  }
  //-------------------------------------------------------------------------------------------------
  //  Dashboard OR Admin
  //-------------------------------------------------------------------------------------------------
  if (
    pathnameNew.startsWith(Routes_Prefix_dashboard) ||
    pathnameNew.startsWith(Routes_Prefix_admin)
  ) {
    //
    //  Redirect to LOGIN
    //
    if (!isLoggedInCookie) {
      console.log(`${functionName}: Not logged in: Redirect ${Routes_Login}`)
      return Response.redirect(new URL(Routes_Login, nextUrl))
    }
    //
    //  Authorised
    //
    return null
  }
  //-------------------------------------------------------------------------------------------------
  //  Allow others
  //-------------------------------------------------------------------------------------------------
  return null
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)']
}
