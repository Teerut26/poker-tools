import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { betUser, createUser, winnerUser } from "@/controllers/userController";

export const userRouter = createTRPCRouter({
  create: publicProcedure.input(z.object({ name: z.string() })).mutation(({ input }) => {
    return createUser({ name: input.name });
  }),
  bet: publicProcedure.input(z.object({ room_id: z.string(), record_id: z.string(), money: z.number() })).mutation(({ input }) => {
    return betUser({ record_id: input.record_id, money: Math.abs(input.money), room_record_id: input.room_id });
  }),
  winner: publicProcedure.input(z.object({ user_record_id: z.string(), room_record_id: z.string() })).mutation(({ input }) => {
    return winnerUser({ user_record_id: input.user_record_id, room_record_id: input.room_record_id });
  }),
});
