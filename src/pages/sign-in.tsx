import TurnstileWidget from '@/components/TurnstileWidget'
import useUserHook from '@/hooks/useUserHook'
import MainLayout from '@/layouts/MainLayout'
import { api } from '@/utils/api'
import { NextPage } from 'next'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const Createuser: NextPage = () => {
    const onSignIn = async () => {
        await signIn('google', { callbackUrl: '/' })
    }
    return (
        <MainLayout navbar={false}>
            <div className='flex justify-center'>
                <button onClick={onSignIn} className='btn btn-primary'>
                    Sign in with Google
                </button>
            </div>
        </MainLayout>
    )
}

export default Createuser