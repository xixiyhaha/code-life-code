"use client";

import { useTheme } from "next-themes";
import { GitHubCalendar } from "react-github-calendar";
import { useEffect, useState } from "react";

export function GithubHeatmap({ username = "xixiyhaha" }: { username?: string }) {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[120px] flex items-center justify-center text-xs text-gray-400">
        加载中...
      </div>
    );
  }

  const isDark = theme === "dark" || resolvedTheme === "dark";

  return (
    <div className="w-full mt-2 flex flex-col gap-5 overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: ".github-heatmap-container *::-webkit-scrollbar { display: none !important; } .github-heatmap-container * { -ms-overflow-style: none !important; scrollbar-width: none !important; }" }} />
      
      {/* 行1：前半年的数据 */}
      <div className="w-full overflow-x-auto github-heatmap-container">
        <div className="w-max mx-auto px-2">
          <GitHubCalendar
            username={username}
            colorScheme={isDark ? "dark" : "light"}
            blockSize={8}
            blockMargin={3}
            fontSize={10}
            transformData={(data) => {
              const midpoint = Math.ceil(data.length / 2);
              return data.slice(0, midpoint);
            }}
          />
        </div>
      </div>

      {/* 行2：后半年的数据 */}
      <div className="w-full overflow-x-auto github-heatmap-container mt-[-5px]">
        <div className="w-max mx-auto px-2">
          <GitHubCalendar
            username={username}
            colorScheme={isDark ? "dark" : "light"}
            blockSize={8}
            blockMargin={3}
            fontSize={10}
            transformData={(data) => {
              const midpoint = Math.ceil(data.length / 2);
              return data.slice(midpoint);
            }}
          />
        </div>
      </div>
    </div>
  );
}
