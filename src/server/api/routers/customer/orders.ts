import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const customerOrderRouter = createTRPCRouter({
    getProducts: publicProcedure
      .query(async ({ctx}) => {
        const categories = await ctx.db.product_category.findMany()
          const products = await ctx.db.products.findMany({
            include : {
              price_history: {
                orderBy : {
                  createdAt : "desc"
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
      confirmCustomerOrders :  publicProcedure
      .input(z.object({
        total_amount :z.number(),
        // admin_id          Int
        customer_id :z.number(),
        orders : z.array(z.object({
          product_id :z.number(),
          quantity : z.number(),
          product_price_id : z.number()
        }))
      }))
      .mutation(async({ input : {
        customer_id,
        total_amount,
        orders
      }, ctx }) => {
        const admin = await ctx.db.admin.findFirst()
        const customer = await ctx.db.customer.findUnique({
          where : {
            id: customer_id
          }
        })
        if(admin && customer) {
          return await ctx.db.transaction.create({
            data : {
              total_amount,
              customer_id:customer.id,
              admin_id : admin.id,
              transaction_type : "DELIVERY",
              status : "PENDING",
              orders : {
                createMany : {
                  data : orders
                } 
              },
            }
          })
        }else {
          throw new Error("No Customer Found")
        }
      }),
});
