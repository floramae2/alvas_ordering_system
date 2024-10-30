"use client";
/* eslint-disable @typescript-eslint/consistent-indexed-object-style */
import { api } from "@/trpc/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { endOfDay, format, setHours, startOfDay, startOfMonth } from "date-fns";
import { type DateRange } from "react-day-picker";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { orders, products } from "@prisma/client";
import Loading from "../_components/loading";
import NoFound from "./table-components/no-found";
import { DataPagination } from "./table-components/pagination";
import { formatCurrency } from "@/app/_utils/format";
import { PaginationType } from "@/lib/types/pagination";
import { CSVLink, CSVDownload } from "react-csv";

type Sales = {
  category: string;
  product_name?: string;
  total_sales: number;
};
const Staffs = () => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: startOfMonth(setHours(new Date(), 0)),
    to: setHours(new Date(), 24),
  });
  const [showBy, setShowBy] = useState<"CATEGORY" | "PRODUCT">("PRODUCT");
  const [sortBy, setSortBy] = useState<"NAME" | "SALES">("SALES");
  const [sorting, setSorting] = useState<"ASC" | "DESC">("ASC");
  const [pagination, setPagination] = useState<PaginationType>({
    take: 20,
    skip: 0,
  });
  const [dateShow, setDateShow] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(setHours(new Date(), 0)),
    to: setHours(new Date(), 24),
  });
  const [sales, setSales] = useState<Sales[]>([]);
  const { data: transactions, isLoading } = api.sales.getSales.useQuery(
    {
      from: startOfDay(date?.from || new Date()),
      to: endOfDay(date?.to || new Date()),
    },
    {
      enabled: !!date?.from && !!date.to,
    },
  );
  useEffect(() => {
    let salesData: Sales[] = [];
    const orders = [] as (orders & { product: products; category: string })[];
    transactions?.forEach((tran) =>
      tran.orders.forEach((ord) => {
        orders.push({ ...ord, category: ord.product.category.category_name });
      }),
    );
    const data: { [key: string]: Sales } = {};
    if (showBy == "CATEGORY") {
      orders.forEach((ord) => {
        const foundData = data[ord.category];
        data[ord.category] = {
          category: ord.category,
          product_name: ord.product.product_name,
          total_sales:
            (foundData?.total_sales || 0) + (ord.quantity + ord.product.amount),
        };
      });
      console.log(data);
    } else {
      orders.forEach((ord) => {
        const foundData =
          data[ord.product.product_name + ord.product.product_name];
        data[ord.product.product_name + ord.product.product_name] = {
          category: ord.category,
          product_name: ord.product.product_name,
          total_sales:
            (foundData?.total_sales || 0) + (ord.quantity + ord.product.amount),
        };
      });
    }
    salesData = Object.values(data);
    if (sortBy === "NAME") {
      if (showBy === "CATEGORY") {
        salesData.sort((a, b) => {
          if (sorting === "ASC") {
            return a.category.localeCompare(b.category);
          } else {
            return b.category.localeCompare(a.category);
          }
        });
      } else {
        salesData.sort((a, b) => {
          if (sorting === "ASC") {
            return (a.product_name || "").localeCompare(b.product_name || "");
          } else {
            return (b.product_name || "").localeCompare(a.product_name || "");
          }
        });
      }
    } else {
      salesData.sort((a, b) => {
        if (sorting === "ASC") {
          return a.total_sales - b.total_sales;
        } else {
          return b.total_sales - a.total_sales;
        }
      });
    }
    setSales(salesData);
  }, [transactions, showBy, sortBy, sorting]);

  useEffect(() => {
    if (!!date?.from && !!date?.to) {
      setDateShow({
        from: date.from,
        to: date.to,
      });
    }
  }, [date]);
  return (
    <div className="flex w-full flex-col rounded bg-background p-5 shadow">
      <div className="mb-2 font-bold">Filter Sales</div>
      <div className="flex flex-row items-center justify-between gap-1">
        <div className="flex flex-row gap-1">
          <div className="flex flex-row gap-1 text-sm font-bold">
            <Select
              value={showBy}
              onValueChange={(e) => setShowBy(e as "CATEGORY" | "PRODUCT")}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sales</SelectLabel>
                  <SelectItem value="PRODUCT">Sales by Product</SelectItem>
                  <SelectItem value="CATEGORY">Sales by Categories</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-row gap-1 text-sm font-bold">
            <Select
              value={sortBy}
              onValueChange={(e) => setSortBy(e as "NAME" | "SALES")}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sort By</SelectLabel>
                  <SelectItem value="NAME">Sort by Name</SelectItem>
                  <SelectItem value="SALES">Sort by Sales</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-row gap-1 text-sm font-bold">
            <Select
              value={sorting}
              onValueChange={(e) => setSorting(e as "ASC" | "DESC")}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select Sorting" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Sortation</SelectLabel>
                  <SelectItem value="ASC">Ascending</SelectItem>
                  <SelectItem value="DESC">Descending</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-row items-center gap-1">
          <div className={cn("grid gap-2")}>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
          <CSVLink
            className="flex w-[150px] flex-row justify-center rounded bg-primary p-5 py-2 text-sm text-white shadow"
            data={[
              ...sales,
              {
                category: "Total Sale",
                product_name: "",
                total_sales: sales.reduce(
                  (arr, curr) => arr + curr.total_sales,
                  0,
                ),
              },
            ].map((sale) => {
              if (showBy === "CATEGORY") {
                return {
                  Category: sale.category,
                  Sale: sale.total_sales,
                };
              } else {
                return {
                  Category: sale.category,
                  ["Product name"]: sale.product_name,
                  Sale: sale.total_sales,
                };
              }
            })}
          >
            Download CSV
          </CSVLink>
        </div>
      </div>
      <div className="flex w-full flex-col gap-5">
        <div className="px-1 py-5 text-xl font-bold text-orange-500">
          Sale of {format(dateShow.from, "PPP")} to {format(dateShow.to, "PPP")}
        </div>
      </div>
      <div className="rounded border p-1 px-2 shadow">
        <Table>
          <TableHeader>
            <TableRow className="">
              {showBy === "PRODUCT" && (
                <TableHead className="text-start text-xl font-bold uppercase text-black dark:text-white">
                  Product Name
                </TableHead>
              )}
              <TableHead className="text-start text-xl font-bold uppercase text-black dark:text-white">
                Category
              </TableHead>
              <TableHead className="text-end text-xl font-bold uppercase text-black dark:text-white">
                Sales
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales
              ?.slice(pagination.skip, pagination.skip + pagination.take)
              .map((sale, index) => {
                return (
                  <TableRow key={index}>
                    {showBy === "PRODUCT" && (
                      <TableCell className="text-start">
                        {sale.product_name}
                      </TableCell>
                    )}
                    <TableCell className="text-start">
                      {sale.category}
                    </TableCell>
                    <TableCell className="text-end">
                      {formatCurrency(sale.total_sales)}
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
        {isLoading && <Loading />}
        {!isLoading && !sales.length && <NoFound />}
        <DataPagination
          count={sales.length || 0}
          filter={pagination}
          setFilter={setPagination}
        />
        <div className="flex items-center justify-end p-3 px-5 pt-0 text-base font-bold">
          Total Sales :{" "}
          {formatCurrency(
            sales.reduce((arr, curr) => arr + curr.total_sales, 0),
          )}
        </div>
      </div>
    </div>
  );
};

export default Staffs;
