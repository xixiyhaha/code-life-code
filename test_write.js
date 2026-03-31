
const fs = require("fs");
const content = `"use client";

import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface Props {
  text?: string;
}

export function AdminAwareBackLink({ text = "·µ»ØÖ÷Ò³" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <button 
      onClick={() => {
        if (window.history.length > 2) {
          router.back();
        } else {
          router.push(isAdmin ? "/admin" : "/home");
        }
      }} 
      className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors bg-transparent border-none p-0 cursor-pointer"
    >
      <ArrowLeft className="w-4 h-4" /> {text}
    </button>
  );
}
`;
fs.writeFileSync("d:/Desktop/²©¿Í/code-life-blog/components/ui/AdminAwareBackLink.tsx", content, "utf8");

