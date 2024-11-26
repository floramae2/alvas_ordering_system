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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { api } from "@/trpc/react"
import Loading from "./_components/loading"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { product_price_history, type $Enums } from "@prisma/client"
import { Separator } from "@/components/ui/separator"
import { MoreVertical } from "lucide-react"
import { AddOrderModal } from "./_components/add-order-modal"
import { formatCurrency } from "@/app/_utils/format"
import { SubmitOrderModal } from "./_components/submit-order-modal"

const sorting = [
    { category: "FRIED CHICKEN", value: 1 },
    { category: "CHICHARON", value: 2 },
    { category: "PORK SIOMAI", value: 3 },
    { category: "NGOHIONG", value: 4 },
    { category: "PANCIT PALABOK", value: 5 },
    { category: "SIOPAO", value: 6 },
    { category: "DRINKS", value: 7 },
    { category: "RICE", value: 8 },
]

export type ProductType ={
    id: number;
    product_name: string;
    image_url: string;
    admin_id: number;
    category_id: number;
    quantity : number;
    price_history : product_price_history[];
    status: $Enums.product_status;
    createdAt: Date;
    updatedAt: Date;
}

const Page = () => {
    const [category, setCategory] = useState("ALL")
    const [selectedProducts, setSelectedProducts] = useState<ProductType[]>([])
    const [submitOrderOpen, setSubmitOrderOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<ProductType|undefined>(undefined)
    const { data: products, isLoading: productsIsLoading } = api.user_cashier.order.getProducts.useQuery()
    const productsToShow = () => {
        if (products) {
            const prod = products.map((prods, index) => {
                const sortValue = sorting.find(sor => sor.category === prods.category)?.value || index + 100
                return {
                    ...prods,
                    sortValue
                }
            }).sort((productA, productB) => productA.sortValue - productB.sortValue)
            if (category === "ALL") {
                return prod
            } else {
                return prod.filter((prod) => prod.category === category)
            }
        } else {
            return []
        }
    }

    const totalAmount = selectedProducts.reduce((arr, curr)=>{
        return arr + ((curr.price_history[0]?.price||0) * curr.quantity)
    },0)


    return (
        <div className=" flex flex-col">
            <div className="mx-auto grid w-full max-w-9xl gap-2">
                <AddOrderModal open={selectedProduct} setOpen={setSelectedProduct} setSelectedProducts={setSelectedProducts}/>
                <SubmitOrderModal open={submitOrderOpen} setOpen={setSubmitOrderOpen} products={selectedProducts} setProducts={setSelectedProducts}/>
                <h1 className="text-3xl font-semibold">Process Orders</h1>
                <p className="text-muted-foreground -mt-2 mb-2">Select products and fulfill customer orders.</p>
                <main className="flex flex-1 flex-col gap-4 md:gap-8">
                    <div className="grid gap-4 md:gap-8 sm:grid-cols-2 md:grid-cols-3">
                        <div className=" md:col-span-2 w-full overflow-auto">
                            <Card x-chunk="dashboard-01-chunk-0" className=" bg-transparent border-none shadow-none">
                                <CardHeader className=" flex flex-row justify-between items-end">
                                    <div>
                                        <CardTitle>Products</CardTitle>
                                        <CardDescription>
                                            Select products and process customer orders.
                                        </CardDescription>
                                    </div>
                                    <Select
                                        onValueChange={setCategory}
                                        value={category}
                                        disabled={productsIsLoading}
                                    >
                                        <SelectTrigger className=" w-40">
                                            <SelectValue className=" capitalize" placeholder={`${productsIsLoading ? "Loading..." : "Product Category"}`} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {
                                                [{ category: "ALL" }, ...(products || [])]?.map((prod) => (<SelectItem value={prod.category} key={prod.category} className=" capitalize">{prod.category}</SelectItem>))
                                            }
                                        </SelectContent>
                                    </Select>
                                </CardHeader>
                                <CardContent className=" relative rounded-lg overflow-y-auto py-5 -mt-3 max-h-[600px] min-h-[300px]">
                                    {(productsIsLoading) &&
                                        <div className=" absolute bg-background opacity-50 z-10 top-0 left-0 right-0 bottom-0 flex items-center justify-center">
                                            <Loading />
                                        </div>}
                                    <div className=" flex flex-col gap-3 overflow-hidden">
                                        {
                                            productsToShow()?.map((prod) => {
                                                return <div key={prod.category} className=" w-full">
                                                    <p className=" font-semibold text-lg">{prod.category}</p>
                                                    <div className={`  w-full overflow-hidden overflow-x-auto flex  flex-row p-5 px-2 gap-3 ${category!=="ALL" && 'flex-wrap'}`}>
                                                        {
                                                            prod.products.map((product) => {
                                                                return <div onClick={()=>{
                                                                    product.status==="AVAILABLE" && setSelectedProduct({...product, quantity : 1})
                                                                }} key={product.id} className={` ${product.status==="AVAILABLE" && 'hover:scale-105'} transition-all cursor-pointer flex flex-col flex-none h-52 border justify-end rounded w-40 relative overflow-hidden`}>

                                                                    <div className=" absolute bg-white rounded overflow-hidden top-0 left-0 right-0 bottom-0">
                                                                        <img src={product.image_url} alt={product.id.toString()} className=" h-full w-full object-cover" />
                                                                    </div>
                                                                    <div className=" self-end text-xs w-full p-2 z-10 bg-black text-white bg-opacity-70">
                                                                        {product.product_name}
                                                                    </div>
                                                                    {product.status==="NOT_AVAILABLE" &&<div className=" text-white font-bold bg-opacity-70 flex items-center justify-center absolute top-0 bottom-0 left-0 right-0 bg-black">NOT AVAILABLE</div>}
                                                                </div>
                                                            })
                                                        }
                                                    </div>
                                                </div>
                                            })
                                        }
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className=" mt-8">
                            <Card x-chunk="dashboard-01-chunk-0" className=" overflow-hidden">
                                <CardHeader className=" bg-gray-100 dark:bg-muted flex flex-row w-full justify-between">
                                    <div className=" flex flex-col gap-1">
                                    <CardTitle>Order</CardTitle>
                                    <CardDescription>
                                        Details of Your New Order.
                                    </CardDescription>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="icon" variant="outline" className="h-8 w-8">
                                                <MoreVertical className="h-3.5 w-3.5" />
                                                <span className="sr-only">More</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={()=>setSelectedProducts([])}>Reset</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </CardHeader>
                                <CardContent className=" relative bg-background py-5">
                                    <div className=" text-sm">
                                        <p className=" font-semibold">Orders</p>
                                        <Separator className=" my-2" />
                                        {
                                            !selectedProducts.length && <div className=" w-full py-20 text-center text-muted-foreground text-sm">Order Product</div>
                                        }
                                        <div className=" flex flex-col gap-4">
                                        {
                                            selectedProducts?.map((product)=>{
                                                return <div key={product.id} className=" flex flex-row justify-between w-full">
                                                    <p>{product.product_name} X {product.quantity}</p>
                                                    <p>{formatCurrency((product.price_history[0]?.price||0 )* product.quantity)}</p>
                                                    </div>
                                            })
                                        }
                                        {
                                            !!selectedProducts.length && <div>

                                                <Separator className=" my-2" />
                                                <div className=" flex flex-row w-full justify-between">
                                                <p className=" font-semibold">Total Amount</p>
                                                <p className=" font-semibold">{formatCurrency(totalAmount)}</p>
                                                </div>
                                                <Button onClick={()=>setSubmitOrderOpen(true)} className=" w-full mt-5">Submit Order</Button>
                                            </div>
                                        }
                                        </div>
                                    </div>
                                </CardContent>
                            </Card></div>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default Page;
