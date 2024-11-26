import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { $Enums, barangays, customer, delivery_rider, orders, product_price_history, products, transaction } from "@prisma/client";

export const customerTransactionRouter = createTRPCRouter({
  getCustomerTransactions: publicProcedure
    .input(z.object({
      customer_id: z.number()
    }))
    .query(async ({ ctx, input: { customer_id } }) => {
      // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
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
       return await ctx.db.transaction.findMany({
        where: {
          customer_id,
        },
        orderBy: {
          createdAt: "desc"
        },
        include: {
          orders: {
            include: {
              product: true,
              product_price : true
            }
          },
          customer: {
            include: {
              barangay: true
            }
          },
          grouped_delivery: true,
          rider: true
        }
      }).then((transactions) => {
        transactions.forEach((transaction) => {
          const findData = data[transaction.customer_id + transaction.status + transaction.grouped_delivery_id || ""]
          data[transaction.customer_id + transaction.status + transaction.grouped_delivery_id || ""] = {
            id: transaction.customer_id + transaction.status + transaction.grouped_delivery_id || "",
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
  cancelTransaction: publicProcedure
    .input(z.object({
      transaction_ids: z.array(z.number())
    }))
    .mutation(async ({ ctx, input: { transaction_ids } }) => {
      return await ctx.db.transaction.updateMany({
        where: {
          id: {
            in : transaction_ids
          },
          status: "PENDING"
        },
        data: {
          status: "CANCELLED"
        }
      })
    }),
});
