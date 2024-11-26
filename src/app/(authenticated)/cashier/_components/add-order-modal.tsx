/* eslint-disable @next/next/no-img-element */
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { type ProductType } from "../page";
import { formatCurrency } from "@/app/_utils/format";
import { type Dispatch, type SetStateAction, useState } from "react";

export function AddOrderModal({ open, setOpen, setSelectedProducts }: {
    open: ProductType | undefined;
    setOpen: (open: ProductType | undefined) => void;
    setSelectedProducts: Dispatch<SetStateAction<ProductType[]>>
}) {
    const [quantity, setQuantity] = useState(1)
    if (!open) return <></>
    const setOpenChange = (open: boolean) => {
        if (!open) {
            setOpen(undefined)
        }
    }
    const onOrder = () => {
        setSelectedProducts((prev)=>{
            const inOrder = prev.find((product)=>product.id === open.id)
            if(inOrder){
                return prev.map((p)=>{
                    if(p.id=== inOrder.id){
                        return {
                            ...p,
                            quantity : p.quantity + quantity
                        }
                    }else {
                        return p
                    }
                })
            } else {
                return [
                    ...prev,
                    {...open, quantity}
                ]
            }
        })
        setOpen(undefined)
        setQuantity(1)
    }
    return (
        <Dialog open={!!open} onOpenChange={setOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Selected Product</DialogTitle>
                    <DialogDescription>
                        Add this product to your order.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-row gap-4 py-4">
                    <div>
                        <img src={open.image_url} alt="product_image" className=" object-cover w-40 h-52 border rounded-md shadow overflow-hidden" />
                    </div>
                    <div className=" flex flex-col flex-1">
                        <div className=" flex flex-col gap-2">
                            <p className=" font-bold">{open.product_name}</p>
                            <p className=" text-sm font-bold">Price : {formatCurrency(open.price_history[0]?.price || 0)}</p>
                        </div>
                        <div className=" w-full px-5 flex flex-col justify-end h-full gap-1">
                            <p className=" text-sm font-bold">Quantity</p>
                            <div className='grid h-8 grid-cols-3 border rounded-md gap-x-1 w-full'>
                                <button onClick={() => setQuantity(prev=> {
                                    if(prev>1) return prev-1
                                    return prev
                                })} type='button' className='text-primary'>-</button>
                                <div className='py-1 text-sm text-center border-l border-r'>
                                    {quantity}
                                </div>
                                <button onClick={() => setQuantity(prev=>prev+1)} type='button' className='text-primary'>+</button>
                            </div>
                            <Button onClick={onOrder} className=" mt-2">Add to Order</Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
