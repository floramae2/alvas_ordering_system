import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const cashierTransactionRouter = createTRPCRouter({
    getTransactions: publicProcedure
    .input(z.object({ 
        cashier_id: z.number(),
        from: z.date(),
        to: z.date()
     }))
    .query(async({ input : { cashier_id, from, to }, ctx }) => {
        return await ctx.db.transaction.findMany({
            where : {
                createdAt : {
                    lte : to,
                    gte : from
                },
                cashier_id
            },
            orderBy : {
                createdAt : "desc"
            },
            include : {
                grouped_delivery:true,
                orders : {
                    include : {
                        product : {
                            select : {
                                amount : true,
                                product_name : true
                            }
                        }
                    }
                }
            }
        })
    }),
    deleteTransaction: publicProcedure
    .input(z.object({ 
        transaction_id: z.number(),
     }))
    .mutation(async({ input : { transaction_id }, ctx }) => {
        return await ctx.db.transaction.delete({
            where : {
                id: transaction_id
            },
        })
    }),
});
