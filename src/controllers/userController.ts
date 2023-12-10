import { RoomInterface } from "@/interfaces/RoomInterface";
import { UserInterface } from "@/interfaces/UserInterface";
import { pb, pbAuth } from "@/utils/pocketbase";

type Create = {
  name: string;
};

export const createUser = async (data: Create) => {
  const pocketbase = await pbAuth(pb);
  const record = await pocketbase.collection("user").create<UserInterface>({
    name: data.name,
    money: 10000,
  });
  return record;
};

type Bet = {
  record_id: string;
  room_record_id: string;
  money: number;
};

export const betUser = async (data: Bet) => {
  const pocketbase = await pbAuth(pb);
  const oldRecord = await pocketbase.collection("user").getOne<UserInterface>(data.record_id);

  if (!oldRecord) {
    throw new Error("Record not found");
  }

  if (oldRecord.money < data.money) {
    throw new Error("Not enough money");
  }

  const record = await pocketbase.collection("user").update<UserInterface>(data.record_id, {
    "money-": data.money,
  });

  await pocketbase.collection("room").update<RoomInterface>(data.room_record_id, {
    "pot+": data.money,
  });

  return record;
};

type Winner = {
  user_record_id: string;
  room_record_id: string;
  owner_record_id: string;
};

export const winnerUser = async (data: Winner) => {
  const pocketbase = await pbAuth(pb);
  const roomData = await pocketbase.collection("room").getOne<RoomInterface>(data.room_record_id);

  if (roomData.owner !== data.owner_record_id) {
    throw new Error("Not owner");
  }

  const roomMoney = roomData?.pot || 0;

  const record = await pocketbase.collection("user").update<UserInterface>(data.user_record_id, {
    "money+": roomMoney,
  });

  await pocketbase.collection("room").update<RoomInterface>(data.room_record_id, {
    pot: 0,
  });

  return record;
};
