'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center text-xs font-bold text-zinc-950 shadow-lg shadow-orange-500/20 group-hover:shadow-orange-500/40 transition-shadow">
            S
          </div>
          <span className="font-heading font-semibold text-zinc-100 text-[15px] tracking-tight">
            Slide Generator
          </span>
        </Link>
        <nav className="flex gap-1">
          {[
            { href: '/', label: 'Home' },
            { href: '/generate', label: 'Generate' },
            { href: '/gallery', label: 'Gallery' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`relative px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive(href)
                  ? 'text-orange-400 bg-orange-500/10'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              {label}
              {isActive(href) && (
                <span className="absolute -bottom-[9px] left-3.5 right-3.5 h-[2px] bg-gradient-to-r from-orange-500 to-amber-400 rounded-full" />
              )}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
