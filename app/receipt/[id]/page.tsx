import Receipt from "@/components/Receipt";
import { getSale } from "@/lib/actions/sales";

export default async function Page({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const sale = await getSale(id);

    if (!sale) {
        return (
            <div className="flex items-center justify-center p-10">
                <h1 className="text-xl font-bold">Sale not found</h1>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center">
            <Receipt sale={sale as any} />
        </div>
    );
}