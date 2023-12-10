import useUserHook from '@/hooks/useUserHook'
import clsx from 'clsx'
import { ArrowLeftIcon, CircleDollarSignIcon, LogOutIcon, UserIcon } from 'lucide-react'
import { NextPage } from 'next'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/router'

interface Props {
    children: React.ReactNode
    back?: boolean
    className?: string
    classNameBtn?: string
    isLoading?: boolean
    navbar?: boolean
}

const MainLayout: NextPage<Props> = ({ children, back, className, classNameBtn, isLoading, navbar = true }) => {
    const { back: backFunc, push } = useRouter()
    const { user } = useUserHook()

    if (isLoading) return (
        <div className='flex min-h-screen justify-center items-center'>
            <div className='flex flex-col items-center gap-2'>
                <span className="loading loading-ring loading-lg"></span>
                <div className='text-xl'>Loading...</div>
            </div>
        </div>
    )
    return (
        <div className={clsx("min-h-screen flex justify-center items-center", className && className)}>
            <div className="flex flex-col w-full max-w-3xl gap-3 mx-3">
                {back && <div className='flex justify-start'>
                    <button onClick={backFunc} className={clsx(classNameBtn ? classNameBtn : 'btn btn-ghost')}>
                        <ArrowLeftIcon /> กลับ
                    </button>
                </div>}
                {navbar &&
                    <div className='flex justify-between bg-base-100'>
                        <div className='flex  gap-2'>
                            <div className='border p-1 flex gap-1 items-center cursor-pointer hover:bg-base-200' onClick={() => {
                                push('/changename')
                            }}>
                                <UserIcon size={20} />
                                {user?.name}
                            </div>
                            <div className='border p-1 flex gap-1 items-center cursor-pointer hover:bg-base-200' onClick={() => {
                                push('/redeem')
                            }}>
                                <CircleDollarSignIcon size={20} />
                                {user?.money && user?.money.toLocaleString()}
                            </div>
                        </div>
                        <div className="flex gap-2 items-center px-2">
                            <LogOutIcon onClick={() => signOut()} size={20} className='text-error cursor-pointer' />
                        </div>
                    </div>}
                {children}
            </div>
        </div>
    )
}

export default MainLayout