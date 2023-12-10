import useUserHook from '@/hooks/useUserHook';
import { RoomInterface } from '@/interfaces/RoomInterface';
import { pb } from '@/utils/pocketbase';
import { PlusIcon, UserIcon, LogOutIcon, LockIcon, CoinsIcon, CircleDollarSignIcon } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const MainLayout = dynamic(() => import('@/layouts/MainLayout'), { ssr: false })

pb.autoCancellation(false);
export default function Home() {
    const { push } = useRouter()
    const [IsLoading, setIsLoading] = useState(false)
    const [Rooms, setRooms] = useState<RoomInterface[]>([])
    const { user } = useUserHook()

    useEffect(() => {
        (async () => {
            setIsLoading(true)
            const records = await pb.collection('room').getFullList<RoomInterface>({
                sort: '-created',
            });
            setRooms(records)
            setIsLoading(false)
        })()
        pb.collection('room').subscribe<RoomInterface>('*', function (e) {
            if (e.action === 'create' || e.action === 'update') {
                setRooms((prev) => {
                    const index = prev.findIndex((room) => room.id === e.record.id);
                    if (index === -1) {
                        return [...prev, e.record];
                    }
                    prev[index] = e.record;
                    return [...prev];
                });
            } else if (e.action === 'delete') {
                setRooms((prev) => {
                    const index = prev.findIndex((room) => room.id === e.record.id);
                    if (index === -1) {
                        return prev;
                    }
                    prev.splice(index, 1);
                    return [...prev];
                });
            }
        });
        return () => {
            pb.collection('room').unsubscribe();
        }
    }, [])

    const logout = async () => {
        await signOut();
    }

    return (
        <MainLayout>
            <div className="flex flex-col w-full gap-2">
                <div className='flex justify-between items-center'>
                    <div className='flex flex-col'>
                        <div className="text-xl">
                            ห้องทั้งหมด
                        </div>
                        

                    </div>
                </div>
                <div className="h-[55vh] border w-full overflow-y-auto p-2 gap-2 flex flex-col">
                    {!IsLoading ? <>
                        {Rooms.length <= 0 ? <div className='h-full flex justify-center flex-col items-center'>
                            <div>ไม่มีห้อง</div>
                        </div> :
                            Rooms.map((room, i) => (
                                <Link href={`/room/${room.id}`} key={i} className="p-5 w-full border flex justify-between hover:bg-gray-100 cursor-pointer">
                                    <div className='flex flex-col'>
                                        <div className='flex gap-1 items-center'>
                                            {room.name} {room.password && room.password !== "" && <LockIcon size={13} />}</div>
                                        <div className='text-xs'>by {room.owner}</div>
                                    </div>
                                    <div>{room.users.length} <span className='text-xs'>คน</span></div>
                                </Link>
                            ))
                        }
                    </> : <div className='h-full flex justify-center flex-col items-center'>
                        <span className="loading loading-dots loading-lg"></span>
                        <div>Loading...</div>
                    </div>}
                </div>
            </div>
            <div className="flex w-full justify-around">
                {[
                    {
                        icon: <PlusIcon />,
                        text: "สร้างห้อง",
                        onClick: () => {
                            push("/createroom")
                        },
                    },
                    // {
                    //     icon: <LogInIcon />,
                    //     text: "เข้าร่วมห้อง",
                    //     onClick: () => {
                    //         push("/joinroom")
                    //     },
                    // }
                ].map(({ icon, text, onClick }, index) => (
                    <div key={index} onClick={onClick} className="flex flex-col items-center justify-center w-full border min-h-[5rem] cursor-pointer hover:bg-gray-100">
                        {icon}
                        <div>
                            {text}
                        </div>
                    </div>
                ))}
            </div>
        </MainLayout>
    );
}
