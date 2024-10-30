/* eslint-disable @next/next/no-img-element */
'use client'
import Link from "next/link"
import { Coins, LayoutDashboard, LayoutList, Menu, Package2, Salad, Settings, ShoppingCart, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { usePathname } from "next/navigation"

const paths = [
  {
    title: "Dashboard",
    path: '/admin',
    icon: <LayoutDashboard className="w-4 h-4" />
  },
  {
    title: "Orders",
    path: '/admin/orders',
    icon: <ShoppingCart className="w-4 h-4" />
  },
  {
    title: "Products",
    path: '/admin/products',
    icon: <Salad className="w-4 h-4" />
  },
  {
    title: "Transactions",
    path: '/admin/transaction',
    icon: <LayoutList className="w-4 h-4" />
  },
  {
    title: "Sales Report",
    path: '/admin/sales',
    icon: <Coins className="w-4 h-4" />
  },
  // {
  //     title : "Customers",
  //     path : '/admin/customers',
  // },
  {
    title: "Staffs",
    path: '/admin/staffs',
    icon: <UserPlus className="w-4 h-4" />
  },
  {
    title: "Settings",
    path: '/admin/settings',
    icon: <Settings className="w-4 h-4" />
  }
]

const AdminNavigation = () => {
  const pathname = usePathname()
  return (
    <div>
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="#"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <img src="/images/logo.png" alt="logo" className=" w-32" />
        </Link>
        {
          paths.map((path, index) => (
            <Link
              key={index}
              href={path.path}
              className={`${path.path !== pathname && 'text-muted-foreground '} flex flex-row gap-1 items-center transition-colors hover:text-foreground`}
            >
              {path.icon}{path.title}
            </Link>
          ))
        }
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link
              href="#"
              className="flex items-center gap-2 text-lg font-semibold md:text-base"
            >
              <img src="/images/logo.png" alt="logo" className=" w-32" />
            </Link>
            {
              paths.map((path, index) => (
                <Link
                  key={index}
                  href={path.path}
                  className={`${path.path !== pathname && 'text-muted-foreground '} flex flex-row gap-1 items-center transition-colors hover:text-foreground`}
                >
                  {path.icon}{path.title}
                </Link>
              ))
            }
          </nav>
        </SheetContent>
      </Sheet>
    </div>);
}

export default AdminNavigation;