"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import axios from "axios"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"

const FormSchema = z.object({
  username: z.string().min(5, {
    message: "Username must be at least 5 characters.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  role: z.enum(["admin", "cashier"])
})

export function LoginCard() {
  const [loginLoading, setLoginLoading] = useState(false)
  const { toast } = useToast()
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "admin"
    },
  })

  const handleSubmit = async ({ username, password, role }: { username: string; password: string; role: "admin" | "cashier" }) => {

    const data = await axios.post('/api/auth/login', {
      username,
      password,
      role
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    localStorage.setItem("user", JSON.stringify(data.data.user || null))
    if (data.status === 200) {
      window.location.href = '/';
    } else {
      toast({
        variant: "destructive",
        title: 'An error occurred',
        description: "Please input correct credentials."
      })
    }
    return data
  };
  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      setLoginLoading(true)
      return await handleSubmit({ username: data.username, password: data.password, role: data.role }).then((data) => {
        if (data.status === 200) {
          toast({
            title: "Success login",
            description: "Welcome user."
          })
          window.location.href = '/';
        }
      }).finally(() => {
        setLoginLoading(false)
      })
    } catch (e) {
      setLoginLoading(false)
      toast({
        variant: "destructive",
        title: "User not found",
        description: "Please input correct credentials."
      })
    }
  }

  return (
    <Card className="md:w-[450px] lg:w-[450px] w-full m-5 p-2 px-3 rounded-xl">
      <CardHeader>
        <CardTitle className=" text-center text-2xl font-bold">LOGIN</CardTitle>
        <CardDescription className=" text-center text-sm text-white">{`Alva's admin's and cashier's login portal`}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={"admin"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user role to login" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="cashier">Cashier</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select user type.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem className=" relative">
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Input username" {...field} />
                  </FormControl>
                  <FormDescription>
                    Input your username.
                  </FormDescription>
                  <FormMessage className=" absolute -bottom-5" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className=" relative">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Input password" {...field} />
                  </FormControl>
                  <FormDescription>
                    Input your password.
                  </FormDescription>
                  <FormMessage className=" absolute -bottom-5" />
                </FormItem>
              )}
            />
            <div className=" pt-3">
              <Button type="submit" disabled={loginLoading} className=" text-base py-5 w-full">Login</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
