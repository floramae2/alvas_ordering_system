import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { type ProductType } from "../page";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/app/_utils/format";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import Loading from "./loading";
import { toast } from "@/components/ui/use-toast";
import { useStore } from "@/lib/store/app";
import { type Dispatch, type SetStateAction } from "react";

export function SubmitOrderModal({ open, setOpen, products, setProducts }: {
    open: boolean;
    setOpen: (open: boolean) => void;
    products: ProductType[]
    setProducts:Dispatch<SetStateAction<ProductType[]>>
}) {
    const { user } = useStore()

    const { mutateAsync, isPending } = api.user_cashier.order.confirmCashierOrders.useMutation({
        onSuccess: () => {
          toast({
            title: "Confirmed",
            description: "Order Confirmed"
          })
          setOpen(false)
          setProducts([])
        },
        onError: (e) => {
          toast({
            variant: "destructive",
            title: "Failed",
            description: e.message
          })
        }
      })

    if (!open) return <></>

    const totalAmount = products.reduce((arr, curr) => {
        return arr + ((curr.price_history[0]?.price||0) * curr.quantity)
    }, 0)


    const onSubmit =async () => {
        if(user?.id){
            await mutateAsync({
                total_amount : totalAmount,
                cashier_id : user.id,
                orders : products.map((prod)=>({
                    product_id:prod.id,
                    quantity : prod.quantity,
                    product_price_id : prod.price_history[0]?.id||0
                }
                ))
            })
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                {(isPending) &&
                    <div className=" absolute bg-background opacity-50 z-10 top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                        <Loading />
                    </div>}
                <DialogHeader>
                    <DialogTitle>Confirm Order</DialogTitle>
                    <DialogDescription>
                        Confirm your selected orders.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-row gap-4 pt-4">
                    <div className=" text-sm w-full">
                        <p className=" font-semibold">Orders</p>
                        <Separator className=" my-2" />
                        <div className=" flex flex-col gap-4 w-full">
                            {
                                products?.map((product) => {
                                    return <div key={product.id} className=" flex flex-row justify-between w-full">
                                        <p>{product.product_name} X {product.quantity}</p>
                                        <p>{formatCurrency((product.price_history[0]?.price||0) * product.quantity)}</p>
                                    </div>
                                })
                            }
                            {
                                !!products.length && <div>

                                    <Separator className=" my-2" />
                                    <div className=" flex flex-row w-full justify-between">
                                        <p className=" font-semibold">Total Amount</p>
                                        <p className=" font-semibold">{formatCurrency(totalAmount)}</p>
                                    </div>
                                    <div className=" flex flex-row justify-end gap-2 w-full mt-5">
                                        <Button onClick={() => setOpen(false)} variant={"outline"}>Cancel</Button>
                                        <Button onClick={onSubmit} className="">Confirm Order</Button>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
