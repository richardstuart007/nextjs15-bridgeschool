import MySchoolLogo from '@/src/ui/components/mySchool-logo'
import LoginForm from '@/src/ui/login/form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bridge School Login'
}

export default function LoginPage() {
  return (
    <main className='flex items-center justify-center md:h-screen'>
      <div className='relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32'>
        <MySchoolLogo />
        <LoginForm />
      </div>
    </main>
  )
}
