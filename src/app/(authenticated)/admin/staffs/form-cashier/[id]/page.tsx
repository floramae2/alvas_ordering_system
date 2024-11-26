'use client'
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { z } from "zod";

import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store/app";
import { toast } from "@/components/ui/use-toast";
import { onlyString } from "@/app/helper/regex";
import { Plus } from "lucide-react";
import { uploadImage } from "@/app/helper/upload";

const CreateCashier = z.object({
    // admin_id     Int
    username: z.string().min(8, { message: "Username should be atleast 8 characters." }),
    // password     String
    first_name: onlyString,
    middle_name: onlyString,
    last_name: onlyString,
    profile_image: z.instanceof(File)
        .optional()
        .refine((file) => !file || (file.size / 1024 / 1024) <= 10, 'File size must be less than 10MB')
        .refine((file) => file ? ['image/png', 'image/jpeg'].includes(file.type) : true, 'File must be a PNG or JPEG'),
})

const FormCashier = () => {
    const { id } = useParams()
    const { user } = useStore()
    const router = useRouter()

    const [productImage, setProductImage] = useState<string | null>(null)
    const [productImageLoading, setProductImageLoading] = useState(false)
    const { data: cashier, isLoading: cashierIsLoading } = api.cashier.getCashier.useQuery({
        id: Number(id)
    }, {
        enabled: id !== "new"
    })
    const form = useForm<z.infer<typeof CreateCashier>>({
        resolver: zodResolver(CreateCashier),
        values: !!cashier ? {
            first_name: cashier.first_name,
            middle_name: cashier.middle_name,
            last_name: cashier.last_name,
            username: cashier.username,
        } : undefined
    })
    const { refetch } = api.cashier.getAllCashier.useQuery()

    const _uploadImage = async (file: File | undefined) => {
        if (file) {
            setProductImageLoading(true)
            return await uploadImage(file).finally(() => setProductImageLoading(false))
        } else {
            return null
        }
    }

    const { mutateAsync: createCashier, isPending: createCashierPending } = api.cashier.createCashier.useMutation({
        onSuccess: async () => {
            toast({
                title: "Success!",
                description: id === "new" ? "Cashier added successfully!" : "Cashier updated successfully!"
            })
            await refetch()
            router.push("/admin/staffs")
        },
        onError: (e) => {
            if (e.message.includes("Unique constraint failed on the fields")) {
                toast({
                    variant: "destructive",
                    title: "Failed",
                    description: "Username already used."
                })
                form.setError("username", { message: "Username already used." })
            } else {
                toast({
                    variant: "destructive",
                    title: "Failed",
                    description: e.message
                })
            }
        }
    })

    const onSubmitProduct = async (data: z.infer<typeof CreateCashier>) => {

        let image = productImage
        //setter of image if product image was uploaded
        if (data.profile_image) {
            image = await _uploadImage(data.profile_image)
        }
        if (!!image) {
            if (user?.id) {
                await createCashier({
                    id: id === "new" ? undefined : Number(id),
                    admin_id: user.id,
                    ...data,
                    profile_image: image
                })
            } else {
                throw new Error("User not found")
            }
        } else {
            if (!image) form.setError("profile_image", { message: "Profile Image is required" })
            throw new Error("Uploading Image Error")
        }
    }

    useEffect(() => {
        if (cashier) {
            // form.setValue("username", cashier.username)
            // form.setValue("first_name", cashier.first_name)
            // form.setValue("middle_name", cashier.middle_name)
            // form.setValue("last_name", cashier.last_name)
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            setProductImage(cashier.profile_image)
        }
    }, [form, cashier])


    return (

        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitProduct)} className="flex flex-col w-full space-y-6 p-5 sm:px-10 border rounded-lg shadow-md">
                <div className="w-full space-y-6">
                    <h1 className="font-semibold text-xl">{id !== "new" ? "Update Cashier" : "Create Cashier"}</h1>
                    <FormField
                        disabled={cashierIsLoading}
                        control={form.control}
                        name="profile_image"
                        render={() => (
                            <FormItem className="flex flex-col justify-start w-full lg:col-span-1 col-span-full">
                                <FormLabel className="text-gray-600">Product Image</FormLabel>
                                <FormControl>
                                    <div className="flex items-center justify-between w-40 my-2 overflow-hidden border-2 border-dashed rounded-3xl">
                                        <label htmlFor="file" className="flex flex-col items-center justify-center w-full gap-2 text-xs text-gray-500 cursor-pointer aspect-square">
                                            {
                                                productImage ? <img alt="Profile Image" src={productImage} className="object-cover w-full h-full hover:brightness-75" /> :
                                                    <>
                                                        <Plus />
                                                        <span>Profile Image</span>
                                                    </>
                                            }
                                            <input
                                                id="file"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            const base64String = reader.result as string;
                                                            setProductImage(base64String);
                                                        };
                                                        reader.readAsDataURL(file);
                                                        form.setValue("profile_image", file)
                                                    }
                                                }
                                                }
                                            />
                                        </label>
                                    </div>
                                </FormControl>
                                <FormDescription>
                                    This is for staff's profile picture.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className=" grid sm:grid-cols-2 gap-5">
                        <FormField
                            disabled={cashierIsLoading}
                            control={form.control}
                            name="first_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="">First Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Input first name" />
                                    </FormControl>
                                    <FormDescription>
                                        This is for the first name of the cashier.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            disabled={cashierIsLoading}
                            control={form.control}
                            name="middle_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="">Middle Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Input middle name" />
                                    </FormControl>
                                    <FormDescription>
                                        This is for the middle name of the cashier.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            disabled={cashierIsLoading}
                            control={form.control}
                            name="last_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="">Last Name</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Input last name" />
                                    </FormControl>
                                    <FormDescription>
                                        This is for the last name of the cashier.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            disabled={cashierIsLoading}
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="">Username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Input username" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        This is for the username of the cashier to use as credential.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
                <div className=" flex flex-col gap-5 sm:flex-row w-full justify-between items-end">
                    <div className=" text-xs text-orange-400"><span className=" font-semibold">Note:</span> Passwords are auto-generated based on the default password set in admin settings.</div>
                    <Button type="submit" disabled={productImageLoading || createCashierPending || cashierIsLoading} className="self-end ">{"Submit Cashier"}</Button>
                </div>
            </form>
        </Form>
    );
}

export default FormCashier;