import { Card, CardContent } from "./ui/card";

export default function StatCard(
    {title, stat, icon, iconBg}: 
    {title: string, stat: number | string, icon: React.ReactNode, iconBg: string}
) {
    
    return (
        <Card className="border-none shadow-[0_2px_8px_rgba(0,0,0,0.02)] rounded-2xl overflow-hidden">
            <CardContent className="p-7 flex justify-between items-center bg-white">
                <div className="space-y-2">
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">
                    {title}
                </p>
                <h3 className="text-[44px] font-black text-[#1A1C1E] leading-none tracking-tighter">
                    {stat}
                </h3>
                </div>
                <div className={`w-[60px] h-[60px] rounded-2xl flex items-center justify-center text-[#5C6170] ${iconBg}`}>
                    {icon}
                </div>
            </CardContent>
        </Card>
    )
}