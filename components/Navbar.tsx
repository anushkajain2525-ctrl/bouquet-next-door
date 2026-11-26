"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePhone } from "@/lib/phone";

const links = [
  { href: "/gallery", label: "Gallery" },
  { href: "/build", label: "Build" },
  { href: "/suggestions", label: "For her, now" },
  { href: "/orders", label: "My bouquets" },
];

export default function Navbar() {
  const path = usePathname();
  const { phone, setPhone } = usePhone();
  return (
    <header className="sticky top-3 z-40 px-3 sm:px-6">
      <nav className="mx-auto flex max-w-5xl items-center justify-between gap-2 rounded-full border border-line bg-card/80 py-2 pl-4 pr-2 sm:pl-5 shadow-[0_8px_30px_-16px_rgba(74,15,36,.35)] backdrop-blur-xl">
        <Link href="/" aria-label="Bouquet Next Door home" id="bnd-logo" className="bnd-logo font-display text-2xl font-semibold tracking-tight text-wine">
          BND<span className="text-gold">.</span>
        </Link>
        <ul className="flex min-w-0 items-center gap-0.5 text-[13px] sm:gap-1 sm:text-sm">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className={`whitespace-nowrap rounded-full px-2 py-2 transition sm:px-3 ${path.startsWith(l.href) ? "bg-paper2 text-wine font-semibold" : "text-soft hover:text-ink"} ${l.href === "/suggestions" ? "hidden sm:block" : ""}`}>
                {l.label}
              </Link>
            </li>
          ))}
          {phone && (
            <li>
              <button onClick={() => setPhone(null)} className="ml-1 whitespace-nowrap rounded-full bg-wine px-2.5 py-2 text-xs text-white sm:px-3" title="Switch number" aria-label={`Signed in as number ending ${phone.slice(-4)}. Switch number`}>
                ••{phone.slice(-4)}<span className="hidden sm:inline"> · switch</span>
              </button>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}
