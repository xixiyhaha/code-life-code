"use client";

import { useEffect, useState } from "react";

export function StatsPanel() {
  const [stats, setStats] = useState({ views: "--", visitors: "--" });

  useEffect(() => {
    // 增加访问次数并获取最新统计
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats", {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        });
        const data = await res.json();
        setStats({
          views: data.views.toString(),
          visitors: data.visitors.toString()
        });
      } catch (error) {
        console.error("Failed to fetch stats", error);
      }
    };
    
    // 只在正常环境中调用，防止重渲染频繁
    fetchStats();
  }, []);

  return (
    <>
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">总访客量</span>
        <span className="font-medium text-gray-900 dark:text-white">{stats.visitors} 人</span>
      </div>
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">总阅读量</span>
        <span className="font-medium text-gray-900 dark:text-white">{stats.views} 次</span>
      </div>
    </>
  );
}
