import { UserInterface } from "@/interfaces/UserInterface";
import { pb } from "@/utils/pocketbase";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ClientResponseError } from "pocketbase";
import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

export default function useUserHook() {
  const [user, setUser] = useLocalStorage<UserInterface>("user", {} as UserInterface);
  const { data: session } = useSession()
  const { push } = useRouter();

  //check if user exists
  useEffect(() => {
    if (session?.user.pocketbaseid) {
      (async () => {
        try {
          const selfUserData = await pb.collection("user").getOne<UserInterface>(session?.user.pocketbaseid);
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
      pb.collection("user").subscribe<UserInterface>(session?.user.pocketbaseid, function (e) {
        if (e.action === "update") {
          updateUser(e.record);
        } else if (e.action === "delete") {
            logout();
        }
      });
    }
  }, [session?.user.pocketbaseid]);

  const updateUser = (user: UserInterface) => {
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    signOut();
  };

  return { user, updateUser, logout };
}
