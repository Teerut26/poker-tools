import { api } from '@/utils/api'
import { toast } from "react-hot-toast"
import { NextPage } from 'next'
import { ChangeEvent, useState } from 'react'
import MainLayout from '@/layouts/MainLayout'
import useUserHook from '@/hooks/useUserHook'

interface Props { }

const Createroom: NextPage<Props> = () => {
    const { user, updateUser } = useUserHook()
    const roomApi = api.roomRouter.create.useMutation()
    const [roomName, setRoomName] = useState<string>("")
    const [roomPassword, setRoomPassword] = useState<string>("")
    const [hasPassword, setHasPassword] = useState(false)

    const handleCreateRoom = (e: ChangeEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (hasPassword && roomPassword?.length <= 0) {
            toast.error("กรุณากรอกรหัสห้อง")
            return
        }

        if (roomName?.length <= 0) {
            toast.error("กรุณากรอกชื่อห้อง")
            return
        }
        const key = toast.loading("กำลังสร้างห้อง")

        roomApi.mutate({
            roomname: roomName,
            roompassword: roomPassword || undefined,
            user_record_id: user?.id!
        }, {
            onError: (err) => {
                if (err instanceof Error) {
                    toast.error(err.message, {
                        id: key

                    })
                }
            },
            onSuccess: (data) => {
                toast.success("สร้างห้องสำเร็จ", {
                    id: key
                })
            }
        })

    }

    const onChangeRoomName = (e: ChangeEvent<HTMLInputElement>) => {
        setRoomName(e.target.value)
    }

    const onChangeHasPassword = (e: ChangeEvent<HTMLInputElement>) => {
        setHasPassword(e.target.checked)
    }

    const onChangeRoomPassword = (e: ChangeEvent<HTMLInputElement>) => {
        setRoomPassword(e.target.value)
    }


    return (
        <MainLayout back>
            <form onSubmit={handleCreateRoom} className="max-w-sm mx-3 flex flex-col gap-2 w-full">
                <h2 className="card-title">สร้างห้อง</h2>
                <input onChange={onChangeRoomName} value={roomName} type="text" placeholder="Room name" className="input input-bordered w-full" />
                {hasPassword && <input onChange={onChangeRoomPassword} value={roomPassword} type="text" placeholder="Room password" className="input input-bordered w-full" />}
                <div className="flex gap-2 items-center">
                    <input type="checkbox" onChange={onChangeHasPassword} checked={hasPassword} className="checkbox checkbox-sm checkbox-primary" />
                    <div>รหัสห้อง</div>
                </div>
                <button type="submit" className="btn btn-primary">
                    สร้าง
                </button>
            </form>
        </MainLayout>
    );
}

export default Createroom