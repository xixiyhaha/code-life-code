"use client";

import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside); 
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);  
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchResults();
    }, 300);

    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <div className={"relative"} ref={containerRef}>
      <div className={"relative group"}>
        <div className={"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"}>
          <Search className={"w-4 h-4 text-blue-200 dark:text-slate-400 group-focus-within:text-white transition-colors"} />
        </div>
        <input
          type={"text"}
          placeholder={"搜索..."}
          className={"w-48 lg:w-64 pl-10 pr-4 py-1.5 bg-blue-800/50 dark:bg-slate-800/50 border border-blue-700/50 dark:border-slate-700/50 rounded-full text-sm text-white placeholder-blue-200/70 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-blue-700/50 dark:focus:bg-slate-700/50 transition-all font-medium"}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {isOpen && query.trim().length > 0 && (
        <div className={"absolute top-full mt-2 w-full min-w-[300px] left-0 md:-left-10 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden z-[100] max-h-[70vh] overflow-y-auto"}>      
          {loading ? (
            <div className={"p-4 text-sm text-center text-gray-500 dark:text-slate-400"}>🔍 搜索中...</div>
          ) : results.length > 0 ? (
            <ul className={"flex flex-col"}>
              {results.map((item) => (
                <li key={item.slug} className={"border-b border-gray-100 dark:border-slate-700/50 last:border-none"}>
                  <Link
                    href={item.type === "post" ? "/post/" + item.slug : "/plog#" + item.slug}
                    onClick={() => setIsOpen(false)}
                    className={"block p-3 hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-colors"}
                  >
                    {item.type === 'post' ? (
                      <>
                        <div className={"text-sm font-bold text-gray-900 dark:text-white mb-1"}>
                          {item.title || "无标题长文"}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={"text-sm text-gray-700 dark:text-gray-300 line-clamp-2"}>
                           {item.snippet}
                        </div>
                      </>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className={"p-4 text-sm text-center text-gray-500 dark:text-slate-400"}>没有找到相关内容</div>
          )}
        </div>
      )}
    </div>
  );
}


