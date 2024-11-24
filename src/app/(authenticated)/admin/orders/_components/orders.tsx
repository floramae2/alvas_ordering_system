"use client";
import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Loading from "./table-components/loading";
import NoFound from "./table-components/no-found";
import { DataPagination } from "./table-components/pagination";
import { type PaginationType } from "@/lib/types/pagination";
import { formatCurrency } from "@/app/_utils/format";
import { useParams, useRouter } from "next/navigation";
import { type $Enums } from "@prisma/client";
import { toZonedTime, format as formatTZ } from "date-fns-tz";
import { timeDate, timeZone } from "@/app/helper/format";
import { Transaction } from "../page";
import AssignRider from "../[id]/_components/assign-rider";
import CancelOrder from "../[id]/_components/cancel-order";
import MarkDoneOrder from "../[id]/_components/mark-done-order";
import { api } from "@/trpc/react";
import { useStore } from "@/lib/store/app";
const OrdersContent = ({
  status,
  transactions,
  transactionsIsLoading,
  transaction,
  setTransaction,
}: {
  status: $Enums.transaction_status;
  transactions: Transaction[] | undefined;
  transactionsIsLoading: boolean;
  transactionsIsRefetching: boolean;
  transaction: Transaction | undefined;
  setTransaction: React.Dispatch<React.SetStateAction<Transaction | undefined>>;
}) => {
  const { id } = useParams();
  const [searchRider, setSearchRider] = React.useState("");
  const [riders, setRiders] = React.useState<
    {
      label: string;
      value: number;
      barangay: string;
      isOngoing: boolean;
      deliveryCount: number;
    }[]
  >([]);
  const { user } = useStore();
  const [pagination, setPagination] = React.useState<PaginationType>({
    take: 10,
    skip: 0,
  });
  const {
    data: ridersData,
    isLoading: riderIsLoading,
    refetch: refetchRiders,
  } = api.rider.getRiderForSelect.useQuery();
  const { refetch: refetchTransaction } =
    api.transaction.getAdminOrders.useQuery(
      {
        admin_id: user?.id || 0,
      },
      {
        enabled: false,
      },
    );
  React.useEffect(() => {
    if (ridersData) {
      setRiders(
        ridersData.filter((data) =>
          data.label.toLowerCase().includes(searchRider.toLowerCase()),
        ),
      );
    }
  }, [ridersData, searchRider]);

  const refetch = async () => {
    await Promise.all([refetchTransaction(), refetchRiders()]);
  };
console.log(transactions?.[0]?.status)
  return (
    <Card x-chunk="dashboard-05-chunk-3" className="h-full">
      <CardHeader className="px-7">
        <CardTitle>Orders</CardTitle>
        <CardDescription>
          <span className="capitalize">{status.toLowerCase()}</span> orders from
          your store.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-start">Orders</TableHead>
              <TableHead className="text-start">Sub Total</TableHead>
              <TableHead className="text-start">Delivery Fee</TableHead>
              <TableHead className="text-start">Total Amount</TableHead>
              {["PENDING", "ONGOING", "DELIVERED"].includes(transactions?.[0]?.status || "") && <TableHead className="w-[100px] text-center">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions
              ?.slice(pagination.skip, pagination.skip + pagination.take)
              .map((transaction) => {
                const boholTimeDate = timeDate(transaction.createdAt);
                return (
                  <TableRow
                    key={transaction.id}
                    className={`cursor-pointer ${id === transaction.id.toString() ? "bg-accent" : ""}`}
                  >
                    <TableCell onClick={() => setTransaction(transaction)}>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        {transaction.customer_contact}{" "}
                      </div>
                      <div className="font-medium capitalize">
                        {transaction.customer_name}
                      </div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        <span className="text-base font-bold text-black dark:text-white">
                          Brgy. {transaction.barangay}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell onClick={() => setTransaction(transaction)}>
                      {formatTZ(boholTimeDate, "PP - hh:mm aa", {
                        timeZone: timeZone,
                      })}
                    </TableCell>
                    <TableCell
                      className="text-start"
                      onClick={() => setTransaction(transaction)}
                    >
                      <span className="p-1">
                        {transaction.total_transactions} basket/s
                      </span>
                    </TableCell>
                    <TableCell
                      className="text-start"
                      onClick={() => setTransaction(transaction)}
                    >
                      {formatCurrency(transaction.sub_total)}
                    </TableCell>
                    <TableCell
                      className="text-start"
                      onClick={() => setTransaction(transaction)}
                    >
                      {formatCurrency(transaction.delivery_fee)}
                    </TableCell>
                    <TableCell
                      className="text-start"
                      onClick={() => setTransaction(transaction)}
                    >
                      {formatCurrency(transaction.total_amount)}
                    </TableCell>
                    {["PENDING", "ONGOING", "DELIVERED"].includes(transactions?.[0]?.status || "") && <TableCell className="w-[100px]">
                      {transaction.status === "PENDING" && (
                        <AssignRider
                          riderIsLoading={riderIsLoading}
                          riders={riders}
                          searchRider={searchRider}
                          setSearchRider={setSearchRider}
                          refetchTransaction={refetch}
                          delivery_fee={transaction.delivery_fee}
                          barangay={transaction.barangay}
                          transactionIds={transaction.transactions.map(
                            (data) => data.id,
                          )}
                        />
                      )}
                      {transaction.status === "ONGOING" && (
                        <CancelOrder
                          riderIsLoading={riderIsLoading}
                          refetchTransaction={refetchTransaction}
                          transactionIds={transaction.transactions.map(
                            (data) => data.id,
                          )}
                          grouped_delivery_id={transaction.grouped_delivery_id}
                        />
                      )}
                      {transaction.status === "DELIVERED" && (
                        <MarkDoneOrder
                          riderIsLoading={riderIsLoading}
                          refetchTransaction={refetchTransaction}
                          transactionIds={transaction.transactions.map(
                            (data) => data.id,
                          )}
                          grouped_delivery_id={transaction.grouped_delivery_id}
                        />
                      )}
                    </TableCell>}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        {transactionsIsLoading && <Loading />}
        {!transactionsIsLoading && !transactions?.length && <NoFound />}
        <DataPagination
          count={transactions?.length || 0}
          filter={pagination}
          setFilter={setPagination}
        />
      </CardContent>
    </Card>
  );
};

export default OrdersContent;
