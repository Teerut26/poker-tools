import clsx from 'clsx'
import { ArrowLeftIcon } from 'lucide-react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'

interface Props {
    children: React.ReactNode
    back?: boolean
    className?: string
    classNameBtn?: string
    isLoading?: boolean
}

const MainLayout: NextPage<Props> = ({ children, back, className, classNameBtn, isLoading }) => {
    const { back: backFunc } = useRouter()
    if (isLoading) return (<>Loading...</>)
    return (
        <div className={clsx("min-h-screen flex justify-center items-center", className && className)}>
            <div className="flex flex-col w-full max-w-3xl gap-3 mx-3">
                {back && <div className='flex justify-start'>
                    <button onClick={backFunc} className={clsx(classNameBtn ? classNameBtn : 'btn btn-ghost')}>
                        <ArrowLeftIcon /> กลับ
                    </button>
                </div>}
                {children}
            </div>
        </div>
    )
}

export default MainLayout