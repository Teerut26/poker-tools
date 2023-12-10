import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { betUser, changeName, createUser, winnerUser } from "@/controllers/userController";

export const userRouter = createTRPCRouter({
  create: protectedProcedure.input(z.object({ name: z.string() })).mutation(({ input, ctx }) => {
    return createUser({ name: input.name });
  }),
  bet: protectedProcedure.input(z.object({ room_id: z.string(), record_id: z.string(), money: z.number() })).mutation(({ input, ctx }) => {
    return betUser({ record_id: input.record_id, money: Math.abs(input.money), room_record_id: input.room_id });
  }),
  winner: protectedProcedure.input(z.object({ user_record_id: z.string(), room_record_id: z.string() })).mutation(({ input, ctx }) => {
    return winnerUser({ user_record_id: input.user_record_id, room_record_id: input.room_record_id, owner_record_id: ctx.session.user.pocketbaseid });
  }),
  changeName: protectedProcedure.input(z.object({ name: z.string() })).mutation(({ input, ctx }) => {
    return changeName({ name: input.name, user_record_id: ctx.session.user.pocketbaseid! });
  }),
});
