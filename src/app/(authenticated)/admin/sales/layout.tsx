'use client'

const Layout = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  return ( 
      <div className=" flex flex-col">
        <div className="mx-auto grid w-full max-w-7xl gap-2">
          <h1 className="text-3xl font-semibold">Sales Report</h1>
          <div className="px-6 py-2 space-y-5 lg:px-10 lg:container">
            {children}
          </div>
        </div>
      </div>
      );
}

export default Layout;