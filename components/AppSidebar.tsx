"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Package, LogOut, User, ShoppingCart, Users } from "lucide-react"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useauth"
import { useAvatar } from "@/hooks/useAvatar"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

export function AppSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const { isAdmin } = useAuth()

  // generate avatar for user
  const avatar = useAvatar(session?.user?.email || "", 90)

  const links = [
    { href: "/", label: "Dashboard", icon: Home, external: false, adminOnly: false },
    { href: "/inventory", label: "Inventory", icon: Package, external: false, adminOnly: false },
    { href: "/sales", label: "Sales", icon: ShoppingCart, external: false, adminOnly: false },
    { href: "/customers", label: "Customers", icon: Users, external: false, adminOnly: false },
    { href: "/users", label: "Users", icon: User, external: false, adminOnly: true },
  ]

  return (
    <Sidebar className="bg-white">
      <SidebarHeader className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-8">
            <Image src="/logo.png" alt="Logo" fill className="object-contain" />
          </div>
          <span className="font-bold text-lg tracking-tight">Mugathman ERP</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 mt-10">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href

                if (link.adminOnly && !isAdmin) return null

                return (
                  <SidebarMenuItem key={link.href} className="mb-4">
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={link.label}
                      className="p-5 data-[active=true]:bg-[#150150]/90 data-[active=true]:text-white"
                    >
                      <Link
                        href={link.href}
                        target={link.external ? "_blank" : undefined}
                        className="flex items-center gap-4">
                        <Icon size={24} />
                        <span className="text-base">{link.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        {session?.user ? (
          <div className="flex items-center gap-3 mb-4 p-2 rounded-lg bg-sidebar-accent/50">
            <Avatar>
              <AvatarImage src={avatar} />
              <AvatarFallback className="bg-slate-100 text-slate-500 font-bold text-xs uppercase">
                {session.user.name
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{session.user.name || "User"}</span>
              <span className="text-xs text-muted-foreground truncate">{session.user.email}</span>
            </div>
          </div>
        ) : null}

        <Button
          variant="outline"
          className="w-full justify-start text-foreground/70 hover:text-destructive hover:bg-destructive/10 border-input hover:border-destructive/30 transition-colors"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
