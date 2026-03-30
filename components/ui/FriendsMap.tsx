"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Friend {
  name: string;
  url: string;
  avatar: string;
  desc: string;
}

interface NodeData extends Friend {
  x: number;
  y: number;
  delay: number;
}

export function FriendsMap() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin') || false;
  const [friends, setFriends] = useState<Friend[]>([]);
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [manageDesc, setManageDesc] = useState('');
  const [manageName, setManageName] = useState('');
  const [manageUrl, setManageUrl] = useState('');
  const [manageAvatar, setManageAvatar] = useState('');
  const [aboutData, setAboutData] = useState<any>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newAvatar, setNewAvatar] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [friendsRes, aboutRes] = await Promise.all([
          fetch('/api/friends'),
          fetch('/api/about')
        ]);
        const friendsData = await friendsRes.json();
        const aboutInfo = await aboutRes.json();

        setFriends(friendsData.friends || []);
        setAboutData(aboutInfo);
      } catch (e) {
        console.error(e);
      } finally {
        setMounted(true);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current || friends.length === 0) return;
    
    const computedNodes = friends.map((friend, i) => {
      const angle = (i / friends.length) * 2 * Math.PI + (Math.random() - 0.5) * 0.5;
      const radius = 100 + Math.random() * 140; 
      
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      return {
        ...friend,
        x,
        y,
        delay: Math.random() * 0.5
      };
    });
    
    setNodes(computedNodes);
  }, [friends, mounted]);

  const handleSaveAllFields = async () => {
    setIsSubmitting(true);
    try {
      let pwd = localStorage.getItem("ADMIN_PASSWORD");
      if (!pwd) pwd = prompt("请输入管理密码：");
      if (!pwd) return;
      localStorage.setItem("ADMIN_PASSWORD", pwd);

      const res = await fetch('/api/friends', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${pwd}` },
        body: JSON.stringify({ friends })
      });
      if (res.ok) {
        setShowManageModal(false);
        const friendsRes = await fetch('/api/friends');
        const newData = await friendsRes.json();
        setFriends(newData.friends || []);
      } else {
        const err = await res.json();
        if (err.error === 'Unauthorized') localStorage.removeItem("ADMIN_PASSWORD");
        alert(err.error || "保存失败");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveFriend = (index: number) => {
    if(confirm('确定要删除这个友链吗？')) {
      const newFriends = [...friends];
      newFriends.splice(index, 1);
      setFriends(newFriends);
    }
  };

  const handleEditClick = (idx: number, friend: Friend) => {
    setEditingIndex(idx);
    setManageName(friend.name);
    setManageUrl(friend.url);
    setManageAvatar(friend.avatar);
    setManageDesc(friend.desc);
  };
  
  const saveManageEdit = (idx: number) => {
      const newFriends = [...friends];
      newFriends[idx] = { ...newFriends[idx], name: manageName, url: manageUrl, avatar: manageAvatar, desc: manageDesc };
      setFriends(newFriends);
      setEditingIndex(null);
  };

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('ADMIN_PASSWORD') },
        body: JSON.stringify({ name: newName, url: newUrl, avatar: newAvatar, desc: newDesc })
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewName(""); setNewUrl(""); setNewAvatar(""); setNewDesc("");
        // Reload friends list
        const friendsRes = await fetch('/api/friends');
        const newData = await friendsRes.json();
        setFriends(newData.friends || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="w-full h-full relative flex items-center justify-center min-h-[500px]" ref={containerRef}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
        <g style={{ transform: 'translate(50%, 50%)' }}>
          {nodes.map((node, i) => (
            <motion.line
              key={i}
              x1={0}
              y1={0}
              x2={node.x}
              y2={node.y}
              stroke="gray"
              strokeOpacity={0.3}
              strokeWidth={1.5}
              strokeDasharray="4 2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: node.delay }}
            />
          ))}
        </g>
      </svg>

      <Link href="/" className="relative z-10 hover:scale-110 transition-transform cursor-pointer">
        <div className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 shadow-xl overflow-hidden bg-gray-200 flex items-center justify-center">
          <img src={aboutData.avatar || "https://avatars.githubusercontent.com/xixiyhaha"} alt="center" className="w-full h-full object-cover" />
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-black/70 text-white text-[10px] rounded-md whitespace-nowrap backdrop-blur-md">
          {aboutData.name || "Code & Life"}
        </div>
      </Link>

      {nodes.map((node, i) => (
        <motion.a
          key={i}
          href={node.url}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute z-20 group flex flex-col items-center justify-center transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
          style={{ 
            left: 'calc(50% + ' + node.x + 'px)', 
            top: 'calc(50% + ' + node.y + 'px)' 
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 12, delay: node.delay }}
        >
          <div className="w-12 h-12 rounded-full border-2 border-primary/50 overflow-hidden shadow-md group-hover:border-blue-500 group-hover:shadow-blue-500/50 bg-gray-100 relative">
            <img src={node.avatar} alt={node.name} className="w-full h-full object-cover" onError={(e) => { (e.target as any).src = 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'; }} />
            
            {/* Tooltip trigger space matching group bounds */}
          </div>
          <div className="absolute top-full mt-2 px-3 py-1.5 bg-white/90 dark:bg-black/90 text-gray-800 dark:text-gray-200 rounded text-xs font-medium shadow-xl backdrop-blur transform -translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all pointer-events-none whitespace-nowrap z-50 flex flex-col items-center">
            <span className="font-bold">{node.name}</span>
            {node.desc && <span className="text-[10px] text-gray-500 font-normal mt-0.5 max-w-[120px] truncate">{node.desc}</span>}
          </div>
        </motion.a>
      ))}

{isAdminRoute && <div className="absolute bottom-4 right-4 flex gap-3 z-30">
          <button 
            onClick={() => {
              if(!localStorage.getItem("ADMIN_PASSWORD")) {
                const pwd = prompt("请输入管理密码：");
                if(!pwd) return;
                localStorage.setItem("ADMIN_PASSWORD", pwd);
              }
              setShowManageModal(true);
            }}
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:scale-105 transition-transform border border-gray-200 dark:border-gray-700"
          >
            管理友链
          </button>
          <button 
            onClick={() => {
              if(!localStorage.getItem("ADMIN_PASSWORD")) {
                const pwd = prompt("请输入管理密码：");
                if(!pwd) return;
                localStorage.setItem("ADMIN_PASSWORD", pwd);
              }
              setShowAddModal(true);
            }}
            className="bg-gray-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:scale-105 transition-transform"
          >
            + 添加友链
          </button>
        </div>}

      {showManageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-[#1a1a1a] rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col p-6 shadow-2xl relative">
            <h3 className="text-xl font-bold mb-4">管理友链</h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {friends.map((f, i) => (
                <div key={i} className="border dark:border-gray-800 p-4 rounded-xl">
                  {editingIndex === i ? (
                     <div className="space-y-2">
                        <input value={manageName} onChange={e=>setManageName(e.target.value)} className="w-full px-2 py-1 mb-1 border rounded dark:bg-[#111] dark:border-gray-700" placeholder="名称"/>
                        <input value={manageUrl} onChange={e=>setManageUrl(e.target.value)} className="w-full px-2 py-1 mb-1 border rounded dark:bg-[#111] dark:border-gray-700" placeholder="链接"/>
                        <input value={manageAvatar} onChange={e=>setManageAvatar(e.target.value)} className="w-full px-2 py-1 mb-1 border rounded dark:bg-[#111] dark:border-gray-700" placeholder="头像"/>
                        <input value={manageDesc} onChange={e=>setManageDesc(e.target.value)} className="w-full px-2 py-1 mb-1 border rounded dark:bg-[#111] dark:border-gray-700" placeholder="描述"/>
                        <div className="flex gap-2 justify-end">
                           <button onClick={()=>saveManageEdit(i)} className="text-blue-500 text-sm px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded focus:outline-none">确认修改</button>
                           <button onClick={()=>setEditingIndex(null)} className="text-gray-500 text-sm px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded focus:outline-none">取消</button>
                        </div>
                     </div>
                  ) : (
                     <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                           <img src={f.avatar} className="w-10 h-10 rounded-full" alt="" />
                           <div>
                             <div className="font-bold text-sm">{f.name}</div>
                             <div className="text-xs text-gray-500">{f.url}</div>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={()=>handleEditClick(i, f)} className="text-blue-500 text-xs px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded focus:outline-none">编辑</button>
                           <button onClick={()=>handleRemoveFriend(i)} className="text-red-500 text-xs px-3 py-1 bg-red-50 dark:bg-red-900/30 rounded focus:outline-none">删除</button>
                        </div>
                     </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t dark:border-gray-800">
              <button 
                onClick={() => { 
                  // 重新获取一下打断未保存的修改
                  fetch('/api/friends').then(res=>res.json()).then(newData=>setFriends(newData.friends || []));
                  setShowManageModal(false); 
                }} 
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none"
              >
                取消
              </button>
              <button onClick={handleSaveAllFields} disabled={isSubmitting} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none">
                {isSubmitting ? "正在保存..." : "保存所有更改"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#1a1a1a] rounded-2xl w-full max-w-md p-6 shadow-2xl relative"
          >
            <h3 className="text-xl font-bold mb-4">添加新的友链</h3>
            <form onSubmit={handleAddFriend} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">站点名称 / 昵称</label>
                <input required value={newName} onChange={e => setNewName(e.target.value)} type="text" className="w-full px-3 py-2 border dark:border-gray-700 rounded-lg dark:bg-[#111] focus:ring-2 outline-none" placeholder="e.g. Next.js" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">站点链接</label>
                <input required value={newUrl} onChange={e => setNewUrl(e.target.value)} type="url" className="w-full px-3 py-2 border dark:border-gray-700 rounded-lg dark:bg-[#111] focus:ring-2 outline-none" placeholder="https://" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">头像链接 URL</label>
                <input required value={newAvatar} onChange={e => setNewAvatar(e.target.value)} type="url" className="w-full px-3 py-2 border dark:border-gray-700 rounded-lg dark:bg-[#111] focus:ring-2 outline-none" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">站点描述</label>
                <input required value={newDesc} onChange={e => setNewDesc(e.target.value)} type="text" className="w-full px-3 py-2 border dark:border-gray-700 rounded-lg dark:bg-[#111] focus:ring-2 outline-none" placeholder="分享好玩的东西..." />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                  取消
                </button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                  {isSubmitting ? "正在保存..." : "确认添加"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}


// END_OF_FILE
