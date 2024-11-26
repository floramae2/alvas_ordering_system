import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const riderTransactionRouter = createTRPCRouter({
  getRiderTransactions: publicProcedure
    .input(z.object({
      delivery_rider_id: z.number()
    }))
    .query(async ({ ctx, input: { delivery_rider_id } }) => {
      return await ctx.db.grouped_delivery_by_customer.findMany({
        where: {
          rider_id:delivery_rider_id,
        },
        orderBy: {
          createdAt: "desc"
        },
        include: {
          rider: true,
          transactions: {
            include: {
              orders: {
                include: {
                  product: true,
                  product_price:true
                }
              },
              customer: true
            },
          },
        },
      })
    }),
});
