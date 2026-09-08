import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { fetchZdosNodeStatus } from "../lib/zdos-node-status";
import { getZcommCatalog, getZcommServicePage } from "../lib/zcomm-service";
import { z } from "zod";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  node: router({
    status: publicProcedure.query(() => fetchZdosNodeStatus()),
  }),

  zcomm: router({
    catalog: publicProcedure.query(() => getZcommCatalog()),
    page: publicProcedure.input(z.object({ code: z.string().regex(/^\*\d{2}#$/) })).query(({ input }) => getZcommServicePage(input.code)),
  }),

});

export type AppRouter = typeof appRouter;
