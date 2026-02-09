import { AppSidebar } from "@/components/AppSidebar";
import Header from "@/components/Header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function MainLayout({
    children
}: {
    children: React.ReactNode
}) {

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <Header />
                <main className="flex flex-1 flex-col gap-4">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}