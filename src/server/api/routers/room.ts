import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { createRoom, joinRoom, resetRoom, deleteRoom } from "@/controllers/roomController";

export const roomRouter = createTRPCRouter({
  create: publicProcedure.input(z.object({ roomname: z.string(), roompassword: z.string().optional(), user_record_id: z.string() })).mutation(({ input }) => {
    return createRoom({ name: input.roomname, pot: 0, password: input.roompassword, owner: input.user_record_id });
  }),
  join: publicProcedure.input(z.object({ record_id: z.string(), user_record_id: z.string(), password: z.string().optional() })).mutation(({ input }) => {
    return joinRoom({ record_id: input.record_id, user_record_id: input.user_record_id, password: input.password });
  }),
  reset: publicProcedure.input(z.object({ record_id: z.string(), owner_record_id: z.string() })).mutation(({ input }) => {
    return resetRoom({ record_id: input.record_id, owner_record_id: input.owner_record_id });
  }),
  delete: publicProcedure.input(z.object({ record_id: z.string(), owner_record_id: z.string() })).mutation(({ input }) => {
    return deleteRoom({ record_id: input.record_id, owner_record_id: input.owner_record_id });
  }),
});
