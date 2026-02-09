import Image from "next/image";


interface ReceiptItem {
    id: string;
    description: string;
    unitPrice: number;
    quantity: number;
    total: number;
}

interface ReceiptProps {
    receiptNo?: string;
    date?: Date;
    customer?: {
        name: string;
        address: string;
        phone?: string;
    };
    items?: ReceiptItem[];
    subtotal?: number;
    tax?: number; // As amount
    discount?: number; // As amount
    total?: number;
}

export default function Receipt({
    receiptNo = "INV-001",
    date = new Date(),
    customer = {
        name: "Wagino Subianto",
        address: "Main street, Your Loc.\nNumber 06/B",
    },
    items = [
        {
            id: "1",
            description: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt",
            unitPrice: 20.00,
            quantity: 1,
            total: 20.00,
        },
        {
            id: "2",
            description: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt",
            unitPrice: 50.00,
            quantity: 1,
            total: 50.00,
        },
        {
            id: "3",
            description: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt",
            unitPrice: 30.00,
            quantity: 1,
            total: 30.00,
        },
        {
            id: "4",
            description: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt",
            unitPrice: 60.00,
            quantity: 1,
            total: 60.00,
        },
    ],
    subtotal = 160.00,
    tax = 22.00,
    discount = 12.00,
    total = 182.00,
}: ReceiptProps) {
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
                            <span className="font-bold text-2xl tracking-tight">Mugathman ERP</span>
                        </div>
                    </div>

                    <div className="mt-8 space-y-1 text-slate-600">
                        <p className="font-bold text-slate-800">Office Address</p>
                        <p>Main street, Number 06/B,</p>
                        <p>South Mountain, YK</p>
                        <p className="font-bold mt-4 block text-slate-800">
                            Phone : <span className="font-normal ">(+212) 6 66 66 66 66</span>
                        </p>
                        <p className="font-bold mt-4 block text-slate-800">
                            Email : <span className="font-normal">[EMAIL_ADDRESS]</span>
                        </p>
                        <p className="font-bold mt-4 block text-slate-800">
                            Date : <span className="font-normal">{date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                        </p>
                    </div>
                </div>

                <div className="text-right space-y-8">
                    <div>
                        <h2 className="text-4xl font-black text-[#150151]/90 tracking-wide uppercase">
                            Receipt
                        </h2>
                    </div>

                    <div className="text-left">
                        <p className="font-bold text-slate-800 mb-1">To:</p>
                        <p className="font-bold text-lg text-slate-900">{customer.name}</p>
                        <div className="text-slate-600 whitespace-pre-line">
                            {customer.address}
                        </div>
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
                    {items.map((item) => (
                        <div key={item.id} className="flex items-start px-6 py-4 text-slate-700">
                            <div className="flex-[3] pr-8">
                                <p className="font-bold text-slate-900 mb-1">{item.id === "1" ? "Items Name" : "Items Name"}</p> {/* Using generic name as per design */}
                            </div>
                            <div className="flex-1 text-right font-medium py-1">
                                ${item.unitPrice.toFixed(2)}
                            </div>
                            <div className="flex-1 text-center font-medium py-1">{item.quantity}</div>
                            <div className="flex-1 text-right font-bold text-slate-900 py-1">
                                ${item.total.toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Summary Section */}
            <div className="flex gap-12 justify-between mb-16 items-center">
                {/* Notes */}
                <div className="flex-1">
                    <h4 className="font-bold text-slate-800 mb-2 text-xs uppercase tracking-wider">Note:</h4>
                    <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                        Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt autem vel eum iriure dolor in hendrerit
                    </p>
                </div>

                <div className="flex-1 space-y-3">
                    <div className="flex justify-between px-6 py-1 text-slate-600 border-b border-slate-100 pb-2">
                        <span className="font-bold uppercase text-xs tracking-wider">Subtotal :</span>
                        <span className="font-bold text-slate-800">${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between px-6 py-1 text-slate-600 border-b border-slate-100 pb-2">
                        <span className="font-bold uppercase text-xs tracking-wider">Tax VAT 15% :</span>
                        <span className="font-bold text-slate-800">${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between px-6 py-1 text-slate-600 border-b border-slate-100 pb-2">
                        <span className="font-bold uppercase text-xs tracking-wider">Discount 5% :</span>
                        <span className="font-bold text-slate-800">${discount.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-center bg-[#150151] text-white px-6 py-3 mt-4">
                        <span className="font-bold uppercase tracking-wider text-sm">Total Due :</span>
                        <span className="font-bold text-xl">${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>



            <div className="mb-10">
                <h3 className="text-[#150151] font-bold text-lg">Thank you for your Business</h3>
            </div>

            {/* Footer Info */}
            <div className="flex gap-20 border-t border-[#150151] pt-8 text-xs">
                <div>
                    <h4 className="font-bold text-slate-800 mb-3 text-sm">Questions?</h4>
                    <div className="space-y-1 text-slate-500">
                        <div className="flex gap-2">
                            <span className="font-bold text-slate-700 min-w-[60px]">Email us</span>
                            <span>: info@mugathmanmotors.com</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="font-bold text-slate-700 min-w-[60px]">Call us</span>
                            <span>: +628 123 456 789</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-slate-800 mb-3 text-sm">Payment Info :</h4>
                    <div className="space-y-1 text-slate-500">
                        <div className="flex gap-2">
                            <span className="font-bold text-slate-700 min-w-[70px]">Account</span>
                            <span>: 1234 567 890</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="font-bold text-slate-700 min-w-[70px]">A/C Name</span>
                            <span>: Mugathman Motors</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="font-bold text-slate-700 min-w-[70px]">Bank Detail</span>
                            <span>: GT Bank</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}