import Image from "next/image";
import Link from "next/link";

export default function Navs() {
    
    return (
        <nav className="px-4 flex justify-center items-center gap-10">
            <Image src="/logo.png" alt="Logo" width={50} height={50} />
            <ul className="list-none">
                <li className="inline-block mx-2"><Link href="/">Sales</Link></li>
                <li className="inline-block mx-2"><Link href="/inventory">Inventory</Link></li>
                <li className="inline-block mx-2"><a href="https://lookerstudio.google.com/reporting/bd63e4d0-f4e1-4281-b2cf-217a05bd95bb" >Report</a></li>  
            </ul>
        </nav>
    )
}