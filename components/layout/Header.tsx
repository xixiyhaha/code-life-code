"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navConfigs } from "../../config/nav";
import { ThemeToggle } from "../ui/ThemeToggle";
import { SearchBar } from "./SearchBar";
import clsx from "clsx";

export function Header() {
  const pathname = usePathname();

  // On the splash page, we might want to hide the header. 
  // The PRD says "娆㈣繋椤? -> "杩囨浮鍒伴椤?. Usually splash page has no header.
  if (pathname === "/") return null;

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-16 border-b border-blue-800/50 dark:border-slate-800/50 bg-[#1e40af]/95 dark:bg-slate-900/95 backdrop-blur-md">
      <div className="max-w-[1400px] mx-auto h-full px-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-white dark:text-white"
        >
          Code & Life
        </Link>

        <nav className="flex items-center gap-4 lg:gap-6">
          <SearchBar />
          <ul className="flex items-center gap-4">
            {navConfigs.map((item) => {
              const isAdminRoute = pathname?.startsWith("/admin"); const targetHref = isAdminRoute ? (item.href === "/home" ? "/admin" : `/admin${item.href}`) : item.href; const isActive = pathname === targetHref || (item.href === "/home" && pathname === "/" && !isAdminRoute);
              return (
                <li key={item.href}>
                  <Link
                    href={targetHref}
                    className={clsx(
                      "text-sm transition-colors hover:text-white dark:hover:text-white",
                      isActive
                        ? "text-white font-bold"
                        : "text-blue-200 dark:text-slate-300 font-medium"
                    )}
                  >
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="h-4 w-px bg-blue-700 dark:bg-slate-700" />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}


