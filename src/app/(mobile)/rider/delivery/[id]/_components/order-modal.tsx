/* eslint-disable @next/next/no-img-element */
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { formatCurrency } from "@/app/_utils/format";
import { type TransactionType } from "../page";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/react";
import { BadgeStatus } from "@/app/(mobile)/customer/basket/_components/badger";
import { useParams } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { Phone, User } from "lucide-react";
import { ConfirmOrderModal } from "./confirm-modal";
import { useState } from "react";
import { CancelOrderModal } from "./cancel-modal";

export default function OrderModal({ open, setOpen }: {
    open: TransactionType | undefined;
    setOpen: (open: TransactionType | undefined) => void;
}) {
    const { id } = useParams()
    const [openConfirm, setOpenConfirm] = useState(false)
    const [openCancel, setOpenCancel] = useState(false)
    const setOpenChange = (open: boolean) => {
        if (!open) {
            setOpen(undefined)
        }
    }

    const { mutateAsync: cancelOrder, isPending: cancelOrderIsPending } = api.user_rider.delivery.cancelTransaction.useMutation({
        onSuccess: async () => {
            toast({
                title: "Cancelled",
                description: "Transaction Cancelled"
            })
            setOpen(undefined)
            setOpenCancel(false)
            await refetchOrders()
        },
        onError: (e) => {
            toast({
                variant: "destructive",
                title: "Failed",
                description: e.message
            })
        }
    })

    const { mutateAsync: orderDelivered, isPending: orderDeliveredIsPending } = api.user_rider.delivery.transactionDelivered.useMutation({
        onSuccess: async () => {
            toast({
                title: "Done",
                description: "Transaction moved to Delivered"
            })
            setOpen(undefined)
            setOpenConfirm(false)
            await refetchOrders()
        },
        onError: (e) => {
            toast({
                variant: "destructive",
                title: "Failed",
                description: e.message
            })
        }
    })

    const { refetch: refetchForDelivery } = api.user_rider.delivery.getTransactionsForDelivery.useQuery({
        id: Number(id),
    }, { enabled: false })
    const { refetch: refetchDelivered } = api.user_rider.delivery.getTransactionsDelivered.useQuery({
        id: Number(id),
    }, { enabled: false })
    const refetchOrders = async () => {
        await Promise.all([
            refetchForDelivery(),
            refetchDelivered()
        ])
    }
    if (!open) return <></>

    const totalAmount = open.transactions.reduce((arr, curr) => {
        return arr + curr.orders.reduce((ar, cu) => ar + (cu.product_price.price * cu.quantity), 0)
    }, 0)
    const transaction = open?.transactions || []

    const onCancel = async () => {
        if (open.id) {
            await cancelOrder({
                id: open.id
            })
        }
    }

    const onDelivered = async () => {
        if (open.id) {
            await orderDelivered({
                id: open.id
            })
        }
    }

    return (
        <Dialog open={!!open} onOpenChange={setOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{"Customer's Orders"}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-row gap-4 py-4">
                    <ConfirmOrderModal open={openConfirm} setOpen={setOpenConfirm} isLoading={orderDeliveredIsPending} onSubmit={onDelivered} />
                    <CancelOrderModal open={openCancel} setOpen={setOpenCancel} isLoading={cancelOrderIsPending} onSubmit={onCancel} />
                    {
                        !!transaction.length && <div className=" text-sm w-full">
                            <div className=" flex flex-row justify-between items-center">

                                <p className=" font-semibold">Orders</p>
                                <BadgeStatus status={open?.status} />
                            </div>
                            <Separator className=" my-2" />
                            <div className=" flex flex-col gap-4 w-full overflow-scroll" style={{ maxHeight: "30vh" }}>
                                {
                                    transaction?.map((transaction, index) => (
                                        <div key={index} className=" flex flex-col gap-1"><div>Basket {index + 1}</div>
                                            {
                                                transaction.orders.map(order => {
                                                    return <div key={order.product.id} className=" flex flex-row justify-between w-full">
                                                        <p>{order.product.product_name} X {order.quantity}</p>
                                                        <div className=" flex flex-row gap-2">
                                                            <p>{formatCurrency(order.product_price.price * order.quantity)}</p>
                                                        </div>
                                                    </div>
                                                })
                                            }</div>

                                    ))
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
                                    <p className=" font-semibold">{formatCurrency(open?.delivery_fee || 0)}</p>
                                </div>
                                <Separator className=" my-2" />
                                <div className=" flex flex-row w-full justify-between">
                                    <p className=" font-semibold">Total Amount</p>
                                    <p className=" font-semibold">{formatCurrency(totalAmount + (open?.delivery_fee || 0))}</p>
                                </div>
                                <Separator className=" my-2" />
                                {open.status === "ONGOING" && <div className="grid gap-1 p-2 bg-slate-100 rounded border">
                                    <div className="font-bold">{"Customer's Information"}</div>
                                    <dl className="grid gap-1">
                                        <div className="flex items-center gap-1">
                                            <User size={15} strokeWidth={3} />
                                            <dd className=" capitalize font-bold">{open.transactions[0]?.customer?.first_name} {open.transactions[0]?.customer?.middle_name} {open.transactions[0]?.customer?.last_name}</dd>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Phone size={15} strokeWidth={3} />
                                            <dd className=" font-bold">
                                                <a href="tel:">{open.transactions[0]?.customer?.contact_number}</a>
                                            </dd>
                                        </div>
                                    </dl>
                                </div>}
                                <div className=" flex flex-row justify-end gap-2 w-full mt-5">
                                    {open.status !== "ONGOING" && <Button onClick={() => setOpen(undefined)} variant={"outline"}>Close</Button>}
                                    {open.status === "ONGOING" &&
                                        <div className="flex flex-row justify-end gap-2">
                                            <Button onClick={() => setOpenCancel(true)} variant={"destructive"} className="">Cancel Order</Button>
                                            <Button onClick={() => setOpenConfirm(true)} className="">Delivered</Button>
                                        </div>}
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </DialogContent>
        </Dialog>
    )
}
