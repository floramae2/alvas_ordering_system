import { formatCurrency } from "@/app/_utils/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, isWithinInterval, sub } from "date-fns";
import { type TransactionType } from "../page";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/trpc/react";
type Transactions = TransactionType[] | undefined;

export default function TransactionTable({
  transactions,
  setSelectedTransaction,
  selectedTransaction,
  refetch
}: {
  refetch:()=>Promise<void>;
  transactions: Transactions;
  setSelectedTransaction: React.Dispatch<
    React.SetStateAction<TransactionType | undefined>
  >;
  selectedTransaction: TransactionType | undefined;
}) {
  const { mutateAsync, isPending } =
    api.user_cashier.transaction.deleteTransaction.useMutation({
      onSuccess : async()=>{
        await refetch()
      }
    });
  const overAllTotal = transactions?.reduce((curr, arr) => {
    return curr + arr.total_amount;
  }, 0);
  const isDateWithinFiveMinutes = (dateToCheck: Date): boolean => {
    const now = new Date();
    const fiveMinutesBefore = sub(now, { minutes: 90 });
    return isWithinInterval(dateToCheck, {
      start: now,
      end: fiveMinutesBefore,
    });
  };
  return (
    <div className="p-2 md:px-3">
      {" "}
      <div className="flexrow mb-1 flex justify-between">
        <p className="p-1 font-semibold">
          Transactions match this filter ({transactions?.length || 0})
        </p>
        <p className="p-1 font-semibold">
          Total : {formatCurrency(overAllTotal || 0)}
        </p>
      </div>
      <Table className="rounded-lg border">
        <TableHeader className="bg-muted">
          <TableRow>
            <TableHead>Transaction ID</TableHead>
            <TableHead className="">Date & Time</TableHead>
            <TableHead className="">Total Amount</TableHead>
            <TableHead align="center" className="text-center">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions?.map((transaction) => (
            <TableRow
              onClick={() => setSelectedTransaction(transaction)}
              key={transaction.id}
              className={`cursor-pointer hover:bg-muted ${selectedTransaction?.id === transaction.id && "bg-muted"}`}
            >
              <TableCell className="flex flex-col items-start">
                {transaction.id}
              </TableCell>
              <TableCell className="">
                {format(transaction.createdAt, "PPP p")}
              </TableCell>
              <TableCell className="">
                {formatCurrency(transaction.total_amount)}
              </TableCell>
              <TableCell align="center" className="">
                {isDateWithinFiveMinutes(transaction.createdAt) && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        className="h-7 w-7"
                        variant={"destructive"}
                        size={"icon"}
                      >
                        <Trash className="w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Delete Transaction</DialogTitle>
                        <DialogDescription>
                          <div>
                            Are you sure you want to delete this transaction?
                            This action is permanent and cannot be undone.
                            Proceed?
                          </div>
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <DialogClose>
                          <Button disabled={isPending} onClick={async()=>{ await mutateAsync({ transaction_id : transaction.id})}} type="submit" variant={"destructive"}>
                            Proceed
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
