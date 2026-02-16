import Image from "next/image";
import { Sale } from "@/types/sale";


export default function Receipt({
    sale
}: {
    sale: Sale
}) {

    const date = new Date(sale.created_at);

    const subtotal = sale.sale_items.reduce((acc, item) => acc + Number(item.unit_price) * Number(item.quantity), 0);
    const total = subtotal;

    return (
        <div className="w-full max-w-[210mm] min-h-[297mm] bg-white text-slate-900 p-12 md:p-16 text-sm leading-relaxed shadow-lg mx-auto print:shadow-none print:w-full">
            {/* Header */}
            <div className="flex justify-between items-start mb-16">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        {/* Logo Placeholder */}
                        <div className="flex flex-col gap-3">
                            <div className="relative h-20 w-20">
                                <Image src="/logo.png" alt="Logo" fill className="object-contain" />
                            </div>
                            <span className="font-bold text-2xl tracking-tight">Mugathman Motors</span>
                        </div>
                    </div>

                    <div className="mt-8 space-y-1 text-slate-600">
                        <p className="font-bold mt-4 block text-slate-800">
                            Name : <span className="font-normal">{sale.customer.full_name}</span>
                        </p>
                        <p className="font-bold mt-4 block text-slate-800">
                            Phone : <span className="font-normal ">{sale.customer.phone}</span>
                        </p>
                        <p className="font-bold mt-4 block text-slate-800">
                            Date : <span className="font-normal">{date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                        </p>
                    </div>
                </div>

                <div className="text-right space-y-8 mt-12">
                    <div>
                        <h2 className="text-4xl font-black text-[#150151]/90 tracking-wide uppercase">
                            Receipt
                        </h2>
                    </div>

                    <div className="text-left">
                        <p className="font-bold text-slate-800">Office Address</p>
                        <p>
                            Danladi Nasidit, Housing Estate, <br />
                            Kumbotso, Kano State, Nigeria
                        </p>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
                {/* Table Header */}
                <div className="flex items-center bg-[#150151] text-white px-6 py-3 font-bold uppercase text-xs tracking-wider">
                    <div className="flex-[3]">Items Description</div>
                    <div className="flex-1 text-right">Unit Price</div>
                    <div className="flex-1 text-center">Qnt</div>
                    <div className="flex-1 text-right">Total</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-slate-200 border-b border-slate-200">
                    {sale.sale_items.map((item) => (
                        <div key={item.id} className="flex items-start px-6 py-4 text-slate-700">
                            <div className="flex-[3] pr-8">
                                <p className="font-bold text-slate-900 mb-1">{item.product.name}</p>
                            </div>
                            <div className="flex-1 text-right font-medium py-1">
                                {Number(item.unit_price).toLocaleString()}
                            </div>
                            <div className="flex-1 text-center font-medium py-1">{Number(item.quantity)}</div>
                            <div className="flex-1 text-right font-bold text-slate-900 py-1">
                                {(Number(item.unit_price) * Number(item.quantity)).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Summary Section */}
            <div className="flex gap-12 justify-end mb-16 items-center">
                <div className="space-y-3">
                    <div className="flex justify-between px-6 py-1 text-slate-600 border-b border-slate-100 pb-2">
                        <span className="font-bold uppercase text-xs tracking-wider">Subtotal: </span>
                        <span className="font-bold text-slate-800">{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center bg-[#150151] text-white px-6 py-3 mt-4">
                        <span className="font-bold uppercase tracking-wider text-sm">Total Due:</span>
                        <span className="font-bold text-xl"> {total.toLocaleString()}</span>
                    </div>
                </div>
            </div>



            <div className="mb-10">
                <h3 className="text-[#150151] font-bold text-lg">Thank you for your Business</h3>
            </div>

            {/* Footer Info */}
            <div className="flex gap-15 border-t border-[#150151] pt-8 text-xs">
                <div className="flex-1">
                    <h4 className="font-bold text-slate-800 mb-3 text-sm">Questions?</h4>
                    <div className="space-y-1 text-slate-500">
                        <div className="flex gap-2">
                            <span className="font-bold text-slate-700 min-w-[60px]">Email us</span>
                            <span> : info@mugathmanmotors.com</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="font-bold text-slate-700 min-w-[60px]">Call us</span>
                            <span> : +628 123 456 789</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}