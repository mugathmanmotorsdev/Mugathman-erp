import { Card, CardContent, CardHeader } from "./ui/card";

export default function StatCard(
    {title, stat, icon, iconBg}: 
    {title: string, stat: number | string, icon: React.ReactNode, iconBg: string}
) {
    
    return (
        <Card className="flex flex-col gap-2 flex-1 rounded-lg px-5 shadow-xl shadow-slate-200/50 bg-white overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            <CardHeader className="p-0">
                <div className={`w-[60px] h-[60px] rounded-2xl flex items-center justify-center text-[#5C6170] ${iconBg}`}>
                    {icon}
                </div>
            </CardHeader>
            <CardContent className="flex flex-col justify-center space-y-3 m-0 px-0">
                <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">
                    {title}
                </p>
                <div className="space-y-2">
                    <h3 className="text-3xl font-black text-[#1A1C1E] leading-none tracking-tighter">
                        {stat}
                    </h3>
                </div>
                
            </CardContent>
        </Card>
    )
}