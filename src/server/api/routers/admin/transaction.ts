import { z } from "zod";
/* eslint-disable @typescript-eslint/consistent-indexed-object-style */

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { $Enums, barangays, customer, delivery_rider, orders, product_price_history, products, transaction } from "@prisma/client";
import { endOfDay, startOfDay } from "date-fns";

export const transactionRouter = createTRPCRouter({
  getAdminOrders: publicProcedure
    .input(z.object({
      admin_id: z.number()
    }))
    .query(({ ctx, input: { admin_id } }) => {
      const data: {
        [key: string]: {
          id: string;
          status: $Enums.transaction_status;
          customer_name: string;
          customer_contact?: string;
          sub_total: number;
          delivery_fee: number;
          total_amount: number;
          total_transactions: number;
          createdAt: Date;
          barangay: string;
          transactions: (transaction & {
            orders: (orders & { product: products; product_price:product_price_history })[];
            customer?: (customer & { barangay: barangays }) | null
          })[];
          rider: delivery_rider | null;
          grouped_delivery_id:number|null
        };
      } = {}
      return ctx.db.transaction.findMany({
        where: {
          admin_id,
          transaction_type: "DELIVERY",
        },
        include: {
          rider: true,
          orders: {
            include: {
              product: true,
              product_price : true
            }
          },
          grouped_delivery : true,
          customer: {
            include: {
              barangay: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      }).then((transactions) => {
        transactions.forEach((transaction) => {
          const findData = data[transaction.customer_id + transaction.status + transaction.grouped_delivery_id||"" ]
          data[transaction.customer_id + transaction.status + transaction.grouped_delivery_id||"" ] = {
            id: transaction.customer_id + transaction.status + transaction.grouped_delivery_id||"" ,
            status: transaction.status,
            rider: transaction.rider,
            grouped_delivery_id: transaction.grouped_delivery_id || null,
            barangay: transaction.customer?.barangay.barangay_name || "",
            transactions: findData?.transactions.length ? [transaction, ...findData.transactions] : [transaction],
            createdAt: transaction.createdAt,
            customer_name: `${transaction.customer?.first_name} ${transaction.customer?.middle_name[0]}. ${transaction.customer?.last_name}`,
            customer_contact: transaction.customer?.contact_number,
            sub_total: (findData?.sub_total || 0) + transaction.total_amount,
            delivery_fee: transaction.grouped_delivery?.delivery_fee || transaction.customer?.barangay.barangay_delivery_fee || 0,
            total_amount: (transaction.customer?.barangay.barangay_delivery_fee || 0) + (findData?.sub_total || 0) + transaction.total_amount,
            total_transactions: (findData?.total_transactions || 0) + 1
          }
        })
        const returnData = Object.values(data)
        return returnData
      })
    }),
  getAdminOrder: publicProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(({ ctx, input: {
      id
    } }) => {
      return ctx.db.transaction.findUnique({
        where: {
          id,
        },
        include: {
          orders: {
            include: {
              product: true,
              product_price:true
            }
          },
          customer: true,
          rider: true,
          grouped_delivery : true
        }
      }).then((transaction) => {
        if (transaction) {
          return {
            status: transaction.status,
            order_date: transaction.createdAt,
            order_details: {
              orders: transaction.orders.map(order => ({
                product_name: order.product.product_name,
                quantity: order.quantity,
                price: order.product_price.price
              })),
              sub_total: transaction.total_amount,
              delivery_fee: transaction.grouped_delivery?.delivery_fee || 0
            },
            customer_info: {
              name: `${transaction.customer?.first_name} ${transaction.customer?.middle_name[0]}. ${transaction.customer?.last_name}`,
              contact_number: transaction.customer?.contact_number
            },
            delivery_info: transaction.rider ? {
              name: `${transaction.rider.first_name} ${transaction.rider.middle_name[0]}. ${transaction.rider.last_name}`,
              contact_number: transaction.rider.contact_number
            } : null
          }
        } else {
          throw new Error("Transaction not found")
        }
      })
    }),
  assignRiderToTransaction: publicProcedure
    .input(z.object({
      transaction_ids: z.array(z.number()),
      rider_id: z.number(),
      delivery_fee: z.number(),
    }))
    .mutation(async ({ ctx, input: {
      transaction_ids,
      rider_id,
      delivery_fee
    } }) => {
      const settings = await ctx.db.settings.findFirst()
      if (settings) {
        return  await ctx.db.grouped_delivery_by_customer.create({
          data : {
            rider_id,
            delivery_fee
          }
        }).then(async(data)=>{
          return await ctx.db.transaction.updateMany({
            where : {
              id : {
                in : transaction_ids,
              },
            },
            data : {
              delivery_rider_id:rider_id,
              grouped_delivery_id : data.id,
              status : "ONGOING"
            }
          })
        })
      } else {
        return null
      }
    }),
  cancelTransaction: publicProcedure
    .input(z.object({
      transaction_ids: z.array(z.number()),
      grouped_delivery_id:z.number()
    }))
    .mutation(async({ ctx, input: {
      transaction_ids,
      grouped_delivery_id
    } }) => {
      await ctx.db.grouped_delivery_by_customer.update({
        where : {
          id: grouped_delivery_id
        }, 
        data : {
          status:"CANCELLED"
        }
      })
      return ctx.db.transaction.updateMany({
        where: {
          id: {
            in:transaction_ids
          }
        },
        data: {
          status: "CANCELLED",
          grouped_delivery_id : grouped_delivery_id
        }
      })
    }),
  doneTransaction: publicProcedure
  .input(z.object({
    transaction_ids: z.array(z.number()),
    grouped_delivery_id:z.number()
  }))
  .mutation(async({ ctx, input: {
    transaction_ids,
    grouped_delivery_id
  } }) => {
    await ctx.db.grouped_delivery_by_customer.update({
      where : {
        id: grouped_delivery_id
      }, 
      data : {
        status:"DONE"
      }
    })
    return ctx.db.transaction.updateMany({
      where: {
        id: {
          in:transaction_ids
        }
      },
      data: {
        status: "DONE",
        grouped_delivery_id : grouped_delivery_id
      }
    })
  }),
  getTransactionsByStatus: publicProcedure
    .input(z.object({
      admin_id: z.number(),
      transaction_type: z.enum(["DINE_IN", "DELIVERY", "PICK_UP", "ALL"]),
      date: z.object({
        from: z.date(),
        to: z.date()
      })
    }))
    .query(({ ctx, input: {
      admin_id,
      transaction_type,
      date
    } }) => {
      const whereTransactionType = transaction_type === "ALL" ? {} : { transaction_type: transaction_type }
      return ctx.db.transaction.findMany({
        where: {
          admin_id,
          status: "DONE",
          createdAt: {
            gte: startOfDay(date.from),
            lte: endOfDay(date.to)
          },
          ...whereTransactionType
        },
        include: {
          cashier: true,
          rider: true,
          customer: true,
          grouped_delivery:true
        },
        orderBy:{
          updatedAt:"desc"
        }
      }).then((transacs) => {
        const transactions = transacs.map((transaction) => {
          return {
            id: transaction.id,
            total_amount: transaction.total_amount,
            transact_by: transaction.rider || transaction.cashier,
            transact_by_type: transaction.rider ? "Rider" : "Cashier",
            transaction_type: transaction.rider ? "DELIVERY" : "DINE_IN",
            delivery_fee: transaction.grouped_delivery?.delivery_fee,
          }
        })
        const total_sub_total = transactions.reduce(
          (accumulator, currentValue) => accumulator + currentValue.total_amount,
          0,
        );
        const total_delivery_fee = transactions.reduce(
          (accumulator, currentValue) => accumulator + (currentValue.delivery_fee || 0),
          0,
        );
        return {
          transactions,
          total_transactions: transactions.length,
          total_sub_total,
          total_delivery_fee,
          total_amount: total_sub_total + total_delivery_fee,
        }

      })
    }),
});
