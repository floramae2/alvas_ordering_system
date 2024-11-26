import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const productRouter = createTRPCRouter({
    getAllProducts: publicProcedure.query(({ ctx }) => {
        return ctx.db.products.findMany({
            include:{
                price_history:{
                    orderBy : {
                        createdAt:"desc"
                    }
                },
                category:true,
                orders:true
            }
        })
    }),
    getProduct :publicProcedure.input(z.object({
        id:z.number().optional()
    })).query(({ctx, input})=>{
        return ctx.db.products.findUnique({
            where:{
                id:input.id
            },
            include : {
                price_history : {
                    orderBy : {
                        createdAt : "desc"
                    }
                }
            }
        })
    }),
    deleteProduct : publicProcedure.input(z.object({
        id:z.number()
    })).mutation(({ctx, input})=>{
        return ctx.db.products.delete({
            where:{
                id:input.id
            }
        })
    }),
    toggleArchiveProduct : publicProcedure.input(z.object({
        id:z.number(),
        status :z.enum(["AVAILABLE", "NOT_AVAILABLE"])
    })).mutation(({ctx, input})=>{
        return ctx.db.products.update({
            where:{
                id:input.id
            },
            data:{
                status :input.status
            }
        })
    }),
    upsertProduct: publicProcedure
        .input(z.object({
            id: z.number().nullish(),
            image_url: z.string(),
            product_name: z.string(),
            category_id: z.number(),
            amount: z.coerce.number(),
            admin_id: z.number()
        }))
        .mutation(async({ input, ctx }) => {
            const product = await ctx.db.products.findUnique({
                where : { id : input.id || 0},
                include : {
                    price_history : {
                        orderBy : {
                            createdAt : "desc"
                        }
                    }
                }
            })
            return await ctx.db.products.upsert({
                where: {
                    id: input.id || 0
                },
                create: {
                    image_url: input.image_url,
                    product_name: input.product_name,
                    category_id: input.category_id,
                    admin_id: input.admin_id,
                    price_history : {
                        create : [{
                            price : input.amount
                        }]
                    }
                },
                update: {
                    image_url: input.image_url,
                    product_name: input.product_name,
                    category_id: input.category_id,
                    price_history : {
                        create : product?.price_history[0]?.price !== input.amount ? [{
                            price : input.amount
                        }] : []
                    } 
                },
                include:{
                    price_history:true
                }
            })
        }),
})