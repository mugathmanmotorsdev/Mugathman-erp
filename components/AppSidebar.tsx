"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Package, FileChartColumn, LogOut, User } from "lucide-react"
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
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

export function AppSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const links = [
    { href: "/admin/dashboard", label: "Dashboard", icon: Home, external: false },
    { href: "/inventory", label: "Inventory", icon: Package, external: false },
    { href: "/users", label: "Users", icon: User, external: false },
    { href: "https://lookerstudio.google.com/reporting/bd63e4d0-f4e1-4281-b2cf-217a05bd95bb", label: "Analytics", icon: FileChartColumn, external: true },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-8">
            <Image src="/logo.png" alt="Logo" fill className="object-contain" />
          </div>
          <span className="font-bold text-lg tracking-tight">Mugathman ERP</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href

                return (
                  <SidebarMenuItem key={link.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      tooltip={link.label}
                    >
                      <Link href={link.href} target={link.external ? "_blank" : undefined}>
                        <Icon />
                        <span>{link.label}</span>
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
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <User className="h-4 w-4" />
            </div>
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
