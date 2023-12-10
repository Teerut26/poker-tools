import useUserHook from '@/hooks/useUserHook'
import { RoomInterface } from '@/interfaces/RoomInterface'
// import MainLayout from '@/layouts/MainLayout'
import { api } from '@/utils/api'
import { pb } from '@/utils/pocketbase'
import { NextPageContext } from 'next'
import { useRouter } from 'next/navigation'
import { ClientResponseError } from 'pocketbase'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import _ from 'lodash'
import Player from '@/components/Player'
import { Gamepad2Icon, Trash2Icon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import dynamic from 'next/dynamic'
const MainLayout = dynamic(() => import('@/layouts/MainLayout'), { ssr: true })

Room.getInitialProps = async (ctx: NextPageContext) => {
    const { id } = ctx.query
    return { id }
}

pb.autoCancellation(false);

interface Props {
    id: string | string[] | undefined
}

export default function Room({ id }: Props) {
    const [RoomData, setRoomData] = useState<RoomInterface>({} as RoomInterface);
    const [Money, setMoney] = useState("");
    const [Password, setPassword] = useState<string>("");
    const [HasPassword, setHasPassword] = useState(false);
    const [Users, setUsers] = useState<string[]>([]);
    const [IsLoading, setIsLoading] = useState(true);
    const { data: session } = useSession()
    const { user } = useUserHook()
    const { push } = useRouter();

    const joinRoomApi = api.roomRouter.join.useMutation()
    const betApi = api.userRouter.bet.useMutation()
    const winnerApi = api.userRouter.winner.useMutation()
    const deleteRoomApi = api.roomRouter.delete.useMutation()

    useEffect(() => {
        if (!session) {
            return
        }

        (async () => {
            setIsLoading(true)
            try {
                const roomData = await initRoomData()
                setUsers(roomData.users)
                setRoomData(roomData)

                if (roomData.users.includes(session?.user.pocketbaseid)) {
                    setIsLoading(false)
                    return
                }

                if (roomData.password) {
                    setHasPassword(true)
                } else {
                    setHasPassword(false)
                    onJoinRoom()
                }
                setIsLoading(false)
            } catch (error) {
                setIsLoading(false)
                if (error instanceof ClientResponseError) {
                    if (error.status === 404) {
                        push('/')
                    }
                }
            }

        })()
    }, [session?.user.pocketbaseid])

    const initRoomData = async () => {
        const roomData = await pb.collection('room').getOne<RoomInterface>(id as string)
        setUsers(roomData.users)
        setRoomData(roomData)
        return roomData
    }

    useEffect(() => {
        pb.collection('room').subscribe<RoomInterface>(id as string, function (e) {
            if (e.action === 'update') {
                setRoomData(e.record)
                setUsers(e.record.users)
            } else if (e.action === 'delete') {
                push('/')
            }
        }
        );

        return () => {
            pb.collection('room').unsubscribe(id as string);
        }
    }, [])

    const moneyChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMoney(e.target.value)
    }

    const onInputMoneyButton: React.MouseEventHandler<HTMLButtonElement> = (e) => {
        const value = Number(e.currentTarget.value)
        if ((Number(Money) + value) < 0) {
            return
        }
        setMoney((prev) => {
            const newMoney = Number(prev) + value
            return newMoney.toString()
        })
    }

    const onJoinRoom = async () => {
        const key = toast.loading('กำลังเข้าร่วม...')
        setIsLoading(true)
        joinRoomApi.mutate({
            record_id: id as string,
            password: (Password && Password.length > 0) ? Password : undefined
        }, {
            onSuccess: async (data) => {
                setHasPassword(false)
                toast.success("เข้ารวมสำเร็จ", {
                    id: key
                })
                await initRoomData()
                setIsLoading(false)
            },
            onError: (error) => {
                toast.error(error.message, {
                    id: key
                })
                setIsLoading(false)
            }

        })
    }

    const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value)
    }

    const onPasswordSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
        if (!Password || Password.length === 0) {
            return
        }
        e.preventDefault()
        onJoinRoom()
    }


    const onBet: React.FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault()
        if (!Money || Money.length === 0) {
            return
        }

        if (Number(Money) < 0) {
            toast.error("เงินต้องมากกว่า 0")
            return
        }

        if (!session?.user.pocketbaseid) {
            return
        }

        betApi.mutate({
            record_id: session?.user.pocketbaseid,
            money: Number(Money),
            room_id: id as string
        },
            {
                onSuccess: (data) => {
                    toast.success("ลงเดิมพันสำเร็จ")
                    setMoney("")
                },
                onError: (error) => {
                    toast.error(error.message)
                }
            })
    }

    const onWinner: React.MouseEventHandler<HTMLButtonElement> = async (e) => {
        e.preventDefault()
        winnerApi.mutate({
            room_record_id: id as string,
            user_record_id: e.currentTarget.value
        },
            {
                onSuccess: (data) => {
                    toast.success(`${data.name} ชนะ`)
                },
                onError: (error) => {
                    toast.error(error.message)
                }
            })

    }

    const onDelRoom: React.MouseEventHandler<SVGSVGElement> = async (e) => {
        e.preventDefault()
        const key = toast.loading('กำลังลบ...')
        deleteRoomApi.mutate({
            record_id: id as string
        },
            {
                onSuccess: (data) => {
                    toast.success("ลบสำเร็จ", {
                        id: key
                    })
                    push('/')
                },
                onError: (error) => {
                    toast.error(error.message, {
                        id: key
                    })
                }
            })
    }

    const IsOwner = session?.user.pocketbaseid === RoomData?.owner

    return (
        <MainLayout isLoading={IsLoading} className='bg-[#1E662D]' back classNameBtn='btn btn-primary'>
            {HasPassword ? <div className='bg-base-100 border'>
                <div className='card-body'>
                    <h3 className="font-bold text-lg">ใส่รหัสผ่าน</h3>
                    <form onSubmit={onPasswordSubmit} className="form-control flex flex-col gap-2">
                        <input onChange={onPasswordChange} type="password" placeholder="รหัสผ่าน" className="input input-bordered" />
                        <button className='btn btn-primary'>
                            เข้าร่วม
                        </button>
                    </form>
                </div>
            </div> : <>
                <div className='flex flex-col w-full h-full gap-3'>
                    <div className='card bg-base-100 border p-3 flex gap-2 w-full flex-row justify-between'>
                        <div className='flex gap-1 items-center'>
                            <Gamepad2Icon />
                            <div>{RoomData.name}</div>
                        </div>
                        {IsOwner &&
                            <Trash2Icon className='text-red-500 cursor-pointer' onClick={onDelRoom} />
                        }</div>

                    <div className='flex gap-3 h-full'>
                        <div className='flex flex-col gap-3 h-full'>
                            <div className="stats border">
                                <div className="stat">
                                    <div className="stat-title">เงินกองกลาง</div>
                                    <div className="stat-value">{RoomData.pot || 0}</div>
                                </div>
                            </div>
                            <div className='card bg-base-100 border h-full'>
                                <div className='card-body'>
                                    <div className="stat-title">เงินของเรา ({session?.user?.name})</div>
                                    <div className="stat-value">{user?.money && user?.money.toLocaleString("th-TH")}</div>
                                    <form onSubmit={onBet} className='flex gap-2'>
                                        <input onChange={moneyChangeHandler} value={Money} type="text" className='input input-bordered w-full' placeholder='0' />
                                        <button disabled={betApi.isLoading} type='submit' className='btn btn-primary'>
                                            {betApi.isLoading ? <span className="loading loading-dots loading-xs"></span> : null}
                                            ลงเดิมพัน
                                        </button>
                                    </form>
                                    <div className='flex flex-wrap gap-2 md:justify-around'>
                                        <button onClick={onInputMoneyButton} value={+100} className='btn btn-primary'>
                                            +100
                                        </button>
                                        <button onClick={onInputMoneyButton} value={+10} className='btn btn-primary'>
                                            +10
                                        </button>
                                        <button onClick={onInputMoneyButton} value={+1} className='btn btn-primary'>
                                            +1
                                        </button>
                                        <button onClick={onInputMoneyButton} value={-1} className='btn btn-primary'>
                                            -1
                                        </button>
                                        <button onClick={onInputMoneyButton} value={-10} className='btn btn-primary'>
                                            -10
                                        </button>
                                        <button onClick={onInputMoneyButton} value={-100} className='btn btn-primary'>
                                            -100
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='card bg-base-100 border w-[20rem] p-3 hidden md:flex gap-2'>
                            ผู้เล่น ({Users.length} คน)
                            <div className='border overflow-y-auto max-h-[60vh]'>
                                {Users.map((item, i) => (
                                    <Player key={i} id={item} winnerButton={IsOwner ? <button disabled={winnerApi.isLoading} onClick={onWinner} value={item} className='btn btn-sm btn-primary'>Winner</button> : null} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </>
            }
        </MainLayout>)
}