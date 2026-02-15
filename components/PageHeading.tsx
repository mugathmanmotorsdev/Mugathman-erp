export default function PageHeading({title, description}: {title: string, description?: string}) {
    
    return (
         <div className="space-y-1">
            <h1 className="text-[32px] font-bold text-slate-900 tracking-tight">
            {title}
            </h1>
            {description && (
                <p className="text-slate-500 text-[15px] max-w-lg">
                    {description}
                </p>
            )}
        </div>
    )
}