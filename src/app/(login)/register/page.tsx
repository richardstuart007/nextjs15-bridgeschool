import MySchoolLogo from '@/src/ui/utils/mySchool-logo'
import RegisterForm from '@/src/ui/register/form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bridge School Register'
}

export default function RegisterPage() {
  return (
    <main className='flex items-center justify-center md:h-screen'>
      <div className='relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32'>
        <MySchoolLogo />
        <RegisterForm />
      </div>
    </main>
  )
}
