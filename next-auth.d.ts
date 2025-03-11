import ExtendedUser from '@/auth'
declare module 'next-auth' {
  interface Session {
    user: ExtendedUser
  }
}
