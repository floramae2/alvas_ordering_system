'use client'
import React, { useEffect } from "react"
import {
    Card,
} from "@/components/ui/card"
import { api } from "@/trpc/react"
import Loading from "../_components/loading"
import { useState } from "react"
import { useParams } from "next/navigation"
import { ViewTransactionModal } from "./_components/view-transaction-modal"
import { customer, grouped_delivery_by_customer, type delivery_rider, type orders, type products, type transaction, product_price_history } from "@prisma/client"
import DoneTable from "./_components/done-table"
import CancelledTable from "./_components/cancelled-table"

const statuses = ["DONE", "CANCELLED"] as ("DONE"| "CANCELLED")[]

export type TransactionType = grouped_delivery_by_customer & {
    transactions : (transaction & {
        orders: (orders & { product: products; product_price:product_price_history })[],
        customer: customer | null
    })[];
    rider : delivery_rider
}

const Page = () => {
    const {id} = useParams()
    const [status, setStatus] = useState<"DONE"| "CANCELLED">("DONE")
    const [selectedTransaction ,setSelectedTransaction] = useState<TransactionType | undefined>(undefined)
    const [transactions, setTransactions] = useState<TransactionType[]>([])

    const { data, isLoading} = api.user_rider.transaction.getRiderTransactions.useQuery({
        delivery_rider_id: Number(id),
    }, {
        enabled : !Number.isNaN(Number(id))
    })
    
    useEffect(()=>{
        if(data){
            setTransactions(data.filter(tra=>{
                return tra.status===status
            }))
        }
    },[data, status])
    return (

        <div className="mx-auto grid w-full p-2">
            <ViewTransactionModal status={status} open={selectedTransaction} setOpen={setSelectedTransaction} setSelectedTransaction={setSelectedTransaction} />
            <div className="flex flex-row justify-between">
                <div>
                    <h1 className="text-base font-bold">Processed Deliveries</h1>
                    <p className="text-muted-foreground text-xs">View your done and cancelled deliveries records.</p>
                </div>
                <div>
                </div>
            </div>
            <div className="flex flex-1 flex-col gap-4 md:gap-8">
                <Card x-chunk="dashboard-01-chunk-0" className=" bg-transparent border-none shadow-none">
                    <div className=" grid grid-cols-2 gap-2 items-end p-0 z-50 bg-white mt-2 ">
                        {
                            statuses.map((s)=>{
                                return <div key={s} onClick={()=>setStatus(s)} className={`  rounded p-1 text-xs text-center text-slate-300 bg-slate-50 font-medium ${s === status && " bg-slate-700 text-white"}`}>
                                    {s ==="DONE" ? "COMPLETED" : s}
                                </div>
                            })
                        }
                    </div>
                    <div className=" relative rounded overflow-y-auto min-h-[300px] bg-white w-full grid mt-1" style={{ maxHeight: "80vh" }}>
                        {(isLoading) &&
                            <div className=" absolute bg-background opacity-50 z-10 top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                                <Loading />
                            </div>}
                        <div className=" flex flex-col gap-2 overflow-hidden">
                            {
                                status==="DONE" ? <DoneTable setSelectedTransaction={setSelectedTransaction} transactions={transactions}/> : 
                                <CancelledTable setSelectedTransaction={setSelectedTransaction} transactions={transactions}/>
                            }
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default Page;