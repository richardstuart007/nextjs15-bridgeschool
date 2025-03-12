import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from './auth.config'
import { z } from 'zod'
import type {
  structure_UserAuth,
  structure_ProviderSignInParams
} from '@/src/lib/tables/structures'
import bcrypt from 'bcryptjs'
import { providerSignIn } from '@/src/lib/data-auth'
import Github from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import { table_fetch } from '@/src/lib/tables/tableGeneric/table_fetch'
//
//  Extend the user
//
import { DefaultSession } from 'next-auth'
export type ExtendedUser = DefaultSession['user'] & {
  au_ssid: string
  au_usid?: string
  au_name?: string
  au_email?: string
}
// ----------------------------------------------------------------------
//  Check User/Password
// ----------------------------------------------------------------------
let au_ssid = 0
export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut
} = NextAuth({
  trustHost: true,
  //
  //  Callback functions
  //
  callbacks: {
    //
    //  Sign in
    //
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
        // Fetch the user from the database
        const fetchParams = {
          table: 'tus_users',
          whereColumnValuePairs: [{ column: 'us_email', value: email }]
        }
        const rows = await table_fetch(fetchParams)
        const userRecord = rows[0]
        //
        //  Extend user
        //
        if (userRecord) {
          ;(user as ExtendedUser).au_usid = userRecord.us_usid.toString()
          ;(user as ExtendedUser).au_name = userRecord.us_name
          ;(user as ExtendedUser).au_email = userRecord.us_email
        }
        //
        //  Get au_ssid
        //
        au_ssid = await providerSignIn(signInData)
        return true
        //
        //  Errors
        //
      } catch (error) {
        console.log('Provider signIn error:', error)
        return false
      }
    },
    //
    //  Update the session information from the Token
    //
    async session({ token, session }) {
      if (token.sub && session.user) session.user.id = token.sub
      if (token.au_ssid && session.user) {
        session.user.au_ssid = token.au_ssid as string
        session.user.au_usid = token.au_usid as string
        session.user.au_name = token.au_name as string
        session.user.au_email = token.au_email as string
      }
      return session
    },
    //
    //  update token au_ssid to latest
    //
    async jwt({ token, user }) {
      if (user) {
        token.au_usid = (user as ExtendedUser).au_usid
        token.au_name = (user as ExtendedUser).au_name
        token.au_email = (user as ExtendedUser).au_email
      }
      if (!token.sub) return token
      let token_au_ssid = 0
      if (typeof token.au_ssid === 'number') token_au_ssid = token.au_ssid
      if (au_ssid > token_au_ssid) token.au_ssid = au_ssid
      return token
    }
  },
  ...authConfig,
  providers: [
    Github({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }),
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
          //  Get User record
          //
          const pwdParams = {
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
            table: 'tus_users',
            whereColumnValuePairs: [{ column: 'us_email', value: email }]
          }
          const rows = await table_fetch(fetchParams)
          const userRecord = rows[0]
          if (!userRecord) return null
          //
          //  Return in correct format
          //
          const rtnData = {
            name: userRecord.us_name,
            email: userRecord.us_email,
            password: userPwd.up_hash,
            au_usid: userRecord.us_usid.toString(),
            au_name: userRecord.us_name,
            au_email: userRecord.us_email
          }
          return rtnData as structure_UserAuth
          //
          //  Errors
          //
        } catch (error) {
          console.log('Authorization error:', error)
          return null
        }
      }
    })
  ]
})
