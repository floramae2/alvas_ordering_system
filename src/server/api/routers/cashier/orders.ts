import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const cashierOrderRouter = createTRPCRouter({
    getProducts: publicProcedure
      .query(async ({ctx}) => {
        const categories = await ctx.db.product_category.findMany()
          const products = await ctx.db.products.findMany({
            include : {
              price_history:{
                orderBy : {
                  createdAt:"desc"
                }
              }
            }
          })
          if(categories && products){
            return categories.map((cat)=>{
                return {
                    category : cat.category_name,
                    products : products.filter((prod)=>prod.category_id === cat.id)
                }
            })
          }else {
            throw new Error("No Products Found")
          }
      }),
      confirmCashierOrders :  publicProcedure
      .input(z.object({
        total_amount :z.number(),
        // admin_id          Int
        cashier_id :z.number(),
        orders : z.array(z.object({
          product_id :z.number(),
          quantity : z.number(),
          product_price_id: z.number()
        }))
      }))
      .mutation(async({ input : {
        cashier_id,
        total_amount,
        orders
      }, ctx }) => {
        const cashier = await ctx.db.cashier.findUnique({
          where : {
            id: cashier_id
          }
        })
        if(cashier) {
          return await ctx.db.transaction.create({
            data : {
              total_amount,
              cashier_id,
              admin_id : cashier.admin_id,
              transaction_type : "DINE_IN",
              status : "DONE",
              orders : {
                createMany : {
                  data : orders
                } 
              }
            }
          })
        }else {
          throw new Error("No Cashier Found")
        }
      }),
});
