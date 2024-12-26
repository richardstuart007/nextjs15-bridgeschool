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
// ----------------------------------------------------------------------
//  Check User/Password
// ----------------------------------------------------------------------
let sessionId = 0
export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut
} = NextAuth({
  trustHost: true,
  callbacks: {
    async signIn({ user, account }) {
      const { email, name } = user
      const provider = account?.provider
      //
      //  Errors
      //
      if (!provider || !email || !name) return false
      //
      //  Write session information & cookie
      //
      const signInData: structure_ProviderSignInParams = {
        provider: provider,
        email: email,
        name: name
      }
      try {
        sessionId = await providerSignIn(signInData)
        return true
        //
        //  Errors
        //
      } catch (error) {
        console.error('Provider signIn error:', error)
        return false
      }
    },
    //
    //  Update the session information from the Token
    //
    async session({ token, session }) {
      if (token.sub && session.user) session.user.id = token.sub
      if (token.sessionId && session.user) session.user.sessionId = token.sessionId as string
      return session
    },
    //
    //  update token sessionId to latest
    //
    async jwt({ token }) {
      if (!token.sub) return token
      let tokenSessionId = 0
      if (typeof token.sessionId === 'number') tokenSessionId = token.sessionId
      if (sessionId > tokenSessionId) token.sessionId = sessionId
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
        if (!parsedCredentials.success) {
          return null
        }
        //
        //  Get userpwd from database
        //
        try {
          const { email, password } = parsedCredentials.data
          //
          //  Get User record
          //
          const pwdParams = {
            table: 'userspwd',
            whereColumnValuePairs: [{ column: 'upemail', value: email }]
          }
          const pwdRows = await table_fetch(pwdParams)
          const userPwd = pwdRows[0]
          if (!userPwd) {
            return null
          }
          //
          //  Check password if exists
          //
          const passwordsMatch = await bcrypt.compare(password, userPwd.uphash)
          if (!passwordsMatch) {
            return null
          }
          //
          //  Get User record
          //
          const fetchParams = {
            table: 'users',
            whereColumnValuePairs: [{ column: 'u_email', value: email }]
          }
          const rows = await table_fetch(fetchParams)
          const userRecord = rows[0]
          if (!userRecord) {
            return null
          }
          //
          //  Return in correct format
          //
          const rtnData = {
            id: userRecord.u_uid.toString(),
            name: userRecord.u_name,
            email: userRecord.u_email,
            password: userPwd.uphash
          }
          return rtnData as structure_UserAuth
          //
          //  Errors
          //
        } catch (error) {
          console.error('Authorization error:', error)
          return null
        }
      }
    })
  ]
})
