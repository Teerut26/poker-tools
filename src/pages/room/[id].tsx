import useUserHook from '@/hooks/useUserHook'
import { RoomInterface, RoomInterfaceExpand } from '@/interfaces/RoomInterface'
import { UserInterface } from '@/interfaces/UserInterface'
import MainLayout from '@/layouts/MainLayout'
import { api } from '@/utils/api'
import { pb } from '@/utils/pocketbase'
import { NextPage, NextPageContext } from 'next'
import { useRouter } from 'next/navigation'
import { ClientResponseError } from 'pocketbase'
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import _ from 'lodash'
import Player from '@/components/Player'
import { UserIcon } from 'lucide-react'

Room.getInitialProps = async (ctx: NextPageContext) => {
    const { id } = ctx.query
    return { id }
}

pb.autoCancellation(false);

interface Props {
    id: string | string[] | undefined
}

export default function Room({ id }: Props) {
    const joinRoomApi = api.roomRouter.join.useMutation()
    const betApi = api.userRouter.bet.useMutation()
    const winnerApi = api.userRouter.winner.useMutation()
    const { push } = useRouter()
    const [RoomData, setRoomData] = useState<RoomInterface>({} as RoomInterface)
    const [Money, setMoney] = useState("")
    const [Password, setPassword] = useState<string>("")
    const [HasPassword, setHasPassword] = useState(false)
    const { user } = useUserHook()
    const [Users, setUsers] = useState<string[]>([])
    const [IsLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!user) {
            return
        }

        (async () => {
            setIsLoading(true)
            try {
                const roomData = await pb.collection('room').getOne<RoomInterface>(id as string)

                setUsers(roomData.users)

                setRoomData(roomData)

                if (roomData.users.includes(user?.id!)) {
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

        pb.collection('room').subscribe<RoomInterface>(id as string, async function (e) {
            if (e.action === 'update') {
                setRoomData(e.record)
            } else if (e.action === 'delete') {
                push('/')
            }
        }
        );

        return () => {
            pb.collection('room').unsubscribe(id as string);
        }
    }, [user?.id])

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
            user_record_id: user?.id!,
            password: (Password && Password.length > 0) ? Password : undefined
        }, {
            onSuccess: (data) => {
                setHasPassword(false)
                toast.success("เข้ารวมสำเร็จ", {
                    id: key
                })
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

        if (Number(Money) > user?.money!) {
            toast.error("เงินไม่พอ")
            return
        }
        if (!user) {
            return
        }

        betApi.mutate({
            record_id: user?.id,
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
        if (!user) {
            return
        }
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

    const IsOwner = user?.id === RoomData?.owner

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
                    <div className='card bg-base-100 border p-3 flex gap-2 w-full'>
                        <div className='flex gap-1'>
                            <UserIcon />
                            <div>{user?.name}</div>
                        </div>
                    </div>
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
                                    <div className="stat-title">เงินของเรา</div>
                                    <div className="stat-value">{user?.money.toLocaleString("th-TH") || 0}</div>
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