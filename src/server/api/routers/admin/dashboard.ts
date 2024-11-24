

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { setHours, startOfMonth } from "date-fns";

export const dashboardRouter = createTRPCRouter({
  dashboardData: publicProcedure
    .query(async ({ ctx }) => {
        const salesThisMonth = () => ctx.db.transaction.aggregate({
            where : {
                status : "DONE",
                updatedAt : {
                    gte : startOfMonth(setHours(new Date, 0)),
                    lte : setHours(new Date(), 24),
                }
            },
            _sum : {
                total_amount : true,
            }
        }).then(({ _sum : { total_amount }})=>((total_amount||0)))

        const overAllSales = () => ctx.db.transaction.aggregate({
            where : {
                status : "DONE",
            },
            _sum : {
                total_amount : true
            }
        }).then(({ _sum : { total_amount }})=>((total_amount||0)))

        const totalUsers = () => ctx.db.customer.count()

        const totalProducts = () => ctx.db.products.count({
            where : { status :"AVAILABLE"}
        })

        const preShowOrders = () => ctx.db.transaction.findMany({
            where :{
                transaction_type : "DELIVERY"
            },
            take : 5,
             include : {
                customer :true,
                grouped_delivery:true
             },
             orderBy : {
                createdAt : "desc"
             }
        }).then((data)=> data.map((cust)=>{
            return {
                id:cust.id,
                customer : `${cust.customer?.first_name} ${cust.customer?.middle_name[0]}. ${cust.customer?.last_name}`,
                contact : cust.customer?.contact_number || "",
                status : cust.status,
                total_amount : (cust.grouped_delivery?.delivery_fee || 0) + cust.total_amount
            }
        }))

        const preShowTransactions = () => ctx.db.transaction.findMany({
            take : 5,
             include : {
                rider :true,
                cashier : true,
                grouped_delivery:true
             },
             orderBy : {
                createdAt : "desc"
             }
        }).then((data)=> data.map((cust)=>{
            const proccessed_by = cust.rider || cust.cashier
            return {
                id:cust.id,
                proccessed_by : `${proccessed_by?.first_name} ${proccessed_by?.middle_name[0]}. ${proccessed_by?.last_name}`,
                type : cust.rider ? "Rider" : "Cashier",
                total_amount : (cust.grouped_delivery?.delivery_fee || 0) + cust.total_amount
            }
        }))
        
        const datas = await Promise.all([
            salesThisMonth(),
            totalUsers(),
            totalProducts(),
            overAllSales(),
            preShowOrders(),
            preShowTransactions()
        ])

        return {
            salesThisMonth:datas[0],
            totalUsers:datas[1],
            totalProducts: datas[2],
            overAllSales : datas[3],
            preShowOrders : datas[4],
            preShowTransactions : datas[5]
        }
    }),
});
