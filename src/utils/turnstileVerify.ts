import { env } from "@/env.mjs";
import axios from "axios";
import FormData from "form-data";

type TurnstileVerify = {
  token: string;
  remoteip: string;
};

const turnstileVerify = async (data: TurnstileVerify) => {
  const formData = new FormData();
  formData.append("secret", env.TURNSTILE_SECRET);
  formData.append("response", data.token);
  formData.append("remoteip", data.remoteip);

  const { data: res } = await axios({
    method: "post",
    maxBodyLength: Infinity,
    url: "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    headers: {
      ...formData.getHeaders(),
    },
    data: formData,
  });

  if (!res.success) {
    return false;
  }

  return true;
};

export default turnstileVerify;
