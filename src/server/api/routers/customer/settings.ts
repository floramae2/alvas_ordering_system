
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";
export const customerSettingsRouter = createTRPCRouter({
  getSettings: publicProcedure
    .query(async ({ctx}) => {
      return await ctx.db.settings.findFirst()
    }),
    getSettingsDeliveryFee: publicProcedure
    .input(z.object({
      id :z.number(),
      }))
      .query(async ({ctx, input:{id}}) => {
        return await ctx.db.customer.findUnique({
          where:{
            id
          },
          select:{
            barangay:{
              select:{
                barangay_delivery_fee:true
              }
            }
          }
        })
      }),
});
