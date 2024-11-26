"use client";
import React from "react";
import { Card } from "@/components/ui/card";
import { api } from "@/trpc/react";
import Loading from "../_components/loading";
import { useState } from "react";
import { product_price_history, type $Enums } from "@prisma/client";
import { ShoppingBasket } from "lucide-react";
import { AddOrderModal } from "./_components/add-order-modal";
import { SubmitOrderModal } from "./_components/submit-order-modal";
import { useParams } from "next/navigation";
import HorizontalScrollComponent from "./_components/scrolling";

const sorting = [
  { category: "FRIED CHICKEN", value: 1 },
  { category: "CHICHARON", value: 2 },
  { category: "PORK SIOMAI", value: 3 },
  { category: "NGOHIONG", value: 4 },
  { category: "PANCIT PALABOK", value: 5 },
  { category: "SIOPAO", value: 6 },
  { category: "DRINKS", value: 7 },
  { category: "RICE", value: 8 },
];

export type ProductType = {
  id: number;
  product_name: string;
  image_url: string;
  admin_id: number;
  category_id: number;
  quantity: number;
  status: $Enums.product_status;
  createdAt: Date;
  updatedAt: Date;
  price_history : product_price_history[]
};

const Page = () => {
  const { id } = useParams();
  const [category, setCategory] = useState("ALL");
  const [selectedProducts, setSelectedProducts] = useState<ProductType[]>([]);
  const [submitOrderOpen, setSubmitOrderOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<
    ProductType | undefined
  >(undefined);
  const { data: products, isLoading: productsIsLoading } =
    api.user_customer.order.getProducts.useQuery();
  const { data: deliveryFee } =
    api.user_customer.settings.getSettingsDeliveryFee.useQuery({
      id: Number(id),
    });
  const productsToShow = () => {
    if (products) {
      const prod = products
        .map((prods, index) => {
          const sortValue =
            sorting.find((sor) => sor.category === prods.category)?.value ||
            index + 100;
          return {
            ...prods,
            sortValue,
          };
        })
        .sort((productA, productB) => productA.sortValue - productB.sortValue);
      if (category === "ALL") {
        return prod;
      } else {
        return prod.filter((prod) => prod.category === category);
      }
    } else {
      return [];
    }
  };
  return (
    <div className="mx-auto grid w-full p-2">
      <AddOrderModal
        open={selectedProduct}
        setOpen={setSelectedProduct}
        setSelectedProducts={setSelectedProducts}
      />
      <SubmitOrderModal
        deliveryFee={deliveryFee?.barangay.barangay_delivery_fee || 0}
        open={submitOrderOpen}
        setOpen={setSubmitOrderOpen}
        products={selectedProducts}
        setProducts={setSelectedProducts}
      />
      <div className="flex flex-row justify-between">
        <div>
          <h1 className="text-base font-bold">Place your order</h1>
          <p className="text-xs text-muted-foreground">
            Select products and add it into the basket.
          </p>
        </div>
        <div></div>
      </div>
      <div className="flex flex-1 flex-col gap-4 md:gap-8">
        <Card
          x-chunk="dashboard-01-chunk-0"
          className="border-none bg-transparent shadow-none"
        >
          <div className="z-50 mt-2 flex flex-row items-end justify-between bg-white p-0">
            {/* <Select
                            onValueChange={setCategory}
                            value={category}
                            disabled={productsIsLoading}
                        >
                            <SelectTrigger className=" w-32 text-xs z-10">
                                <SelectValue className=" capitalize text-xs" placeholder={`${productsIsLoading ? "Loading..." : "Product Category"}`} />
                            </SelectTrigger>
                            <div>
                            <SelectContent className=" z-50">
                                {
                                    [{ category: "ALL" }, ...(products || [])]?.map((prod) => (<SelectItem value={prod.category} key={prod.category} className=" capitalize text-xs">{prod.category}</SelectItem>))
                                }
                            </SelectContent>
                            </div>
                        </Select> */}
            <div></div>
            <div
              onClick={() => setSubmitOrderOpen(true)}
              className="relative flex flex-row items-center gap-1 rounded-full border border-green-900 px-3 py-1 text-sm font-bold text-green-900"
            >
              {selectedProducts.length ? (
                <div className="absolute -left-3 -top-2 flex aspect-square items-center justify-center rounded-full border bg-green-800 px-2 text-xs text-white">
                  {selectedProducts.length}
                </div>
              ) : (
                <></>
              )}
              <ShoppingBasket size={18} strokeWidth={2.5} />
              Basket
            </div>
          </div>
          <div
            className="relative mt-1 grid min-h-[300px] w-full overflow-y-auto rounded bg-white"
            style={{ maxHeight: "80vh" }}
          >
            {productsIsLoading && (
              <div className="absolute bottom-0 left-0 right-0 top-0 z-10 flex items-center justify-center bg-background opacity-50">
                <Loading />
              </div>
            )}
            <div className="flex flex-col gap-2 overflow-hidden">
              {productsToShow()?.map((prod, index) => {
                return (
                  <div key={prod.category} className="w-full">
                    <p className="mb-1 mt-2 rounded bg-green-700 p-1 text-center text-sm font-bold text-white">
                      {prod.category}
                    </p>
                    <HorizontalScrollComponent key={index}>
                      <div  className={`flex w-full flex-row gap-1 overflow-hidden overflow-x-auto rounded border border-slate-100 bg-white p-1 ${category !== "ALL" && "grid w-full grid-cols-3 gap-1"}`}>
                        {prod.products.map((product) => {
                        return (
                          <div
                          onClick={()=>{
                            product.status==="AVAILABLE" && setSelectedProduct({...product, quantity : 1})
                        }}
                            key={product.id}
                            className={`relative flex h-36 w-28 flex-none cursor-pointer flex-col justify-end overflow-hidden rounded border transition-all hover:brightness-90`}
                          >
                            <div className="absolute bottom-0 left-0 right-0 top-0 overflow-hidden rounded bg-white">
                              <img
                                src={product.image_url}
                                alt={product.id.toString()}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="z-10 w-full self-end bg-black bg-opacity-70 p-2 text-xs text-white">
                              {product.product_name}
                            </div>
                            {product.status==="NOT_AVAILABLE" &&<div className=" text-white font-bold bg-opacity-70 flex items-center justify-center absolute top-0 bottom-0 left-0 right-0 bg-black text-wrap text-center">NOT AVAILABLE</div>}
                          </div>
                        );
                      })}
                      </div>
                    </HorizontalScrollComponent>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Page;
