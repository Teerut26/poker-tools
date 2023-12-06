// use in backend
import { RoomInterface } from "@/interfaces/RoomInterface";
import { pb, pbAuth } from "@/utils/pocketbase";

type Room = {
  name: string;
  password?: string;
  pot: number;
  users?: string[];
};

export const createRoom = async (data: Room): Promise<RoomInterface> => {
  const pocketbase = await pbAuth(pb);
  const record = await pocketbase.collection("room").create<RoomInterface>({
    name: data.name,
    password: data.password,
    pot: data.pot,
    users: data.users || [],
  });
  return record;
};

type Join = {
  password?: string;
  user_record_id: string;
  record_id: string;
};

export const joinRoom = async (data: Join) => {
  const pocketbase = await pbAuth(pb);
  const record_for_check = await pb.collection("room").getOne<RoomInterface>(data.record_id);
  if (record_for_check.password && record_for_check.password !== data.password) {
    throw new Error("Wrong password");
  }
  const record = await pocketbase.collection("room").update<RoomInterface>(data.record_id, {
    users: [...record_for_check.users, data.user_record_id],
  });
  return record;
};

type Reset = {
  record_id: string;
  owner_record_id: string;
};

export const resetRoom = async (data: Reset) => {
  const pocketbase = await pbAuth(pb);
  const record_old = await pb.collection("room").getOne<RoomInterface>(data.record_id);

  if (record_old.users[0] !== data.owner_record_id) {
    throw new Error("You are not the owner of this room");
  }

  const record = await pocketbase.collection("room").update<RoomInterface>(data.record_id, {
    pot: 0,
  });
  return record;
};
