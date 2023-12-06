import useUserHook from '@/hooks/useUserHook';
import { RoomInterface } from '@/interfaces/RoomInterface';
import { UserInterface } from '@/interfaces/UserInterface';
import MainLayout from '@/layouts/MainLayout';
import { pb } from '@/utils/pocketbase';
import { PlusIcon, LogInIcon, UserIcon, LogOutIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
    const { push } = useRouter()
    const [IsLoading, setIsLoading] = useState(false)
    const [Rooms, setRooms] = useState<RoomInterface[]>([])
    const { user, logout } = useUserHook()

    useEffect(() => {
        pb.autoCancellation(false);
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
            }
        });
        return () => {
            pb.collection('room').unsubscribe();
        }
    }, [])

    return (
        <MainLayout>
            <div className="flex flex-col w-full gap-2">
                <div className='flex justify-between'>
                    <div className="text-xl">
                        ห้องทั้งหมด
                    </div>
                    <div className="flex gap-2 items-center">
                        <div className='border p-1 flex gap-1 items-center'>
                            <UserIcon size={20} />
                            {user?.name}
                        </div>
                        <LogOutIcon onClick={logout} size={20} className='text-error cursor-pointer' />
                    </div>
                </div>
                <div className="max-h-[55vh] border w-full overflow-y-auto p-2 gap-2 flex flex-col">
                    {!IsLoading ? Rooms.map((room, i) => (
                        <Link href={`/room/${room.id}`} key={i} className="p-5 w-full border flex justify-between hover:bg-gray-100 cursor-pointer">
                            <div className='flex flex-col'>
                                <div>{room.name}</div>
                                <div className='text-xs'>by {room.owner}</div>
                            </div>
                            <div>{room.users.length} <span className='text-xs'>คน</span></div>
                        </Link>
                    )) : <div className='h-full'>กำลังโหลด...</div>}
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
