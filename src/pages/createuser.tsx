import useUserHook from '@/hooks/useUserHook'
import MainLayout from '@/layouts/MainLayout'
import { api } from '@/utils/api'
import { NextPage } from 'next'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const Createuser: NextPage = () => {
    const { push } = useRouter()
    const createUserApi = api.userRouter.create.useMutation()
    const [Name, setName] = useState<string>("")
    const { user, updateUser } = useUserHook()

    const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value)
    }

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const result = await createUserApi.mutateAsync({ name: Name })
        updateUser(result)
        push('/')
    }

    useEffect(() => {
        if (user) {
            push('/')
        }
    }, [user])


    return (
        <MainLayout>
            <form onSubmit={onSubmit} className='flex flex-col gap-3'>
                <input onChange={onNameChange} value={Name} type="text" className='input input-bordered' placeholder='Name in game' />
                <button type='submit' className='btn btn-primary'>
                    {createUserApi.isLoading && <span className="loading loading-spinner"></span>}
                    สร้าง
                </button>
            </form>
        </MainLayout>
    )
}

export default Createuser