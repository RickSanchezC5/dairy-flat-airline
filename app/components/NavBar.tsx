"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/my-bookings", label: "My Bookings" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="bg-slate-900 text-white">
      <nav className="px-8 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          ✈ Dairy Flat Air
        </Link>
        <div className="flex gap-6 text-sm">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  isActive
                    ? "text-sky-400 font-semibold"
                    : "text-slate-300 hover:text-sky-300"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
} 