import useUserHook from '@/hooks/useUserHook'
import { api } from '@/utils/api'
import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { ChangeEvent, useState } from 'react'
import toast from 'react-hot-toast'

const MainLayout = dynamic(() => import('@/layouts/MainLayout'), { ssr: false })

interface Props { }

const Redeem: NextPage<Props> = () => {
    const [Code, setCode] = useState("")
    const redeemApi = api.userRouter.redeem.useMutation()
    const onSubmitChangeCode = (e: ChangeEvent<HTMLFormElement>) => {
        e.preventDefault()
        
        if(Code.length < 1) return toast.error("โปรดกรอกโคด")
        const key = toast.loading("กำลังแลกโคด...")
        redeemApi.mutate({ code: Code }, {
            onSuccess: (data) => {
                toast.success(`ได้รับเงิน ${data?.toLocaleString()}`, {
                    id: key
                })
                setCode("")
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
    const onChangeCode = (e: ChangeEvent<HTMLInputElement>) => {
        setCode(e.target.value)
    }

    return (
        <MainLayout back>
            <form onSubmit={onSubmitChangeCode} className="flex flex-col gap-2 w-full">
                <h2 className="card-title">โคดเติมเงิน</h2>
                <input onChange={onChangeCode} value={Code} type="text" placeholder="Redeem code" className="input input-bordered w-full" />
                <button disabled={redeemApi.isLoading} type="submit" className="btn btn-primary">
                    {redeemApi.isLoading && <span className="loading loading-dots loading-lg"></span>}
                    เติมเงิน
                </button>
            </form>
        </MainLayout>
    )
}

export default Redeem