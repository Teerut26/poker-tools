import { UserInterface } from "@/interfaces/UserInterface";
import { pb } from "@/utils/pocketbase";
import { useRouter } from "next/navigation";
import { ClientResponseError } from "pocketbase";
import { useEffect, useState } from "react";

export default function useUserHook() {
  const [user, setUser] = useState<UserInterface>();
  const { push } = useRouter();

  //check if user exists
  useEffect(() => {
    const userRaw = JSON.parse(localStorage.getItem("user") || "null") as UserInterface;
    if (userRaw) {
      (async () => {
        try {
          const selfUserData = await pb.collection("user").getOne<UserInterface>(userRaw?.id!);
          if (selfUserData) {
            updateUser(selfUserData);
          }
        } catch (error) {
          if (error instanceof ClientResponseError) {
            if (error.status === 404) {
              logout();
            }
          }
        }
      })();
      pb.collection("user").subscribe<UserInterface>(userRaw.id, function (e) {
        if (e.action === "update") {
          updateUser(e.record);
        } else if (e.action === "delete") {
            logout();
        }
      });
    } else {
      push("/createuser");
    }
  }, []);

  const updateUser = (user: UserInterface) => {
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(undefined);
    push("/createuser");
  };

  return { user, updateUser, logout };
}
