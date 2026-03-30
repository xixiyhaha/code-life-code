const fs = require('fs');
let file = fs.readFileSync('D:/Desktop/博客/code-life-blog/components/ui/FriendsMap.tsx', 'utf8');

// 1. Add showManageModal state
file = file.replace(
  'const [showAddModal, setShowAddModal] = useState(false);',
  'const [showAddModal, setShowAddModal] = useState(false);\n  const [showManageModal, setShowManageModal] = useState(false);\n  const [editingIndex, setEditingIndex] = useState<number | null>(null);'
);

// 2. Wrap auth on handles
file = file.replace(
  "headers: { 'Content-Type': 'application/json' },\n          body:",
  "headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('ADMIN_PASSWORD') },\n          body:"
);

// 3. Add handleSaveAll function
const saveAllCode = \
  const handleSaveAllFields = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/friends', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('ADMIN_PASSWORD') },
        body: JSON.stringify({ friends })
      });
      if (res.ok) {
        setShowManageModal(false);
        const friendsRes = await fetch('/api/friends');
        const newData = await friendsRes.json();
        setFriends(newData.friends || []);
      } else {
        const error = await res.json();
        if(error.error === 'Unauthorized') {
          let adminPassword = prompt("请输入管理密码：");
          if (!adminPassword) return;
          localStorage.setItem("ADMIN_PASSWORD", adminPassword);
        } else {
          alert('保存失败: ' + error.error);
        }
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

  const [manageDesc, setManageDesc] = useState('');
  const [manageName, setManageName] = useState('');
  const [manageUrl, setManageUrl] = useState('');
  const [manageAvatar, setManageAvatar] = useState('');

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
\;
file = file.replace('const handleAddFriend', saveAllCode + '\n  const handleAddFriend');

// 4. Update the "Add Friend" click to verify password if none
file = file.replace(
  'onClick={() => setShowAddModal(true)}',
  'onClick={() => { if(!localStorage.getItem("ADMIN_PASSWORD")){ const pwd = prompt("请输入管理密码："); if(!pwd)return; localStorage.setItem("ADMIN_PASSWORD", pwd); } setShowAddModal(true); }}'
);

// 5. Add "Manage modal" render
const manageModalRender = \
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
                           <button onClick={()=>saveManageEdit(i)} className="text-blue-500 text-sm px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded">确认修改</button>
                           <button onClick={()=>setEditingIndex(null)} className="text-gray-500 text-sm px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded">取消</button>
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
                           <button onClick={()=>handleEditClick(i, f)} className="text-blue-500 text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/30 rounded">编辑</button>
                           <button onClick={()=>handleRemoveFriend(i)} className="text-red-500 text-xs px-2 py-1 bg-red-50 dark:bg-red-900/30 rounded">删除</button>
                        </div>
                     </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t dark:border-gray-800">
              <button onClick={() => { setFriends(friends); setShowManageModal(false); }} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                取消
              </button>
              <button onClick={handleSaveAllFields} disabled={isSubmitting} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                {isSubmitting ? "正在保存..." : "保存所有更改"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
\;
// 6. insert manage button
file = file.replace(
  '{isAdminRoute && <button',
  '{isAdminRoute && <div className="absolute bottom-4 right-4 flex gap-3 z-30"><button onClick={() => { if(!localStorage.getItem("ADMIN_PASSWORD")){ const pwd = prompt("请输入管理密码："); if(!pwd)return; localStorage.setItem("ADMIN_PASSWORD", pwd); } setShowManageModal(true); }} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:scale-105 transition-transform border border-gray-200 dark:border-gray-700">管理友链</button><button'
);

file = file.replace(
  'z-30"\n        >',
  '\"\n        >'
);

file = file.replace('</button>}', '</button></div>}');

file = file.replace('{showAddModal && (', manageModalRender + '\n      {showAddModal && (');

fs.writeFileSync('D:/Desktop/博客/code-life-blog/components/ui/FriendsMap.tsx', file, 'utf8');
console.log('Done!');
