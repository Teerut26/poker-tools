import useUserHook from '@/hooks/useUserHook'
import { api } from '@/utils/api'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { ChangeEvent, use, useState } from 'react'
import toast from 'react-hot-toast'

const MainLayout = dynamic(() => import('@/layouts/MainLayout'), { ssr: false })

interface Props { }

const Changename: NextPage<Props> = () => {
    const { user } = useUserHook()
    const [Name, setName] = useState("")
    const changeNameApi = api.userRouter.changeName.useMutation()
    const onSubmitChangeName = (e: ChangeEvent<HTMLFormElement>) => {
        e.preventDefault()
        const key = toast.loading("กำลังเปลี่ยนชื่อ")
        changeNameApi.mutate({ name: Name }, {
            onSuccess: () => {
                toast.success("เปลี่ยนชื่อสำเร็จ", {
                    id: key
                })
                setName("")
            },
            onError: (err) => {
                if (err instanceof Error) {
                    toast.error(err.message, {
                        id: key
                    })
                }
            }
        })
    }
    const onChangeName = (e: ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value)
    }

    return (
        <MainLayout back>
            <form onSubmit={onSubmitChangeName} className="flex flex-col gap-2 w-full">
                
                <h2 className="card-title">เปลี่ยนชื่อ</h2>
                <input onChange={onChangeName} value={Name} type="text" placeholder="New Name" className="input input-bordered w-full" />
                <button disabled={changeNameApi.isLoading} type="submit" className="btn btn-primary">
                    {changeNameApi.isLoading && <span className="loading loading-dots loading-lg"></span>}
                    เปลี่ยนชื่อ
                </button>
            </form>
        </MainLayout>
    )
}

export default Changename