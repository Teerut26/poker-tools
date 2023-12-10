import { RedeemInterface } from "@/interfaces/RedeemInterface";
import { RoomInterface } from "@/interfaces/RoomInterface";
import { UserInterface } from "@/interfaces/UserInterface";
import { pb, pbAuth } from "@/utils/pocketbase";
import { ClientResponseError } from "pocketbase";

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

type ChangeName = {
  name: string;
  user_record_id: string;
};

export const changeName = async (data: ChangeName) => {
  const pocketbase = await pbAuth(pb);
  const record = await pocketbase.collection("user").update<UserInterface>(data.user_record_id, {
    name: data.name,
  });
  return record;
};

type Redeem = {
  code: string;
  user_record_id: string;
};

export const redeem = async (data: Redeem) => {
  const pocketbase = await pbAuth(pb);
  const redeemExit = await pocketbase.collection("redeem").getList<RedeemInterface>(1, 2, {
    filter: `code="${data.code}" `,
  });

  const redeemItem = redeemExit.items[0];

  if (!redeemItem) {
    throw new Error("Code not found");
  }

  if (redeemItem.quote <= 0) {
    throw new Error("Code has used its full quota.");
  }

  if (redeemItem.users.includes(data.user_record_id)) {
    throw new Error("Code is used");
  }

  console.log("asdfdsf");

  const result = await pocketbase.collection("redeem").update<RedeemInterface>(redeemExit.items[0]?.id!, {
    "quote-": 1,
    users: [...redeemItem?.users!, data.user_record_id],
  });

  await pocketbase.collection("user").update<UserInterface>(data.user_record_id, {
    "money+": redeemItem.value,
  });

  return result.value;
};
