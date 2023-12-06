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
