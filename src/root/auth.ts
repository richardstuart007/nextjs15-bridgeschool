import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from '@/src/root/auth.config'
import { z } from 'zod'
import type { au_UserData, structure_ProviderSignInParams } from '@/src/lib/tables/structures'
import bcrypt from 'bcryptjs'
import { providerSignIn } from '@/src/lib/dataAuth/providerSignIn'
import Github from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import { table_fetch } from '@/src/lib/tables/tableGeneric/table_fetch'
import { userCache_purgeOnSignIn } from '@/src/lib/tables/cache/userCache_purgeOnSignIn'

const functionName = 'auth'
// ----------------------------------------------------------------------
//  Check User/Password
// ----------------------------------------------------------------------
export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut
} = NextAuth({
  trustHost: true,
  ...authConfig,
  //-----------------------------------------------------------------------
  //  Providers
  //-----------------------------------------------------------------------
  providers: [
    //..............................
    //  Github
    //..............................
    Github({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    }),
    //..............................
    // Google
    //..............................
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }),
    //..............................
    //  Email & password
    //..............................
    Credentials({
      async authorize(credentials) {
        //
        //  Validate input format
        //
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string() })
          .safeParse(credentials)
        //
        //  Fail credentials then return
        //
        if (!parsedCredentials.success) return null
        //
        //  Get userpwd from database
        //
        try {
          const { email, password } = parsedCredentials.data
          //
          //  Get Password record
          //
          const pwdParams = {
            caller: functionName,
            table: 'tup_userspwd',
            whereColumnValuePairs: [{ column: 'up_email', value: email }]
          }
          const pwdRows = await table_fetch(pwdParams)
          const userPwd = pwdRows[0]
          if (!userPwd) return null
          //
          //  Check password if exists
          //
          const passwordsMatch = await bcrypt.compare(password, userPwd.up_hash)
          if (!passwordsMatch) return null
          //
          //  Get User record
          //
          const fetchParams = {
            caller: functionName,
            table: 'tus_users',
            whereColumnValuePairs: [{ column: 'us_email', value: email }]
          }
          const rows = await table_fetch(fetchParams)
          const userRecord = rows[0]
          if (!userRecord) return null
          //
          //  Return in correct format
          //
          const rtnData = popUserData(userRecord)
          return rtnData
          //
          //  Errors
          //
        } catch (error) {
          console.error('Authorization error:', error)
          return null
        }
      }
    })
  ],
  //-----------------------------------------------------------------------
  //  Callback functions
  //-----------------------------------------------------------------------
  callbacks: {
    //-----------------------------------------------------------------------
    //  1) JWT - Runs first to create/update token
    //-----------------------------------------------------------------------
    async jwt({ token, user }) {
      if (user) {
        const customUser = user as au_UserData
        //
        // NextAuth fields
        //
        token.sub = customUser.id
        token.name = customUser.name
        token.email = customUser.email
        token.emailVerified = customUser.emailVerified
        //
        // Your custom fields
        //
        token.au_usid = customUser.au_usid
        token.au_name = customUser.au_name
        token.au_email = customUser.au_email
        token.au_ssid = customUser.au_ssid
      }
      return token
    },
    //-----------------------------------------------------------------------
    //  2) Session - Runs second using token data
    //-----------------------------------------------------------------------
    async session({ token, session }) {
      if (session.user) {
        session.user = {
          //
          // NextAuth required fields
          //
          id: token.sub as string,
          name: token.name as string,
          email: token.email as string,
          emailVerified: token.emailVerified as Date | null,
          //
          // Your custom fields
          //
          au_ssid: token.au_ssid as string,
          au_usid: token.au_usid as string,
          au_name: token.au_name as string,
          au_email: token.au_email as string
        } as au_UserData
      }
      return session
    },
    //-----------------------------------------------------------------------
    //  3) SignIn - Runs when user first authenticates
    //-----------------------------------------------------------------------
    async signIn({ user, account }) {
      const { email, name } = user
      const provider = account?.provider
      //
      //  Errors
      //
      if (!provider || !email || !name) return false
      //
      //  Write session information
      //
      const signInData: structure_ProviderSignInParams = {
        provider: provider,
        email: email,
        name: name
      }
      try {
        //
        // Fetch the user from the database
        //
        const fetchParams = {
          caller: functionName,
          table: 'tus_users',
          whereColumnValuePairs: [{ column: 'us_email', value: email }]
        }
        const rows = await table_fetch(fetchParams)
        const userRecord = rows[0]
        //
        // User must exist in database to sign in
        //
        if (!userRecord) return false
        //
        //  Extend user
        //
        Object.assign(user, popUserData(userRecord))
        //
        //  Get au_ssid
        //
        const newAuSsid = await providerSignIn(signInData, functionName)
        const stringAuSsid = newAuSsid.toString()
        const userTyped = user as au_UserData
        userTyped.au_ssid = stringAuSsid

        //  CLEAR CACHE FOR THIS USER - ADD THIS LINE
        await userCache_purgeOnSignIn(userRecord.us_usid, functionName)

        //
        //  All OK
        //
        return true
        //
        //  Errors
        //
      } catch (error) {
        console.error('Provider signIn error:', error)
        return false
      }
    }
  }
})
//-----------------------------------------------------------------------
//  Helper Function: Populate User Information
//-----------------------------------------------------------------------
/**
 * Interface defining the structure of a user record from the database
 * @property us_usid - User ID from database (can be number or string)
 * @property us_name - User's display name
 * @property us_email - User's email address
 */
interface UserRecord {
  us_usid: number | string
  us_name: string
  us_email: string
}

/**
 * Creates au_UserData object from database record
 * @param userRecord - Database record containing user fields
 * @returns au_UserData object with all required authentication fields
 */
function popUserData(userRecord: UserRecord): au_UserData {
  return {
    //
    // NextAuth fields
    //
    id: userRecord.us_usid.toString(),
    name: userRecord.us_name,
    email: userRecord.us_email,
    emailVerified: null, // Always null, not used or stored
    //
    // Custom fields
    //
    au_usid: userRecord.us_usid.toString(),
    au_name: userRecord.us_name,
    au_email: userRecord.us_email,
    au_ssid: ''
  }
}
