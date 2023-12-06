import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { createUser } from "@/controllers/userController";

export const userRouter = createTRPCRouter({
  create: publicProcedure.input(z.object({ name: z.string() })).mutation(({ input }) => {
    return createUser({ name: input.name });
  }),
});
