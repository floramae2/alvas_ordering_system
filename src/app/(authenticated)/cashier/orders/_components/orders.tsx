'use client'
import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import Loading from "./table-components/loading"
import NoFound from "./table-components/no-found"
import { DataPagination } from "./table-components/pagination"
import { type PaginationType } from "@/lib/types/pagination"
import { formatCurrency } from "@/app/_utils/format"
import { useParams, useRouter } from "next/navigation"
import { barangays, customer, orders, transaction, type $Enums } from "@prisma/client"
import { format } from "date-fns"
const OrdersContent = ({
  status,
  transactions,
  transactionsIsLoading,
}: {
  status: $Enums.transaction_status;
  transactions: {
    id: string;
    status: $Enums.transaction_status;
    customer_name: string;
    customer_contact?: string;
    sub_total: number;
    delivery_fee: number;
    total_amount: number;
    total_transactions: number;
    createdAt: Date;
    barangay: string;
    transactions: (transaction & {
      orders: orders[];
      customer?: (customer & { barangay: barangays }) | null
    })[]
  }[] | undefined;
  transactionsIsLoading: boolean;
  transactionsIsRefetching: boolean
}) => {
  const { id } = useParams()
  const router = useRouter()
  const [pagination, setPagination] = React.useState<PaginationType>({
    take: 10,
    skip: 0
  })
  return (
    <Card x-chunk="dashboard-05-chunk-3" className=" h-full">
      <CardHeader className="px-7">
        <CardTitle>Orders</CardTitle>
        <CardDescription>
          <span className=" capitalize">{status.toLowerCase()}</span> orders from your store.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-center">Sub Total</TableHead>
              <TableHead className="text-center">Delivery Fee</TableHead>
              <TableHead className="text-center">Total Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {
              transactions?.map((transaction) => (
                <TableRow
                  key={transaction.id}
                  onClick={() => router.push("/cashier/orders/" + transaction.id)}
                  className={`cursor-pointer ${id === transaction.id.toString() ? " bg-accent" : ""}`}
                >
                  <TableCell>
                    <div className="font-medium capitalize">{transaction.customer_name}</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      {transaction.customer_contact}
                    </div>
                  </TableCell>
                  <TableCell >
                    {format(transaction.createdAt, "PP - hh:mm aa")}
                  </TableCell>
                  <TableCell className="text-center">
                    {formatCurrency(transaction.sub_total)}
                  </TableCell>
                  <TableCell className="text-center">
                    {formatCurrency(transaction.delivery_fee)}
                  </TableCell>
                  <TableCell className="text-center">
                    {formatCurrency(transaction.total_amount)}
                  </TableCell>
                </TableRow>
              ))
            }
          </TableBody>
        </Table>
        {transactionsIsLoading && <Loading />}
        {!transactionsIsLoading && !transactions?.length && <NoFound />}
        <DataPagination count={transactions?.length || 0} filter={pagination} setFilter={setPagination} />
      </CardContent>
    </Card>
  );
}

export default OrdersContent;