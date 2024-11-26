import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const salesRouter = createTRPCRouter({
  getSales: publicProcedure
  .input(z.object({
    from:z.date(),
    to:z.date(),
  }))
  .query(({ ctx , input:{from, to}}) => {
    return ctx.db.transaction.findMany({
        where : {
          status : "DONE",
          createdAt:{
            gte:from,
            lte:to
          }
        },
        include : {
          orders : {
            include : {
              product_price : true,
              product : {
                include : {
                  category : true
                }
              }
            }
          }
        }
    })
}),
populate: publicProcedure
.mutation(async({ ctx }) => {
  const transactions = await ctx.db.transaction.findMany({
    include : {
      orders : {
        include : {
          product_price : true
        }
      }
    }
  })
  return await Promise.all(transactions?.map((trans)=>{
    return ctx.db.transaction.update({
      where : {
        id:trans.id
      },
      data : {
        total_amount : trans.orders.reduce((acc, curr)=>acc+curr.product_price.price,0)
      }
    })
  }))
}),
});
