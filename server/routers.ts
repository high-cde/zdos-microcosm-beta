import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { fetchZdosNodeStatus } from "../lib/zdos-node-status";
import { getZcommCatalog, getZcommServicePage } from "../lib/zcomm-service";
import { z } from "zod";
import { appendEvidenceReceipt, listEvidenceReceipts } from "./db";
import { validateZlangService } from "../lib/zlang-validator-service";

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

  evidence: router({
    list: protectedProcedure.query(({ ctx }) => listEvidenceReceipts(ctx.user.id)),
    append: protectedProcedure.input(z.object({
      eventId: z.string().min(1).max(128),
      operation: z.string().min(1).max(128),
      status: z.string().min(1).max(32),
      detail: z.string().max(2000),
      ztrace: z.string().max(32).optional(),
    })).mutation(({ ctx, input }) => appendEvidenceReceipt({ ...input, userId: ctx.user.id })),
  }),

  zlang: router({
    validate: publicProcedure.input(z.object({ profile: z.string().max(96), source: z.string().max(12000) })).query(({ input }) => validateZlangService(input.profile, input.source)),
  }),

});

export type AppRouter = typeof appRouter;
