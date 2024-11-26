/* eslint-disable @next/next/no-img-element */
'use client'
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useStore } from "@/lib/store/app";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { uploadImage } from "@/app/helper/upload";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { Plus, PlusCircle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

const CreateProductSchema = z.object({
  image_url: z.instanceof(File)
    .optional()
    .refine((file) => !file || (file.size / 1024 / 1024) <= 10, 'File size must be less than 10MB')
    .refine((file) => file ? ['image/png', 'image/jpeg'].includes(file.type) : true, 'File must be a PNG or JPEG'),
  product_name: z.string().min(2, { message: "Product name is required." }),
  category_id: z.coerce.number(),
  amount: z.coerce.number({ message: "Invalid number" }),
})

const Page = () => {
  const [productImage, setProductImage] = useState<string|null>(null)
  const [productImageLoading, setProductImageLoading] = useState(false)
  const { id } = useParams()
  const { user } = useStore()
  const { toast } = useToast()
  const router = useRouter()
  const form = useForm<z.infer<typeof CreateProductSchema>>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: {}
  })

  const onAddCategory = () => router.push("/admin/category/")

  const onSave = () => router.push("/admin/products")

  const { data:categories, isLoading:categoriesLoading} = api.category.getCategories.useQuery()
  const { data:product, isLoading:productIsLoading} = api.product.getProduct.useQuery({
    id : Number(id)
  },{
    enabled : id!=="new"
  })

  const { mutateAsync, isPending } = api.product.upsertProduct.useMutation({
    onSuccess:()=>{
      toast({
        title:"Success!",
        description:"New Product added successfully!"
      })
      onSave()
    },
    onError : (e) =>{
      toast({
        variant:"destructive",
        title:"Uploading Image Error!",
        description:e.message
      })
    }
  })

  const _uploadImage = async (file:File | undefined) => {
    if(file){
      setProductImageLoading(true)
      return await uploadImage(file).finally(()=>setProductImageLoading(false))
    }else{
      return null
    }
  }

  const onSubmitProduct = async (data: z.infer<typeof CreateProductSchema>) => {
    let image = productImage
        
    //setter of iamge if product image was uploaded
    if(data.image_url){
      image = await _uploadImage(data.image_url)
    }
    if(!!image){
      if(user?.id){
        return mutateAsync({
          id : id ==="new" ? undefined : Number(id),
          admin_id : user.id,
          product_name:data.product_name,
          image_url:image,
          category_id:data.category_id,
          amount:data.amount
        })
      }else {
        throw new Error("User not found")
      }
    } else {
      if(!image) form.setError("image_url", {message:"Product Image is required"})
      throw new Error("Uploading Image Error")
    }
  }

  useEffect(()=>{
    if(product){
      form.setValue("amount", product.price_history[0]?.price || 0)
      form.setValue("product_name", product.product_name)
      form.setValue("category_id", product.category_id)
      setProductImage(product.image_url)
      // form.resetField("category_id",1)
    }
  },[form, product, categories])

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmitProduct)} className="flex flex-col w-full my-5 space-y-6">
          <div className="w-full space-y-6">
            <h1 className="font-medium ">Product Details</h1>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              <FormField
              disabled={productIsLoading}
                control={form.control}
                name="image_url"
                render={() => (
                  <FormItem className="flex flex-col justify-start w-full lg:col-span-1 col-span-full">
                    <FormLabel className="text-gray-600">Product Image</FormLabel>
                    <FormControl>
                      <div className="flex items-center justify-between w-40 my-2 overflow-hidden border-2 border-dashed rounded-3xl">
                        <label htmlFor="file" className="flex flex-col items-center justify-center w-full gap-2 text-xs text-gray-500 cursor-pointer aspect-square">
                          {
                                    productImage ? <img alt="Product Image" src={productImage} className="object-cover w-full h-full hover:brightness-75"/> : 
                                        <>
                                            <Plus/>
                                            <span>Product Image</span>
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
                                form.setValue("image_url", file)
                              }
                            }
                            }
                          />
                        </label>
                      </div>
                    </FormControl>
                    <FormDescription>
                      This is your image for the product.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 gap-6 col-span-full lg:col-span-3 xl:col-span-4 md:grid-cols-2">
                <FormField
              disabled={productIsLoading}
                  control={form.control}
                  name="product_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-600">Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="shadcn" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is for the name of the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
              disabled={productIsLoading}
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-gray-600">Category</FormLabel>
                      <Select 
                      onValueChange={(e)=>{
                        console.log(typeof e ,e, "sean")
                        field.onChange(e)
                      }} 
                      value={field.value?.toString()}
                      disabled={categoriesLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={`${categoriesLoading ? "Loading...":"Product Category"}`} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {
                            categories?.map((cat) => (<SelectItem value={cat.id.toString()} key={cat.id} className=" capitalize">{cat.category_name}</SelectItem>))
                          }
                          <Button size={"sm"} variant={"outline"} onClick={onAddCategory} className=" w-full"><PlusCircle className="h-3.5 w-3.5 mr-2" />Add Category</Button>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        This is for the category of the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
              disabled={productIsLoading}
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-gray-600">Product Price ( ₱ )</FormLabel>
                    <FormControl>
                        <Input {...field} placeholder="Input amount"  />
                    </FormControl>
                    <FormDescription>
                        This is the amount of the product.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
              </div>
            </div>
          </div>
          <Button type="submit" disabled={isPending || productImageLoading} className="self-end ">{"Submit Product"}</Button>
        </form>
      </Form>
    </div>
  );
}

export default Page;