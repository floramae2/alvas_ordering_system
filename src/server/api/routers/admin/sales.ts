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
});
