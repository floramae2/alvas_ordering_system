import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type ProductType } from "../page";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/app/_utils/format";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import Loading from "../../_components/loading";
import { toast } from "@/components/ui/use-toast";
import { useParams } from "next/navigation";
import { Minus } from "lucide-react";
import { type settings } from "@prisma/client";

export function SubmitOrderModal({
  open,
  setOpen,
  products,
  setProducts,
  deliveryFee,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  deliveryFee: number;
  products: ProductType[];
  setProducts: React.Dispatch<React.SetStateAction<ProductType[]>>;
}) {
  const { id } = useParams();

  const { refetch } =
    api.user_customer.transaction.getCustomerTransactions.useQuery(
      {
        customer_id: Number(id),
      },
      {
        enabled: false,
      },
    );
  const { mutateAsync, isPending } =
    api.user_customer.order.confirmCustomerOrders.useMutation({
      onSuccess: async () => {
        toast({
          title: "Confirmed",
          description: "Order Confirmed",
        });
        setOpen(false);
        setProducts([]);
        await refetch();
      },
      onError: (e) => {
        toast({
          variant: "destructive",
          title: "Failed",
          description: e.message,
        });
      },
    });

  if (!open) return <></>;
  const totalAmount = products.reduce((arr, curr) => {
    console.log("2", arr, (curr.price_history[0]?.price || 0) * curr.quantity);
    return arr + ((curr.price_history[0]?.price || 0)  * curr.quantity);
  }, 0);

  const onSubmit = async () => {
    if (!Number.isNaN(Number(id))) {
      await mutateAsync({
        total_amount: totalAmount,
        customer_id: Number(id),
        orders: products.map((prod) => ({
          product_id: prod.id,
          quantity: prod.quantity,
          product_price_id : prod.price_history[0]?.id||0
        })),
      });
    }
  };
  const onMinus = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        {isPending && (
          <div className="absolute bottom-0 left-0 right-0 top-0 z-10 flex items-center justify-center bg-background opacity-50">
            <Loading />
          </div>
        )}

        {!!products.length ? (
          <DialogHeader>
            <DialogTitle>Products on Basket</DialogTitle>
            <DialogDescription>
              Confirm your selected products.
            </DialogDescription>
          </DialogHeader>
        ) : (
          <DialogHeader>
            <DialogTitle>Empty Basket</DialogTitle>
            <DialogDescription>
              Selected products and add it into the basket.
            </DialogDescription>
          </DialogHeader>
        )}
        <div className="flex flex-row gap-4 pt-4">
          {!!products.length && (
            <div className="w-full text-sm">
              <p className="font-semibold">Orders</p>
              <Separator className="my-2" />
              <div
                className="flex w-full flex-col gap-4 overflow-scroll"
                style={{ maxHeight: "50vh" }}
              >
                {products?.map((product) => {
                  return (
                    <div
                      key={product.id}
                      onClick={() => onMinus(product.id)}
                      className="flex w-full flex-row justify-between"
                    >
                      <p>
                        {product.product_name} X {product.quantity}
                      </p>
                      <div className="flex flex-row gap-2">
                        <p>
                          {formatCurrency((product.price_history[0]?.price || 0)  * product.quantity)}
                        </p>
                        <div className="text-white">
                          <Minus
                            strokeWidth={3}
                            size={20}
                            className="rounded bg-red-500"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div>
                <Separator className="my-2" />
                <div className="flex w-full flex-row justify-between">
                  <p className="">Sub Total</p>
                  <p className="font-semibold">{formatCurrency(totalAmount)}</p>
                </div>
                <div className="flex w-full flex-row justify-between">
                  <p className="">Delivery Fee</p>
                  <p className="font-semibold">
                    {formatCurrency(deliveryFee || 0)}
                  </p>
                </div>
                <Separator className="my-2" />
                <div className="flex w-full flex-row justify-between">
                  <p className="font-semibold">Total Amount</p>
                  <p className="font-semibold">
                    {formatCurrency(totalAmount + (deliveryFee || 0))}
                  </p>
                </div>
                <div className="mt-5 flex w-full flex-row justify-end gap-2">
                  <Button onClick={() => setOpen(false)} variant={"outline"}>
                    Cancel
                  </Button>
                  <Button onClick={onSubmit} className="">
                    Submit Order
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
