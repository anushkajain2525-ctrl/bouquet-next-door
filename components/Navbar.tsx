"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePhone } from "@/lib/phone";

const links = [
  { href: "/build", label: "Build" },
  { href: "/suggestions", label: "For her, now" },
  { href: "/orders", label: "My bouquets" },
];

export default function Navbar() {
  const path = usePathname();
  const { phone, setPhone } = usePhone();
  return (
    <header className="sticky top-3 z-40 px-3 sm:px-6">
      <nav className="mx-auto flex max-w-5xl items-center justify-between rounded-full border border-line bg-card/80 py-2 pl-5 pr-2 shadow-[0_8px_30px_-16px_rgba(74,15,36,.35)] backdrop-blur-xl">
        <Link href="/" aria-label="Bouquet Next Door home" id="bnd-logo" className="bnd-logo font-display text-2xl font-semibold tracking-tight text-wine">
          BND<span className="text-gold">.</span>
        </Link>
        <ul className="flex items-center gap-1 text-sm">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className={`rounded-full px-3 py-2 transition ${path.startsWith(l.href) ? "bg-paper2 text-wine font-semibold" : "text-soft hover:text-ink"} ${l.href === "/suggestions" ? "hidden sm:block" : ""}`}>
                {l.label}
              </Link>
            </li>
          ))}
          {phone && (
            <li>
              <button onClick={() => setPhone(null)} className="ml-1 rounded-full bg-wine px-3 py-2 text-xs text-white" title="Switch number">
                ••{phone.slice(-4)} · switch
              </button>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}
