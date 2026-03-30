"use client";

import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthed, setIsAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const pwd = localStorage.getItem("ADMIN_PASSWORD");
    if (pwd) {
      verify(pwd);
    } else {
      setLoading(false);
    }
  }, []);

  const verify = async (pwd: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd })
      });
      if (res.ok) {
        setIsAuthed(true);
        localStorage.setItem("ADMIN_PASSWORD", pwd);
      } else {
        localStorage.removeItem("ADMIN_PASSWORD");
        setError("密码错误，请重新输入");
      }
    } catch (err) {
      setError("验证请求失败，请检查网络");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verify(password);
  };

  // 在加载状态下显示一个加载指示器，防止页面闪烁
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 渲染登录表单
  if (!isAuthed) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center -mt-10">
        <form 
          onSubmit={handleSubmit} 
          className="bg-white dark:bg-[#111] p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 w-full max-w-sm"
        >
          <h2 className="text-2xl font-bold mb-8 text-center text-gray-800 dark:text-gray-100">管理员登录</h2>
          
          <div className="mb-6">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              placeholder="请输入管理密码"
              required
              autoFocus
            />
          </div>
          
          {error && <p className="text-red-500 text-sm mb-6 text-center">{error}</p>}
          
          <button 
            type="submit" 
            className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition-colors"
          >
            进入编辑模式
          </button>
        </form>
      </div>
    );
  }

  // 验证通过，渲染原本的后台页面
  return <>{children}</>;
}
