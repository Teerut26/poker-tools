// use in backend
import { RoomInterface } from "@/interfaces/RoomInterface";
import { pb, pbAuth } from "@/utils/pocketbase";

type Room = {
  name: string;
  pot: number;
  users?: string[];
};

export const createRoom = async (data: Room): Promise<RoomInterface> => {
  const pocketbase = await pbAuth(pb);
  const record = await pocketbase.collection("room").create<RoomInterface>({
    name: data.name,
    pot: data.pot,
    users: data.users || [],
  });
  return record;
};

type Join = {
  user_record_id: string;
  record_id: string;
};

export const joinRoom = async (data: Join) => {
  const pocketbase = await pbAuth(pb);
  const record_old = await pb.collection("room").getOne<RoomInterface>(data.record_id);
  const record = await pocketbase.collection("room").update<RoomInterface>(data.record_id, {
    users: [...record_old.users, data.user_record_id],
  });
  return record;
};

type Reset = {
  record_id: string;
};

export const resetRoom = async (data: Reset) => {
  const pocketbase = await pbAuth(pb);
  const record = await pocketbase.collection("room").update<RoomInterface>(data.record_id, {
    pot: 0,
  });
  return record;
};
