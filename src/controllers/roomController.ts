// use in backend
import { RoomInterface } from "@/interfaces/RoomInterface";
import { UserInterface } from "@/interfaces/UserInterface";
import { pb, pbAuth } from "@/utils/pocketbase";
import bcrypt from "bcrypt";

type Room = {
  name: string;
  password?: string;
  pot: number;
  users?: string[];
  owner: string;
};

export const createRoom = async (data: Room): Promise<RoomInterface> => {
  const pocketbase = await pbAuth(pb);
  let passwordHash = null;

  if (data.password) {
    passwordHash = await bcrypt.hash(data.password, 10);
  }

  const record = await pocketbase.collection("room").create<RoomInterface>({
    name: data.name,
    password: passwordHash,
    pot: data.pot,
    users: data.users || [],
    owner: data.owner,
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

  if (data.password) {
    const passwordCheckResult = await bcrypt.compare(data.password!, record_for_check.password!);
    if (!passwordCheckResult) {
      throw new Error("Wrong password");
    }
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

type Delete = {
  record_id: string;
  owner_record_id: string;
};

export const deleteRoom = async (data: Delete) => {
  const pocketbase = await pbAuth(pb);
  const record_old = await pb.collection("room").getOne<RoomInterface>(data.record_id);

  if (record_old.users[0] !== data.owner_record_id) {
    throw new Error("You are not the owner of this room");
  }

  const record = await pocketbase.collection("room").delete(data.record_id);
  return record;
};
