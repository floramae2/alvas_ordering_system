/* eslint-disable @next/next/no-img-element */
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { formatCurrency } from "@/app/_utils/format";
import { type Dispatch, type SetStateAction, useState } from "react";
import { TransactionType } from "../page";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/react";
import { settings } from "@prisma/client";
import { BadgeStatus } from "../../../basket/_components/badger";
import { useParams } from "next/navigation";
import { toast } from "@/components/ui/use-toast";

export function ViewTransactionModal({ open, setOpen, settings, status }: {
    open: TransactionType | undefined;
    status:"ONGOING"| "DONE"| "CANCELLED";
    settings: settings | null | undefined
    setOpen: (open: TransactionType | undefined) => void;
    setSelectedTransaction: Dispatch<SetStateAction<TransactionType | undefined>>
}) {
    const {id} = useParams()
    const setOpenChange = (open: boolean) => {
        if (!open) {
            setOpen(undefined)
        }
    }
    const {  refetch } = api.user_customer.transaction.getCustomerTransactions.useQuery({
        customer_id: Number(id),
    }, {
        enabled : false
    })

    const { mutateAsync, isPending } = api.user_customer.transaction.cancelTransaction.useMutation({
        onSuccess:async()=>{
            toast({
                title:"Cancelled",
                description: "Transaction Cancelled"
            })
            setOpen(undefined)
            await refetch()
        },
        onError : (e) =>{
          toast({
            variant:"destructive",
            title:"Failed",
            description:e.message
          })
        }
    })
    if (!open) return <></>

    const totalAmount = open.orders.reduce((arr, curr) => {
        return arr + (curr.product.amount * curr.quantity)
    }, 0)
    const orders = open?.orders || []
    const onCancel = async (id: number | undefined) => {
        if (id) {
            await mutateAsync({
                transaction_id: id
            })
        }
    }
    return (
        <Dialog open={!!open} onOpenChange={setOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Transaction</DialogTitle>
                    <DialogDescription>
                        Transaction details and status.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-row gap-4 py-4">
                    {
                        !!orders.length && <div className=" text-sm w-full">
                            <div className=" flex flex-row justify-between items-center">

                                <p className=" font-semibold">Orders</p>
                                <BadgeStatus status={open?.status} />
                            </div>
                            <Separator className=" my-2" />
                            <div className=" flex flex-col gap-4 w-full overflow-scroll" style={{ maxHeight: "30vh" }}>
                                {
                                    orders?.map((order) => {
                                        return <div key={order.product.id} className=" flex flex-row justify-between w-full">
                                            <p>{order.product.product_name} X {order.quantity}</p>
                                            <div className=" flex flex-row gap-2">
                                                <p>{formatCurrency(order.product.amount * order.quantity)}</p>
                                            </div>
                                        </div>
                                    })
                                }
                            </div>
                            <div>

                                <Separator className=" my-2" />
                                <div className=" flex flex-row w-full justify-between">
                                    <p className="">Sub Total</p>
                                    <p className=" font-semibold">{formatCurrency(totalAmount)}</p>
                                </div>
                                <div className=" flex flex-row w-full justify-between">
                                    <p className="">Delivery Fee</p>
                                    <p className=" font-semibold">{formatCurrency(settings?.delivery_fee || 0)}</p>
                                </div>
                                <Separator className=" my-2" />
                                <div className=" flex flex-row w-full justify-between">
                                    <p className=" font-semibold">Total Amount</p>
                                    <p className=" font-semibold">{formatCurrency(totalAmount + (settings?.delivery_fee || 0))}</p>
                                </div>
                                <Separator className=" my-2" />
                                <div className="grid gap-1 p-2 bg-slate-100 rounded border">
                                    <div className="font-bold">RIDER INFORMATION</div>
                                    <dl className="grid gap-1">
                                        <div className="flex items-center justify-between">
                                            <dt>Rider</dt>
                                            <dd className=" capitalize font-bold">{open.rider?.first_name} {open.rider?.middle_name} {open.rider?.last_name}</dd>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <dt>Contact</dt>
                                            <dd className=" font-bold">
                                                <a href="tel:">{open.rider?.contact_number}</a>
                                            </dd>
                                        </div>
                                    </dl>
                                </div>
                                <div className=" flex flex-row justify-end gap-2 w-full mt-5">
                                    <Button onClick={() => setOpen(undefined)} variant={"outline"}>Close</Button>
                                    {open.status === "PENDING" && <Button disabled={isPending} onClick={() => onCancel(open?.id)} variant={"destructive"} className="">Cancel Order</Button>}
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </DialogContent>
        </Dialog>
    )
}
