'use client'
import React from "react"
import {
    Card,
} from "@/components/ui/card"
import { api } from "@/trpc/react"
import { useState } from "react"
import { useParams } from "next/navigation"
import { grouped_delivery_by_customer, type customer, type orders, type products, type transaction, product_price_history } from "@prisma/client"
import { RefreshCcw, TableProperties, Truck } from "lucide-react"
import ForDelivery from "./_components/delivery"
import Delivered from "./_components/delivered"


type MenuType = "ONGOING" | "DELIVERED"

const menu = [{
    key: "ONGOING",
    label: "ASSIGNED",
    icon: <TableProperties size={18} />
}, {
    key: "DELIVERED",
    label: "DELIVERED",
    icon: <Truck size={18} />
}] as { key: MenuType; label: string; icon: React.JSX.Element }[]

export type TransactionType = grouped_delivery_by_customer & {
    transactions : (transaction & {
        orders: (orders & { product: products; product_price:product_price_history })[],
        customer: customer | null
    })[]
}

const Page = () => {
    const {id} = useParams()
    const [status, setStatus] = useState<MenuType>("ONGOING")

    api.user_customer.settings.getSettings.useQuery()
    const {refetch:refetchForDelivery, isRefetching:isLoadingForDelivery } = api.user_rider.delivery.getTransactionsForDelivery.useQuery({
        id:Number(id),
    })
    const {refetch:refetchDelivered, isRefetching:isLoadingDelivered } = api.user_rider.delivery.getTransactionsDelivered.useQuery({
        id:Number(id),
    })
    const refetch =async () => {
        await refetchForDelivery()
        await refetchDelivered()
    }
    return (

        <div className="mx-auto grid w-full p-2">
            <div className="flex flex-row justify-between">
                <div>
                    <h1 className="text-base font-bold">Delivery</h1>
                    <p className="text-muted-foreground text-xs">Manage and complete your assigned deliveries.</p>
                </div>
                <div>
                </div>
            </div>
            <div className="flex flex-1 flex-col gap-2 md:gap-8">
                <Card x-chunk="dashboard-01-chunk-0" className=" bg-transparent border-none shadow-none mt-2 gap-1 flex flex-row  items-center w-full">
                    <div className=" grid grid-cols-2 gap-1 items-end p-0 z-50 bg-white w-full">
                        {
                            menu.map((men) => {
                                return <div key={men.key} onClick={() => setStatus(men.key)} className={`  text-white border-2 rounded-lg p-1 flex items-center justify-center gap-1 text-xs text-center
                                 ${men.key === "ONGOING" && "bg-orange-500 border-orange-200"}
                                  ${men.key === "DELIVERED" && "bg-green-500 border-green-200"}
                                font-bold ${men.key === status ? "opacity-100" : " opacity-50"}`}>
                                    {men.icon}{men.label}
                                </div>
                            })
                        }
                    </div>
                    <div onClick={refetch} className={`text-sm flex justify-center items-center flex-row font-semibold rounded flex-none p-1 text-slate-500 bg-slate-200 `}><RefreshCcw className={`${isLoadingDelivered || isLoadingForDelivery && "animate-spin"}`} strokeWidth={3} size={18}/></div>
                </Card>
                    {
                        status === "ONGOING" ? <ForDelivery /> : <Delivered />
                    }
            </div>
        </div>
    );
}

export default Page;