import { z } from "zod";
import requestIp from "request-ip";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { createRoom, joinRoom, resetRoom, deleteRoom } from "@/controllers/roomController";
import turnstileVerify from "@/utils/turnstileVerify";

export const roomRouter = createTRPCRouter({
  create: protectedProcedure.input(z.object({ roomname: z.string(), roompassword: z.string().optional(), token: z.string() })).mutation(async ({ input, ctx }) => {
    
    const detectedIp = requestIp.getClientIp(ctx.req);
    const verify = await turnstileVerify({ token: input.token, remoteip: detectedIp! });
    if (!verify) {
      throw new Error("Invalid captcha");
    }

    return createRoom({ name: input.roomname, pot: 0, password: input.roompassword, owner: ctx.session.user.pocketbaseid });
  }),
  join: protectedProcedure.input(z.object({ record_id: z.string(), password: z.string().optional() })).mutation(({ input, ctx }) => {
    return joinRoom({ record_id: input.record_id, user_record_id: ctx.session.user.pocketbaseid, password: input.password });
  }),
  reset: protectedProcedure.input(z.object({ record_id: z.string() })).mutation(({ input, ctx }) => {
    return resetRoom({ record_id: input.record_id, owner_record_id: ctx.session.user.pocketbaseid });
  }),
  delete: protectedProcedure.input(z.object({ record_id: z.string() })).mutation(({ input, ctx }) => {
    return deleteRoom({ record_id: input.record_id, owner_record_id: ctx.session.user.pocketbaseid });
  }),
});
