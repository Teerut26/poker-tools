import mqttClient from "@/utils/mqttClient";
import { ChangeEvent, ChangeEventHandler, useEffect, useState } from "react";

export default function Home() {
    const [roomName, setRoomName] = useState<string>()

    const handleCreateRoom = () => {
        
    }

    const onChangeRoomName = (e: ChangeEvent<HTMLInputElement>) => {
        setRoomName(e.target.value)
    }

    return (
        <div className="min-h-screen flex justify-center items-center">
            <div className="max-w-sm flex flex-col gap-2">
                <h2 className="card-title">สร้างห้อง</h2>
                <input onChange={onChangeRoomName} type="text" placeholder="Room name" className="input input-bordered w-full" />
                <button className="btn btn-primary">
                    สร้าง
                </button>
            </div>
        </div>
    );
}
