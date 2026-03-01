import type { au_UserData } from '@/src/lib/tables/structures'
declare module 'next-auth' {
  interface Session {
    user: au_UserData
  }
}
