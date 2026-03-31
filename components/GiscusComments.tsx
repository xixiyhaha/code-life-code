"use client";

import Giscus from "@giscus/react";
import { useEffect, useState } from "react";

interface Props {
  term?: string;
}

export default function GiscusComments({ term }: Props) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      // 匹配无边框的轻量级主题，和整体博客更搭
      setTheme(isDark ? "transparent_dark" : "light");
    };
    
    updateTheme();
    
    // 监听暗黑模式切换
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className="mt-6 w-full pt-4 border-t border-gray-100 dark:border-gray-800/60 transition-all duration-500 ease-in-out">
      <Giscus
        id="comments"
        repo="xixiyhaha/code-life-blog"
        repoId="R_kgDORzI6uw"
        category="General" 
        categoryId="DIC_kwDORzI6u84C5iYC"
        mapping={term ? "specific" : "pathname"}
        term={term}
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={theme}
        lang="zh-CN"
        loading="lazy"
      />
    </div>
  );
}