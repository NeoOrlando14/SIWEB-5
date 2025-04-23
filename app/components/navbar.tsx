// components/Navbar.js
import Link from 'next/link'

const Navbar = () => {
  return (
    <nav className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white text-xl font-semibold">
          Logo
        </Link>
        <ul className="flex space-x-6">
          <li><Link href="/" className="text-white">Home</Link></li>
          <li><Link href="/about" className="text-white">About</Link></li>
          <li><Link href="/services" className="text-white">Services</Link></li>
          <li><Link href="/contact" className="text-white">Contact</Link></li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
