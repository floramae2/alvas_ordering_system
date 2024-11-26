'use client'
import React, { useEffect } from "react"
import {
    Card,
} from "@/components/ui/card"
import { api } from "@/trpc/react"
import Loading from "../_components/loading"
import { useState } from "react"
import { useParams } from "next/navigation"
import PendingTables from "./_components/pendings-table"
import { ViewTransactionModal } from "./_components/view-transaction-modal"
import { $Enums, barangays, customer, grouped_delivery_by_customer, type delivery_rider, type orders, type products, type transaction, product_price_history } from "@prisma/client"
import DoneTable from "./_components/done-table"
import CancelledTable from "./_components/cancelled-table"
import { LoaderCircle } from "lucide-react"

const statuses = ["ONGOING", "DONE", "CANCELLED"] as ("ONGOING"| "DONE"| "CANCELLED")[]

// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export type TransactionType = {
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
      orders: (orders & { product: products; product_price : product_price_history })[];
      customer?: (customer & { barangay: barangays }) | null
    })[];
    rider: delivery_rider | null;
    grouped_delivery_id:number|null
  }

const Page = () => {
    const {id} = useParams()
    const [status, setStatus] = useState<"ONGOING"| "DONE"| "CANCELLED">("ONGOING")
    const [selectedTransaction ,setSelectedTransaction] = useState<TransactionType | undefined>(undefined)
    const [transactions, setTransactions] = useState<TransactionType[]>([])

    const { data, isLoading, refetch, isRefetching} = api.user_customer.transaction.getCustomerTransactions.useQuery({
        customer_id: Number(id),
    }, {
        enabled : !Number.isNaN(Number(id))
    })
    
    useEffect(()=>{
        if(data){
            setTransactions(data.filter(tra=>{
                if(status === "ONGOING"){
                    if(tra.status==="ONGOING" || tra.status==="PENDING"){
                        return true
                    }else{
                        return false
                    }
                }else {
                    return tra.status===status
                }
            }))
        }
    },[data, status])
    return (

        <div className="mx-auto grid w-full p-2">
            <ViewTransactionModal  open={selectedTransaction} setOpen={setSelectedTransaction} setSelectedTransaction={setSelectedTransaction} />
            <div className="flex flex-row justify-between">
                <div>
                    <h1 className="text-base font-bold">Your Orders</h1>
                    <p className="text-muted-foreground text-xs">View your ongoing orders and records.</p>
                </div>
                <div>
                    <div className=" items-center justify-center p-1 text-sm font-medium bg-gray-100 rounded px-3" onClick={async()=>await refetch()}>{isRefetching? <LoaderCircle size={20} className=" animate-spin"/>:"Refresh"}</div>
                </div>
            </div>
            <div className="flex flex-1 flex-col gap-4 md:gap-8">
                <Card x-chunk="dashboard-01-chunk-0" className=" bg-transparent border-none shadow-none">
                    <div className=" grid grid-cols-3 gap-2 items-end p-0 z-50 bg-white mt-2 ">
                        {
                            statuses.map((s)=>{
                                return <div key={s} onClick={()=>setStatus(s)} className={`  rounded p-1 text-xs text-center text-slate-300 bg-slate-50 font-medium ${s === status && " bg-slate-700 text-white"}`}>
                                    {s}
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
                                status==="ONGOING" ? <PendingTables setSelectedTransaction={setSelectedTransaction} transactions={transactions}/> : 
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