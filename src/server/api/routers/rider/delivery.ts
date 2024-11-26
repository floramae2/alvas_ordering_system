import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const riderDeliveryRouter = createTRPCRouter({
  getTransactionsForDelivery: publicProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ ctx, input: { id } }) => {
      return await ctx.db.grouped_delivery_by_customer.findMany({
        where: {
          rider_id: id,
          status: "ONGOING"
        },
        include: {
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
        orderBy: {
          createdAt: "desc"
        }
      })
    }),
  getTransactionsDelivered: publicProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ ctx, input: { id } }) => {
      return await ctx.db.grouped_delivery_by_customer.findMany({
        where: {
          rider_id: id,
          status: "DELIVERED"
        },
        include: {
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
        orderBy: {
          createdAt: "desc"
        }
      })
    }),
  cancelTransaction: publicProcedure
    .input(z.object({
      id: z.number()
    }))
    .mutation(async ({ ctx, input: { id } }) => {
      const updateTransaction = await ctx.db.transaction.updateMany({
        where : {
          grouped_delivery_id : id
        },data: {
          status: "CANCELLED"
        }
      })
      const updateGroupTransaction = await ctx.db.grouped_delivery_by_customer.update({
        where: {
          id: id,
          status: "ONGOING"
        },
        data: {
          status: "CANCELLED"
        }
      })
      return await Promise.all([
        updateGroupTransaction,
        updateTransaction
      ])
    }),
  transactionDelivered: publicProcedure
    .input(z.object({
      id: z.number()
    }))
    .mutation(async ({ ctx, input: { id } }) => {
      const updateTransaction = await ctx.db.transaction.updateMany({
        where : {
          grouped_delivery_id : id
        },data: {
          status: "DELIVERED"
        }
      })
      const updateGroupTransaction = await ctx.db.grouped_delivery_by_customer.update({
        where: {
          id: id,
          status: "ONGOING"
        },
        data: {
          status: "DELIVERED"
        }
      })
      return await Promise.all([
        updateGroupTransaction,
        updateTransaction
      ])
    }),
});
