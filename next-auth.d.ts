export type ExtendedUser = DefaultSession['user'] & {
  sessionId: string
}

declare module 'next-auth' {
  interface Session {
    user: ExtendedUser
  }
}
