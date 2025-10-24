"use client"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/hooks/use-auth"
import { BarChart2, LogOut, Map, Menu, Plus, ShieldCheck, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { FaGithub } from "react-icons/fa"

export default function Navbar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const routes = [
    {
      href: "/issues",
      label: "Public Issues",
      active: pathname === "/issues",
    },
    {
      href: "/map",
      label: "Map View",
      active: pathname === "/map",
    },
    {
      href: "/analytics",
      label: "Analytics",
      active: pathname === "/analytics",
    },
  ]

  const authRoutes = [
    {
      href: "/issues/new",
      label: "Report Issue",
      active: pathname === "/issues/new",
      icon: <Plus className="mr-2 h-4 w-4" />,
    },
    {
      href: "/my-issues",
      label: "My Issues",
      active: pathname === "/my-issues",
      icon: <User className="mr-2 h-4 w-4" />,
    },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center space-x-2 group">
          <ShieldCheck className="h-8 w-8 text-blue-600 group-hover:text-blue-800 transition duration-300" />
          <span className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 text-transparent bg-clip-text transition duration-300 drop-shadow-sm group-hover:drop-shadow-lg">
            CivicSync
          </span>

        </Link>

        <div className="hidden md:flex items-center justify-between flex-1">
          <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={`text-sm font-medium transition-colors hover:text-primary ${route.active ? "text-primary" : "text-muted-foreground"
                  }`}
              >
                {route.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center space-x-4">
            <Link
              href="https://github.com/RHL-RWT-01/CivicSync1"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary"
            >
              <FaGithub className="h-5 w-5 text-muted-foreground text-blue-500 shadow-md shadow-blue-500/50 transition" />

            </Link>
            <ThemeToggle />
            {user ? (
              <>
                {authRoutes.map((route) => (
                  <Link key={route.href} href={route.href}>
                    <Button
                      variant={route.href === "/issues/new" ? "default" : "outline"}
                      size="sm"
                      className="hidden lg:flex"
                    >
                      {route.icon}
                      {route.label}
                    </Button>
                  </Link>
                ))}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full p-0 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition"
                    >
                      <span className="sr-only">Open user menu</span>
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <span className="text-sm font-semibold">
                          {user.email?.charAt(0).toUpperCase() || "U"}
                        </span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/my-issues" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" /> My Issues
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/analytics" className="cursor-pointer">
                        <BarChart2 className="mr-2 h-4 w-4" /> Analytics
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/map" className="cursor-pointer">
                        <Map className="mr-2 h-4 w-4" /> Map View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" /> Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
        <div className="md:hidden flex items-center ml-auto">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setIsOpen(false)}
                    className={`text-sm font-medium transition-colors hover:text-primary ${route.active ? "text-primary" : "text-muted-foreground"
                      }`}
                  >
                    {route.label}
                  </Link>
                ))}
                <div className="flex items-center justify-start gap-4 py-2">
                  <Link
                    href="https://github.com/RHL-RWT-01/CivicSync1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <FaGithub className="h-5 w-5 text-muted-foreground hover:text-blue-500 hover:shadow-md hover:shadow-blue-500/50 transition" />

                  </Link>
                  <ThemeToggle />
                </div>
                {user ? (
                  <div className="border-t pt-4 mt-4">
                    {authRoutes.map((route) => (
                      <Link
                        key={route.href}
                        href={route.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center py-2 text-sm font-medium transition-colors hover:text-primary"
                      >
                        {route.icon}
                        {route.label}
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        signOut()
                        setIsOpen(false)
                      }}
                      className="flex items-center py-2 text-sm font-medium text-red-500 transition-colors hover:text-red-600 w-full"
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Log out
                    </button>
                  </div>
                ) : (
                  <div className="border-t pt-4 mt-4 space-y-4">
                    <Link href="/auth/login" onClick={() => setIsOpen(false)} className="block">
                      <Button variant="outline" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/register" onClick={() => setIsOpen(false)} className="block">
                      <Button className="w-full">Sign Up</Button>
                    </Link>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
