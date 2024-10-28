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
import Loading from "./_components/loading"
import React, { useEffect, useState } from "react"
import { useStore } from "@/lib/store/app"
import { toast } from "@/components/ui/use-toast"
import { api } from "@/trpc/react"
import { Input } from "@/components/ui/input"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const CashierDetailsSchema = z.object({
    first_name: z.string().min(2, { message: "First name is required." }),
    middle_name: z.string().min(2, { message: "middle name is required." }),
    last_name: z.string().min(2, { message: "Last name is required." }),
})
const Page = () => {
    const { user } = useStore()
    const [employeeId, setEmployeeId] = useState({
        id: 0,
        employeeID: ""
    })
    const [employeePassword, setEmployeePassword] = useState({
        id: 0,
        isChangesPass: false,
        password: {
            value: "",
            show: false
        },
        newPassword: {
            value: "",
            show: false
        },
        confirmNewPassword: {
            value: "",
            show: false
        },
    })
    const { data: settings, isPending } = api.user_cashier.account.getAccountDetails.useQuery({
        id: user?.id || 0
    }, {
        enabled: !!user?.id
    })

    const form = useForm<z.infer<typeof CashierDetailsSchema>>({
      resolver: zodResolver(CashierDetailsSchema),
      values: !!settings ? {
        first_name :settings.first_name,
        middle_name :settings.middle_name,
        last_name :settings.last_name,
      } : undefined
    })

    const onSuccess = ({ description }: { description: string }) => {
        toast({
            title: "Saved!",
            description
        })
    }

    const { mutate: updateEmployeeID, isPending: updateEmployeeIDIsPending } = api.user_cashier.account.updateUsername.useMutation({
        onSuccess: () => onSuccess({ description: "Username updated successfully." })
    })

    const { mutate: updateCashierDetails, isPending: updateCashierDetailsIsPending } = api.user_cashier.account.updateCashierDetails.useMutation({
        onSuccess: () => onSuccess({ description: "Cashier's details updated successfully." }),
        onError: (e: { message: any }) => {
            toast({
                variant: "destructive",
                title: "Failed",
                description: e.message
            })
        }
    })

    const { mutate: updateSuperAdminPass, isPending: updateSuperAdminPassIsPending } = api.user_cashier.account.updateCashierPass.useMutation({
        onSuccess: () => {
            onSuccess({ description: "Password updated password." })
            setEmployeePassword({
                id: 0,
                isChangesPass: false,
                password: {
                    value: "",
                    show: false
                },
                newPassword: {
                    value: "",
                    show: false
                },
                confirmNewPassword: {
                    value: "",
                    show: false
                },
            })
        },
        onError: (e: { message: any }) => {
            toast({
                variant: "destructive",
                title: "Failed",
                description: e.message
            })
        }
    })

    const onChangePassword = () => {
        if (employeePassword.newPassword.value.length < 8 || employeePassword.password.value.length < 8) {
            toast({
                variant: "destructive",
                title: "Input Error!",
                description: "Password must be longer than 8 characters."
            })
        } else if (employeePassword.newPassword.value !== employeePassword.confirmNewPassword.value) {
            toast({
                variant: "destructive",
                title: "Input Error!",
                description: "Password does not match."
            })
        } else {
            updateSuperAdminPass({
                id: employeePassword.id,
                password: employeePassword.password.value,
                newPassword: employeePassword.newPassword.value
            })
        }
    }

    const onSubmit = async (data: z.infer<typeof CashierDetailsSchema>) => {
        if (user?.id) {
            updateCashierDetails({
                id:user.id,
                ...data
            })
        } else {
          throw new Error("User not found")
        }
      }

    useEffect(() => {
        if (settings) {
            const {
                id,
                username,
            } = settings
            setEmployeeId({
                id,
                employeeID: username,
            })
            setEmployeePassword(prev => ({
                ...prev,
                id
            }))
        }
    }, [settings])
    return (
        <div className="grid lg:grid-cols-2 w-full gap-5">
            <div>
                <Card x-chunk="dashboard-04-chunk-1" className=" w-full relative">
                    {(isPending) &&
                        <div className=" absolute bg-background bg-opacity-50 z-10 top-0 left-0 right-0 bottom-0 flex items-center justify-center" style={{ opacity: .5 }}>
                            <Loading />
                        </div>}
                    <CardHeader>
                        <CardTitle>{"Cashier's Details"}</CardTitle>
                        <CardDescription>
                            Modify details of the cashier.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col w-full space-y-6">
                                <div className="w-full">
                                    <div className="flex justify-center items-center flex-col">
                                        <div className=" w-full flex flex-col gap-3">
                                            <FormField
                                                control={form.control}
                                                name="first_name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-gray-600">First Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Input first name" {...field} />
                                                        </FormControl>
                                                        <FormDescription>
                                                            This is the first name of the cashier.
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="middle_name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-gray-600">Middle Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Input middle name" {...field} />
                                                        </FormControl>
                                                        <FormDescription>
                                                            This is the middle name of the cashier.
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="last_name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-gray-600">Last Name</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Input last name" {...field} />
                                                        </FormControl>
                                                        <FormDescription>
                                                            This is the last name of the cashier.
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className=" flex flex-row gap-1 items-end justify-end w-full">
                                                <Button type="submit" disabled={updateCashierDetailsIsPending}>Save</Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </Form>

                    </CardContent>
                </Card>
            </div>

            <div className=" flex flex-col gap-5">
                <Card x-chunk="dashboard-04-chunk-1" className=" w-full relative">
                    {(isPending) &&
                        <div className=" absolute bg-background bg-opacity-50 z-10 top-0 left-0 right-0 bottom-0 flex items-center justify-center" style={{ opacity: .5 }}>
                            <Loading />
                        </div>}
                    <CardHeader>
                        <CardTitle>Username</CardTitle>
                        <CardDescription>
                            This is the username of the cashier.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className=" flex md:flex-row items-end gap-4">
                            <div className=" flex-1">
                                <div className=" text-sm">Employee ID</div>
                                <Input value={employeeId.employeeID} onChange={(e: { target: { value: string } }) => setEmployeeId(prev => ({ ...prev, employeeID: (e.target.value) }))} placeholder="Employee ID" />
                            </div>

                            <Button className=" px-6" disabled={updateEmployeeIDIsPending} onClick={() => updateEmployeeID({
                                ...employeeId,
                                username: employeeId.employeeID
                            })}>Save</Button>
                        </div>

                    </CardContent>
                </Card>
                <Card x-chunk="dashboard-04-chunk-1" className=" w-full relative">
                    {(isPending) &&
                        <div className=" absolute bg-background bg-opacity-50 z-10 top-0 left-0 right-0 bottom-0 flex items-center justify-center" style={{ opacity: .5 }}>
                            <Loading />
                        </div>}
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>
                            Change password settings for cashier.
                        </CardDescription>
                    </CardHeader>
                    {
                        employeePassword.isChangesPass ?
                            <CardContent className=" space-y-5">
                                <div>
                                    <div className=" text-sm">Password</div>
                                    <div className=" w-full flex flex-row gap-2 items-center">
                                        <Input type={employeePassword.password.show ? "text" : "password"}
                                            className=" xl:w-[400px]"
                                            value={employeePassword.password.value}
                                            onChange={(e: { target: { value: any } }) => setEmployeePassword(prev => ({
                                                ...prev, password: {
                                                    ...prev.password,
                                                    value: e.target.value
                                                }
                                            }))} placeholder="Input password" />
                                        <div
                                            onClick={() => setEmployeePassword(prev => ({
                                                ...prev, password: {
                                                    ...prev.password,
                                                    show: !prev.password.show
                                                }
                                            }))}
                                            className=" text-sm text-gray-600 cursor-pointer"
                                        >{employeePassword.password.show ? "Hide" : "Show"}</div>
                                    </div>
                                </div>
                                <div>
                                    <div className=" text-sm">New Password</div>
                                    <div className=" w-full flex flex-row gap-2 items-center">
                                        <Input type={employeePassword.newPassword.show ? "text" : "password"}
                                            className=" xl:w-[400px]"
                                            value={employeePassword.newPassword.value}
                                            onChange={(e: { target: { value: any } }) => setEmployeePassword(prev => ({
                                                ...prev, newPassword: {
                                                    ...prev.newPassword,
                                                    value: e.target.value
                                                }
                                            }))} placeholder="Input new password" />
                                        <div
                                            onClick={() => setEmployeePassword(prev => ({
                                                ...prev, newPassword: {
                                                    ...prev.newPassword,
                                                    show: !prev.newPassword.show
                                                }
                                            }))}
                                            className=" text-sm text-gray-600 cursor-pointer"
                                        >{employeePassword.newPassword.show ? "Hide" : "Show"}</div>
                                    </div>
                                </div>
                                <div>
                                    <div className=" text-sm">Confirm Password</div>
                                    <div className=" w-full flex flex-row gap-2 items-center">
                                        <Input type={employeePassword.confirmNewPassword.show ? "text" : "password"}
                                            className=" xl:w-[400px]"
                                            value={employeePassword.confirmNewPassword.value}
                                            onChange={(e: { target: { value: any } }) => setEmployeePassword(prev => ({
                                                ...prev, confirmNewPassword: {
                                                    ...prev.confirmNewPassword,
                                                    value: e.target.value
                                                }
                                            }))} placeholder="Input password" />
                                        <div
                                            onClick={() => setEmployeePassword(prev => ({
                                                ...prev, confirmNewPassword: {
                                                    ...prev.confirmNewPassword,
                                                    show: !prev.confirmNewPassword.show
                                                }
                                            }))}
                                            className=" text-sm text-gray-600 cursor-pointer"
                                        >{employeePassword.confirmNewPassword.show ? "Hide" : "Show"}</div>
                                    </div>
                                </div>
                            </CardContent> :
                            <div>

                            </div>
                    }

                    <div className=" px-6 pb-6">

                        {
                            employeePassword.isChangesPass ? <div className=" flex flex-row gap-1">
                                <Button variant={"outline"} onClick={() => setEmployeePassword(prev => ({ ...prev, isChangesPass: false }))}>Cancel</Button>
                                <Button className="px-6" disabled={updateSuperAdminPassIsPending} onClick={() => onChangePassword()}>Save</Button>
                            </div> :
                                <div>
                                    <p className=" h-5"></p>
                                    <Button className="px-6" onClick={() => setEmployeePassword(prev => ({ ...prev, isChangesPass: true }))}>Change</Button>
                                </div>
                        }
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default Page;