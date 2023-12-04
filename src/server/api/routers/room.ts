import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { createRoom, joinRoom } from "@/controllers/roomController";

export const roomRouter = createTRPCRouter({
  create: publicProcedure.input(z.object({ roomname: z.string() })).mutation(({ input }) => {
    return createRoom({ name: input.roomname, pot: 0 });
  }),
  join: publicProcedure.input(z.object({ record_id: z.string(), user_record_id: z.string() })).mutation(({ input }) => {
    return joinRoom({ record_id: input.record_id, user_record_id: input.user_record_id });
  }),
});
