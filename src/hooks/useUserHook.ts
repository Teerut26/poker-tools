import { UserInterface } from "@/interfaces/UserInterface";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function useUserHook() {
  const [user, setUser] = useState<UserInterface>();
  const { push } = useRouter();
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setUser(JSON.parse(user));
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
