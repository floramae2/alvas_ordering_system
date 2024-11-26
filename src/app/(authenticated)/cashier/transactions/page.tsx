/* eslint-disable @next/next/no-img-element */
'use client'
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { api } from "@/trpc/react"
import Loading from "./_components/loading"
import { Separator } from "@/components/ui/separator"
import React, { useState } from "react"
import { CalendarIcon } from "@radix-ui/react-icons"
import { format, startOfMonth } from "date-fns"
import { type DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { useStore } from "@/lib/store/app"
import TransactionTable from "./_components/transaction-table"
import NoFound from "./_components/table-components/no-found"
import { DataPagination } from "./_components/table-components/pagination"
import { type PaginationType } from "@/lib/types/pagination"
import { formatCurrency } from "@/app/_utils/format"
import { LoaderCircle } from "lucide-react"
import { product_price_history } from "@prisma/client"
export type TransactionType = {
    id: number;
    admin_id: number;
    cashier_id: number | null;
    customer_id: number | null;
    delivery_rider_id: number | null;
    status : "DONE" | "CANCELLED" | "ONGOING" | "PENDING" |"DELIVERED";
    total_amount : number;
    createdAt: Date;
    updatedAt: Date;
    transaction_type :string;
    orders : {
      id :number;
      product_id :number;
      transaction_id :number;
      quantity :number;
      product : {
        product_name : string;
      };
      product_price:product_price_history
    }[]
}
const Page = () => {
    const { user } = useStore()
    const [date, setDate] = React.useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: new Date(),
    })
    const [pagination, setPagination] = React.useState<PaginationType>({
      take: 10,
      skip: 0
    })
    const [selectedTransaction , setSelectedTransaction] = useState<TransactionType | undefined>(undefined)

    const { data:transactions, isLoading:transactionsIsLoading, refetch, isRefetching} = api.user_cashier.transaction.getTransactions.useQuery({
        cashier_id : user?.id || 0,
        from : date?.from || new Date(),
        to : date?.to || new Date()
    }, {
        enabled : !!date && !!user
    })
    console.log(transactions)
    const refetchTransaction =  async() => {
        await refetch()
    }
    return (

        <div className="grid gap-1 sm:grid-cols-2 md:grid-cols-3">
            <div className=" md:col-span-2 w-full overflow-auto">
                <Card x-chunk="dashboard-01-chunk-0" className=" bg-transparent border-none shadow-none">
                    <CardHeader className=" flex flex-row justify-between items-end">
                        <div>
                            <CardTitle>Filter Transactions</CardTitle>
                            <CardDescription>
                                {" Transaction list you've made."}
                            </CardDescription>
                        </div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn(
                                        "w-[300px] justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date?.from ? (
                                        date.to ? (
                                            <>
                                                {format(date.from, "LLL dd, y")} -{" "}
                                                {format(date.to, "LLL dd, y")}
                                            </>
                                        ) : (
                                            format(date.from, "LLL dd, y")
                                        )
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={date?.from}
                                    selected={date}
                                    onSelect={setDate}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </CardHeader>
                    <CardContent className=" relative rounded-lg overflow-y-auto max-h-[600px] min-h-[300px]">
                        <div className=" flex flex-col gap-3 overflow-hidden bg-background border shadow-md rounded-lg relative">
                            <TransactionTable refetch={refetchTransaction} transactions={transactions?.slice(pagination.skip, pagination.skip+pagination.take)} setSelectedTransaction={setSelectedTransaction} selectedTransaction={selectedTransaction}/>
                            {transactionsIsLoading && <Loading />}
                            {!transactionsIsLoading && !transactions?.length && <NoFound />}
                            <DataPagination count={transactions?.length || 0} filter={pagination} setFilter={setPagination} />
                        {isRefetching && <div className="flex w-full absolute items-center justify-center top-0 left-0 right-0 bottom-0 bg-black bg-opacity-35 text-white z-10">
                          <LoaderCircle className="animate-spin" /> Loading
                        </div>}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className=" mt-8">
                <Card x-chunk="dashboard-01-chunk-0" className=" overflow-hidden">
                    <CardHeader className=" bg-gray-100 dark:bg-muted flex flex-row w-full justify-between">
                        <div className=" flex flex-col gap-1">
                            <CardTitle>Transaction</CardTitle>
                            <CardDescription>
                                Details of selected transaction.
                            </CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className=" relative bg-background py-5">
                        <div className=" text-sm">
                            <p className=" font-semibold">Orders</p>
                            <Separator className=" my-2" />
                            {
                                !selectedTransaction ? <div className=" w-full py-20 text-center text-muted-foreground text-sm">Select Transaction</div> : 
                                <div className=" flex flex-col gap-4">
                                        {
                                            selectedTransaction.orders?.map((order)=>{
                                                console.log(order)
                                                return <div key={order.id} className=" flex flex-row justify-between w-full">
                                                    <p>{order.product.product_name} X {order.quantity}</p>
                                                    <p>{formatCurrency(order.product_price.price * order.quantity)}</p>
                                                    </div>
                                            })
                                        }
                                                <Separator className=" my-0" />
                                                <div className=" flex flex-row w-full justify-between">
                                                <p className=" font-semibold">Total Amount</p>
                                                <p className=" font-semibold">{formatCurrency(selectedTransaction.total_amount)}</p>
                                                </div>
                                        </div>
                            }
                            <div className=" flex flex-col gap-4">
                            </div>
                        </div>
                    </CardContent>
                </Card></div>
        </div>
    );
}

export default Page;