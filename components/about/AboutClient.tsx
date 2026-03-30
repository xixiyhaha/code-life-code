"use client";

import React, { useState, useCallback } from 'react';
import { Mail, MapPin, Link as LinkIcon, Edit2, Save, X, Loader2, UploadCloud } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import type { AboutData } from '@/lib/posts';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/utils/cropImage';
import { usePathname } from 'next/navigation';

export default function AboutClient({ initialData }: { initialData: AboutData }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin') || false;

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [formData, setFormData] = useState<AboutData>(initialData);
  const [data, setData] = useState<AboutData>(initialData);

  const handleSave = async () => {
    let adminPassword = localStorage.getItem("ADMIN_PASSWORD");
    if (!adminPassword) {
      adminPassword = prompt("请输入管理密码：");
      if (!adminPassword) return;
      localStorage.setItem("ADMIN_PASSWORD", adminPassword);
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/about", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminPassword}`
        },
        body: JSON.stringify(formData),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error);

      setData(formData);
      setIsEditing(false);
    } catch (err: any) {
      alert("保存失败: " + err.message);
      if (err.message === "Unauthorized") {
        localStorage.removeItem("ADMIN_PASSWORD"); // 密码错误重新输入
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(data);
    setIsEditing(false);
  };

  const uploadAvatar = async (file: File) => {
    let adminPassword = localStorage.getItem("ADMIN_PASSWORD");
    if (!adminPassword) {
      adminPassword = prompt("请输入管理密码：");
      if (!adminPassword) return;
      localStorage.setItem("ADMIN_PASSWORD", adminPassword);
    }

    setIsUploading(true);
    try {
      const uploadForm = new FormData();
      uploadForm.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${adminPassword}`
        },
        body: uploadForm,
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Upload failed");

      setFormData(prev => ({ ...prev, avatar: resData.url }));
    } catch (err: any) {
      alert("上传头像失败: " + err.message);
      if (err.message === "Unauthorized") {
        localStorage.removeItem("ADMIN_PASSWORD");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const readFile = (file: File) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result));
      reader.readAsDataURL(file);
    });
  };

  const onFileChange = async (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl as string);
      setCropModalOpen(true);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) await onFileChange(file);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {        
    const file = e.target.files?.[0];
    if (file) await onFileChange(file);
    e.target.value = '';
  };

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = async () => {
    try {
      if (!imageSrc || !croppedAreaPixels) return;
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (croppedImageBlob) {
        setCropModalOpen(false);
        const file = new File([croppedImageBlob], "avatar.jpg", { type: "image/jpeg" });
        await uploadAvatar(file);
      }
    } catch (e) {
      console.error(e);
      alert("裁剪失败");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 dark:border-gray-800 relative">
      {/* Edit Button */}
      {isAdminRoute && !isEditing && (
        <button 
          onClick={() => setIsEditing(true)}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition-colors"
          title="编辑主页"
        >
          <Edit2 className="w-5 h-5" />
        </button>
      )}

      {isEditing ? (
        // EDIT MODE
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center border-b pb-4 dark:border-gray-800">
            <h2 className="text-xl font-bold">编辑个人主页</h2>
            <div className="flex gap-2">
              <button 
                onClick={handleCancel} 
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-4 h-4" /> 取消
              </button>
              <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 保存
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 flex items-center gap-6">
              <div className="flex flex-col items-start gap-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">更换头像 (点击或拖拽)</label>
                <label 
                  className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer group bg-gray-50 dark:bg-gray-800 transition-all hover:border-blue-500 shrink-0"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={formData.avatar || "https://avatars.githubusercontent.com/xixiyhaha"} alt="avatar" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileSelect} disabled={isUploading} />
                </label>
              </div>
              <div className="flex-1 w-full">
                <label className="block text-xs font-medium text-gray-500 mb-1">名字</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">简要介绍</label>
              <input 
                type="text" 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">GitHub 链接</label>
              <input 
                type="text" 
                value={formData.github} 
                onChange={e => setFormData({...formData, github: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">邮箱</label>
              <input 
                type="text" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">所在地</label>
              <input 
                type="text" 
                value={formData.location} 
                onChange={e => setFormData({...formData, location: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">个人网站</label>
              <input 
                type="text" 
                value={formData.website} 
                onChange={e => setFormData({...formData, website: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="md:col-span-2 mt-4">
              <label className="block text-xs font-medium text-gray-500 mb-1">长文本详细介绍 (Markdown)</label>
              <textarea 
                rows={12}
                value={formData.content} 
                onChange={e => setFormData({...formData, content: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-h-[200px]"
              />
            </div>
          </div>
        </div>
      ) : (
        // VIEW MODE
        <>
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start group">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden shrink-0 ring-4 ring-gray-50 dark:ring-gray-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={data.avatar || "https://avatars.githubusercontent.com/xixiyhaha"} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {data.name || "Your Name"}
              </h1>
              <p className="text-lg text-gray-500 dark:text-gray-400 mb-6 font-medium">
                {data.description || "A brief introduction about who you are and what you do."}
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-8">
                {data.github && (
                  <a 
                    href={data.github} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium transition-colors"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/></svg>
                    GitHub
                  </a>
                )}
                {data.email && (
                  <a 
                    href={`mailto:${data.email}`}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    发邮件
                  </a>
                )}
              </div>
              
              <div className="flex flex-col gap-3 text-gray-600 dark:text-gray-400">
                {data.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{data.location}</span>
                  </div>
                )}
                {data.website && (
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-gray-400" />
                    <a href={data.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-500 transition-colors">
                      {data.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <hr className="my-10 border-gray-100 dark:border-gray-800" />
          
          <div className="prose dark:prose-invert max-w-none prose-img:rounded-xl">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {data.content || "在这里写下更多关于你的详细介绍..."}
            </ReactMarkdown>
          </div>
        </>
      )}
      {/* Image Cropper Modal */}
      {cropModalOpen && imageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 dark:text-white">调整头像</h3>
            <div className="relative w-full h-64 sm:h-80 bg-gray-100 dark:bg-black rounded-2xl overflow-hidden mb-6">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setCropModalOpen(false)}
                className="px-5 py-2 rounded-full font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition"
              >
                取消
              </button>
              <button 
                onClick={showCroppedImage}
                className="px-5 py-2 rounded-full font-medium text-white bg-blue-600 hover:bg-blue-700 transition"
              >
                确认使用
              </button>
            </div>
          </div>
        </div>
      )}    </div>
  );
}




