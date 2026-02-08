"use client";

import { SidebarTrigger } from "./ui/sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "./ui/breadcrumb";
import { usePathname } from "next/navigation";

export default function Header() {
    const pathname = usePathname()
    const path = pathname.split("/").slice(1)

    return (
        <header className="flex h-16 bg-[#EFF3F4] shrink-0 items-center justify-between gap-2 px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <div>
                    <Breadcrumb>
                        <BreadcrumbList>
                            {path.map((item, index) => {
                                const href = index === 0 ? `/${item}` : `${path.slice(0, index).join("/")}/${item}`
                                if (item === "" && index === 0) return (
                                    <BreadcrumbItem key={index}>
                                        <BreadcrumbPage>Dashboard</BreadcrumbPage>
                                    </BreadcrumbItem>
                                )
                                return (
                                    <>
                                        <BreadcrumbItem key={index}>
                                            {
                                                index === path.length - 1 ? (
                                                    <BreadcrumbPage>{item.charAt(0).toUpperCase() + item.slice(1)}</BreadcrumbPage>
                                                ) : (
                                                    <BreadcrumbLink href={href}>{item.charAt(0).toUpperCase() + item.slice(1)}</BreadcrumbLink>
                                                )
                                            }
                                        </BreadcrumbItem>
                                        {index < path.length - 1 && <BreadcrumbSeparator />}
                                    </>
                                )
                            })}
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </div>
        </header>
    )
}