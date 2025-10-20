import { signOut } from "next-auth/react"

export default function Footer() {
    
    return (
        <footer>
          <div className="text-center p-4 text-sm text-gray-500">
           <p>&copy; {new Date().getFullYear()} Mugathman Motors. All rights reserved.</p> 
           <p><a href="mailto:info@mugathmanmotors.com">info@mugathmanmotors.com</a></p>
           <a href="#" className="text-red-700" onClick={() => signOut()}>signOut</a>
          </div>
        </footer>
    )
}