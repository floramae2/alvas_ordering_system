/* eslint-disable @typescript-eslint/no-unsafe-argument */
'use client'

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { api } from "@/trpc/react"
import { useStore } from "@/lib/store/app"
import { useEffect, useState } from "react"
import { toast } from "@/components/ui/use-toast"
import Loading from "../../_components/loading"
import { TableHeader, TableHead, Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { DataPagination } from "./table-components/pagination"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { type PaginationType } from "@/lib/types/pagination"
import { MoreHorizontal } from "lucide-react"
import NoFound from "./table-components/no-found"
import { formatCurrency } from "@/app/_utils/format"
import UpsertBarangay from "./upsert-barangay"


const SettingsPage = () => {
  const { user } = useStore()
  const [delivery_fee, setDeliveryFee] = useState<undefined | number>(undefined)
  const [password, setPassword] = useState({
    defaultPassForStaff: "",
    show: false
  })
  const [pagination, setPagination] = useState<PaginationType>({
    take: 10,
    skip: 0
  })
  const [openAddBarangay, setOpenAddBarangay] = useState<undefined | number>(undefined)
  const { data: barangays, isPending: barangaayIsPending } = api.user_customer.account.getBarangays.useQuery()


  const onSuccess = ({ description }: { description: string }) => {
    toast({
      title: "Saved!",
      description
    })
  }

  const { data: settings, isPending } = api.settings.getSettings.useQuery({
    admin_id: Number(user?.id)
  }, {
    enabled: !!user
  })

  const { mutate: updateDeliveryFee, isPending: updateDeliveryFeeIsPending } = api.settings.updateDeliveryFee.useMutation({
    onSuccess: () => onSuccess({ description: "Delivery fee updated successfully." })
  })

  const { mutate: updateDefaultPassForStaff, isPending: updateDefaultPassForStaffIsPending } = api.settings.updateDefaultPassForStaff.useMutation({
    onSuccess: () => onSuccess({ description: "Password changed successfully." })
  })

  useEffect(() => {
    if (settings) {
      setDeliveryFee(settings.delivery_fee)
      setPassword(prev => ({ ...prev, defaultPassForStaff: settings.defaultPassForStaff }))
    }
  }, [settings])


  if (isPending) {
    return <Loading />
  }

  return (
    <div className="grid gap-6">
      <UpsertBarangay open={openAddBarangay} setOpen={setOpenAddBarangay}/>


      <Card x-chunk="dashboard-04-chunk-1">
        <CardHeader>
          <div className="  flex flex-row justify-between">
            <div>
              <CardTitle>Barangays & Delivery Fee</CardTitle>
              <CardDescription className=" mt-2">
                {"Barangays included for deliveries."}
              </CardDescription>
            </div>
            <Button
              disabled={!delivery_fee || delivery_fee < 1 || updateDeliveryFeeIsPending}
              onClick={() => { setOpenAddBarangay(0)}}
            >Add Barangay</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Barangay</TableHead>
                <TableHead className=" w-200">
                  <span >Delivery Fee</span>
                </TableHead>
                <TableHead className=" w-20">
                  <span ></span>
                </TableHead>
              </TableRow>
            </TableHeader>
            {(!barangaayIsPending && barangays?.length) ? <TableBody>
              {
                barangays.slice(pagination.skip, pagination.skip + pagination.take).map((prod, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {prod.label}
                    </TableCell>
                    <TableCell className=" w-200">
                      {formatCurrency(prod.delivery_fee)}
                    </TableCell>
                    <TableCell className=" w-40">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <Button onClick={() => setOpenAddBarangay(prod.value)} size={"sm"} variant={"outline"} className=" w-full">
                            Edit
                          </Button>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>))
              }
            </TableBody> : <></>}
          </Table>
          {barangaayIsPending && <Loading />}
          {!barangaayIsPending && !barangays?.length && <NoFound />}
          <DataPagination count={barangays?.length || 0} filter={pagination} setFilter={setPagination} />
        </CardContent>
      </Card>


      <Card x-chunk="dashboard-04-chunk-1">
        <CardHeader>
          <CardTitle>Default Password</CardTitle>
          <CardDescription>
            {"Setting for default password on creating new staffs."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className=" text-sm text-gray-800">Password</div>
          <div className=" w-full flex flex-row gap-2 items-center">
            <Input type={password.show ? "text" : "password"} value={password.defaultPassForStaff} onChange={(e) => setPassword(prev => ({ ...prev, defaultPassForStaff: e.target.value }))} placeholder="Input password" />
            <div
              onClick={() => setPassword(prev => ({ ...prev, show: !prev.show }))}
              className=" text-sm text-gray-600 cursor-pointer"
            >{password.show ? "Hide" : "Show"}</div>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4 flex justify-end">
          <Button
            disabled={updateDefaultPassForStaffIsPending}
            onClick={() => {
              if (password.defaultPassForStaff.length >= 8) {
                updateDefaultPassForStaff({ defaultPassForStaff: password.defaultPassForStaff, admin_id: Number(user?.id) })
              } else {
                toast({
                  variant: "destructive",
                  title: "Invalid password",
                  description: "Password should be atleast 8 characters"
                })
              }
            }}
          >Save</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default SettingsPage;