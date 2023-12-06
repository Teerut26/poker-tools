import { ArrowLeftIcon } from 'lucide-react'
import { NextPage } from 'next'
import { useRouter } from 'next/router'

interface Props {
    children: React.ReactNode
    back?: boolean
}

const MainLayout: NextPage<Props> = ({ children, back }) => {
    const { back: backFunc } = useRouter()
    return (
        <div className="min-h-screen flex justify-center items-center">
            <div className="flex flex-col w-full max-w-md gap-3 mx-3">
                {back && <div className='flex justify-start'>
                    <button onClick={backFunc} className='btn btn-ghost'>
                        <ArrowLeftIcon /> กลับ
                    </button>
                </div>}
                {children}
            </div>
        </div>
    )
}

export default MainLayout