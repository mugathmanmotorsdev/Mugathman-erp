"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Package, FileChartColumn, Menu, LogOut, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  const links = [
    { href: "/", label: "Sales", icon: Home },
    { href: "/inventory", label: "Inventory", icon: Package },
    { href: "https://lookerstudio.google.com/reporting/bd63e4d0-f4e1-4281-b2cf-217a05bd95bb", label: "Report", icon: FileChartColumn, external: true },
  ]

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
       {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden animate-fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border shadow-xl transform transition-transform duration-300 ease-in-out md:translate-x-0 md:relative md:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex h-16 items-center px-6 border-b border-sidebar-border bg-sidebar/50 backdrop-blur-sm">
                <div className="relative h-8 w-8 mr-3">
                    <Image src="/logo.png" alt="Logo" fill className="object-contain" />
                </div>
                <span className="font-bold text-lg text-sidebar-foreground tracking-tight">Mugathman ERP</span>
            </div>
            
            {/* Links */}
            <nav className="flex-1 flex flex-col py-6 gap-1 px-3 overflow-y-auto">
                <div className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2 px-3">
                    Menu
                </div>
                {links.map((link) => {
                    const Icon = link.icon
                    const isActive = pathname === link.href
                    return (
                        <Link 
                            key={link.href}
                            href={link.href}
                            target={link.external ? "_blank" : undefined}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                                "group flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ease-in-out cursor-pointer",
                                isActive 
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" 
                                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground hover:translate-x-1"
                            )}
                        >
                            <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                            {link.label}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer / User Profile */}
            <div className="border-t border-sidebar-border p-4 bg-sidebar/50 backdrop-blur-sm">
                {session?.user ? (
                     <div className="flex items-center gap-3 mb-4 p-2 rounded-lg bg-sidebar-accent/50">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <User className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-medium text-sidebar-foreground truncate">{session.user.name || "User"}</span>
                            <span className="text-xs text-sidebar-foreground/60 truncate">{session.user.email}</span>
                        </div>
                    </div>
                ) : null}
                
                <Button 
                    variant="outline" 
                    className="w-full justify-start text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 border-sidebar-border hover:border-destructive/30 transition-colors"
                    onClick={() => signOut()}
                >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                </Button>
            </div>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <main className="flex-1 flex flex-col h-full bg-background relative overflow-hidden">
        {/* Mobile Header */}
        <header className="flex items-center justify-between h-16 px-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-30 md:hidden">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} className="md:hidden">
                    <Menu className="h-5 w-5" />
                </Button>
                <div className="font-semibold text-lg">Mugathman ERP</div>
            </div>
             <div className="relative h-6 w-6">
                <Image src="/logo.png" alt="Logo" fill className="object-contain" />
            </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl animate-slide-up">
                {children}
            </div>
        </div>
      </main>
    </div>
  )
}
