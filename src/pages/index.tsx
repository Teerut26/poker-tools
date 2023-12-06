import { RoomInterface } from '@/interfaces/RoomInterface';
import { pb } from '@/utils/pocketbase';
import { PlusIcon, LogInIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
    const { push } = useRouter()
    const [Rooms, setRooms] = useState<RoomInterface[]>([])

    useEffect(() => {
        (async () => {
            const records = await pb.collection('room').getFullList<RoomInterface>({
                sort: '-created',
            });
            setRooms(records)
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
        <div className="min-h-screen flex justify-center items-center">
            <div className="flex flex-col w-full max-w-md gap-3 mx-3">
                <div className="flex flex-col w-full">
                    <div className="text-xl">
                        ห้องทั้งหมด
                    </div>
                    <div className="max-h-[55vh] border w-full overflow-y-auto p-2 gap-2 flex flex-col ">
                        {Rooms.map((room, i) => (
                            <div key={i} className="p-5 w-full border flex justify-between hover:bg-gray-100 cursor-pointer">
                                <div className='flex flex-col'>
                                    <div>{room.name}</div>
                                    <div className='text-xs'>by {room.owner}</div>
                                </div>
                                <div>{room.users.length}/5</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex w-full justify-around">
                    {[{
                        icon: <PlusIcon />,
                        text: "สร้างห้อง",
                        onClick: () => {
                            push("/createroom")
                        },
                    }, {
                        icon: <LogInIcon />,
                        text: "เข้าร่วมห้อง",
                        onClick: () => {
                            push("/joinroom")
                        },
                    }].map(({ icon, text, onClick }, index) => (
                        <div key={index} onClick={onClick} className="flex flex-col items-center justify-center w-full border min-h-[5rem] cursor-pointer hover:bg-gray-100">
                            {icon}
                            <div>
                                {text}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
