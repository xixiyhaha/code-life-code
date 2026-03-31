"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Send, Image as ImageIcon, FileText, Type, X, FileUp, Tag, AlertCircle, File as FileIcon } from "lucide-react";
import clsx from "clsx";

type PostType = "note" | "post" | "announcement";

const AVAILABLE_TAGS = ["C++", "Python", "深度学习", "前端", "后端", "算法", "生活"];

export function PostComposer({ onSuccess }: { onSuccess?: () => void }) {
  const [activeTab, setActiveTab] = useState<PostType>("note");
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  const [localImageFiles, setLocalImageFiles] = useState<Record<string, File>>({});
  const [missingImages, setMissingImages] = useState<string[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 实时分析当前文本，找出缺失的本地图片或已失效的 Blob 图片
  useEffect(() => {
    const missing = new Set<string>();
    
    // 匹配不是网络链接、dataURI 的本地链接或 blob 链接: ![...](...) 或 [...](...)
    const mdRegex = /(!?\[.*?\])\((?!https?:\/\/|data:)(.*?)\)/g;
    let match;
    while ((match = mdRegex.exec(content)) !== null) {
      if (match[2]) {
        let urlPart = match[2].trim().replace(/^<|>$/g, '').split(/[\s'"]/)[0];
        // 如果是 blob 链接，但是没在当前的上传缓存里，说明是刷新前的残留失效占位
        if (urlPart.startsWith("blob:")) {
            if (!localImageFiles[urlPart]) missing.add("失效草稿图片需要重新上传");
            continue;
        }
        let decoded = urlPart;
        try { decoded = decodeURIComponent(urlPart); } catch(e) {}
        const filename = decoded.split(/[/\\]/).pop();
        if (filename) missing.add(filename);
      }
    }

    // 匹配 HTML 语法
    const htmlRegex = /<(?:img|iframe|embed).*?src=["'](?!https?:\/\/|data:)(.*?)["']/gi;
    while ((match = htmlRegex.exec(content)) !== null) {
      if (match[1]) {
        let urlPart = match[1];
        if (urlPart.startsWith("blob:")) {
            if (!localImageFiles[urlPart]) missing.add("失效草稿图片需要重新上传");
            continue;
        }
        let decoded = urlPart;
        try { decoded = decodeURIComponent(urlPart); } catch(e) {}
        const filename = decoded.split(/[/\\]/).pop();
        if (filename) missing.add(filename);
      }
    }
    
    setMissingImages(Array.from(missing));
  }, [content, localImageFiles]);

  useEffect(() => {
    const draftContent = localStorage.getItem(`draft-${activeTab}-content`);
    const draftTitle = localStorage.getItem(`draft-${activeTab}-title`);
    const draftTags = localStorage.getItem(`draft-${activeTab}-tags`);
    if (draftContent) setContent(draftContent);
    if (draftTitle) setTitle(draftTitle);
    try { if (draftTags) setSelectedTags(JSON.parse(draftTags)); else setSelectedTags([]); } catch(e){}
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem(`draft-${activeTab}-content`, content);
    if (activeTab === "post") {
      localStorage.setItem(`draft-${activeTab}-title`, title);
      localStorage.setItem(`draft-${activeTab}-tags`, JSON.stringify(selectedTags));
    }
  }, [content, title, selectedTags, activeTab]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  useEffect(() => {
    // 自动调整 textarea 高度
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [content]);

  const insertTextAtCursor = (text: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const before = content.substring(0, start);
    const after = content.substring(end);
    setContent(before + text + after);
    setTimeout(() => {
      textareaRef.current!.selectionStart = textareaRef.current!.selectionEnd = start + text.length;
      textareaRef.current!.focus();
    }, 0);
  };

  const handleMdImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const mdFile = files.find(f => f.name.endsWith('.md'));
    const imageFiles = files.filter(f => f.type.startsWith('image/') || f.type === "application/pdf");

    if (mdFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        let text = event.target?.result as string;

        if (imageFiles.length > 0) {
          const newLocalImages: Record<string, File> = {};
          imageFiles.forEach(img => {
            const blobUrl = URL.createObjectURL(img);
            newLocalImages[blobUrl] = img;
            
            // 替换 Markdown 语法中的对应图片
            const mdRegex = /(!?\[.*?\])\((?!https?:\/\/|data:|blob:)(.*?)\)/g;
            text = text.replace(mdRegex, (fullMatch, prefix, rawUrl) => {
               let urlPart = rawUrl.trim().replace(/^<|>$/g, '').split(/[\s'"]/)[0];
               let decoded = urlPart; try { decoded = decodeURIComponent(urlPart); } catch (e) {}
               const filename = decoded.split(/[/\\]/).pop();
               if (filename === img.name) return `${prefix}(${blobUrl})`;
               return fullMatch;
            });

            // 替换 HTML 语法中的对应图片
            const htmlRegex = /(<(?:img|iframe|embed).*?src=["'])(?!https?:\/\/|data:|blob:)(.*?)(["'].*?>)/gi;
            text = text.replace(htmlRegex, (fullMatch, prefix, rawUrl, suffix) => {
               let decoded = rawUrl; try { decoded = decodeURIComponent(rawUrl); } catch (e) {}
               const filename = decoded.split(/[/\\]/).pop();
               if (filename === img.name) return `${prefix}${blobUrl}${suffix}`;
               return fullMatch;
            });
          });
          setLocalImageFiles(prev => ({ ...prev, ...newLocalImages }));
        }

        let extractedTitle = "";
        let newContent = text;

        const fmMatch = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        if (fmMatch) {
          const fm = fmMatch[1];
          const fmTitleMatch = fm.match(/title:\s*["']?(.*?)["']?(\n|$)/);
          if (fmTitleMatch) extractedTitle = fmTitleMatch[1];
          newContent = fmMatch[2].trimStart();
        } 
        
        if (!extractedTitle) {
          // 查找第一个一级标题
          const h1Match = newContent.match(/^\s*#\s+(.*)$/m);
          if (h1Match) {
            extractedTitle = h1Match[1].trim();
            // 连带移除改行与其前后的多余换行
            newContent = newContent.replace(h1Match[0], '').trimStart();
          } else {
            // 如果连 # 都没有，提取第一行有意义的纯文本
            const firstLineMatch = newContent.match(/^(?![ \t]*[!#<>\-*])(.+)$/m);
            if (firstLineMatch) {
              extractedTitle = firstLineMatch[1].trim();
              newContent = newContent.replace(firstLineMatch[0], '').trimStart();
            }
          }
        }

        if (extractedTitle) setTitle(extractedTitle);
        setContent(newContent);
        setActiveTab("post");
      };
      reader.readAsText(mdFile);
    } else if (imageFiles.length > 0) {
      processLocalFiles(imageFiles);
    }

    e.target.value = "";
  };

  const processLocalFiles = (files: File[]) => {
    let newContent = content;
    const newFiles: Record<string, File> = {};
    let insertedAny = false;

    for (const file of files) {
      if (!file.type.startsWith("image/") && file.type !== "application/pdf") continue;
      const blobUrl = URL.createObjectURL(file);
      newFiles[blobUrl] = file;

      let replaced = false;

      // 替换 Markdown 语法中的对应图片
      const mdRegex = /(!?\[.*?\])\((?!https?:\/\/|data:|blob:)(.*?)\)/g;
      newContent = newContent.replace(mdRegex, (fullMatch, prefix, rawUrl) => {
         let urlPart = rawUrl.trim().replace(/^<|>$/g, '').split(/[\s'"]/)[0];
         let decoded = urlPart; try { decoded = decodeURIComponent(urlPart); } catch (e) {}
         const filename = decoded.split(/[/\\]/).pop();
         if (filename === file.name) {
             replaced = true;
             return `${prefix}(${blobUrl})`;
         }
         return fullMatch;
      });

      // 替换 HTML 语法的图片
      const htmlRegex = /(<(?:img|iframe|embed).*?src=["'])(?!https?:\/\/|data:|blob:)(.*?)(["'].*?>)/gi;
      newContent = newContent.replace(htmlRegex, (fullMatch, prefix, rawUrl, suffix) => {
         let decoded = rawUrl; try { decoded = decodeURIComponent(rawUrl); } catch (e) {}
         const filename = decoded.split(/[/\\]/).pop();
         if (filename === file.name) {
             replaced = true;
             return `${prefix}${blobUrl}${suffix}`;
         }
         return fullMatch;
      });

      if (!replaced) {
        if (file.type === "application/pdf") {
          newContent += `\n<iframe src="${blobUrl}" className="w-full h-[600px] border-none rounded-xl mt-4 bg-white" title="${file.name}"></iframe>\n`;
        } else {
          newContent += `\n![${file.name}](${blobUrl})\n`;
        }
        insertedAny = true;
      }
    }

    setLocalImageFiles(prev => ({ ...prev, ...newFiles }));
    if (newContent !== content) {
      setContent(newContent);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const files: File[] = [];
    for (let i = 0; i < items.length; i++) {
       if (items[i].type.indexOf("image") !== -1 || items[i].type.indexOf("pdf") !== -1) {
         e.preventDefault();
         const f = items[i].getAsFile();
         if (f) files.push(f);
       }
    }
    if (files.length > 0) processLocalFiles(files);
  };

  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    if (!e.dataTransfer.files) return;
    const files = Array.from(e.dataTransfer.files);
    processLocalFiles(files);
  };

  const handlePublish = async () => {
    if (!content.trim() || (activeTab === "post" && !title.trim())) {
      alert("内容/标题不能为空");
      return;
    }

    let adminPassword = localStorage.getItem("ADMIN_PASSWORD");
    if (!adminPassword) {
      adminPassword = prompt("请输入发布密码：");
      if (!adminPassword) return;
      localStorage.setItem("ADMIN_PASSWORD", adminPassword);
    }

    setIsSubmitting(true);
    let finalContent = content;

    try {
      const blobUrlsInContent = Object.keys(localImageFiles).filter(url =>
        finalContent.includes(url)
      );

      if (blobUrlsInContent.length > 0) {
        for (let i = 0; i < blobUrlsInContent.length; i++) {
          const blobUrl = blobUrlsInContent[i];
          setUploadProgress(`${i + 1}/${blobUrlsInContent.length}`);

          const file = localImageFiles[blobUrl];
          const formData = new FormData();
          formData.append("file", file);

          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            headers: { "Authorization": `Bearer ${adminPassword}` },
            body: formData,
          });
          const uploadData = await uploadRes.json();
          if (!uploadRes.ok) throw new Error(uploadData.error || "Image Upload failed");

          finalContent = finalContent.split(blobUrl).join(uploadData.url);
        }
      }
      setUploadProgress("");

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminPassword}`
        },
        body: JSON.stringify({ type: activeTab, title, content: finalContent, tags: activeTab === "post" ? selectedTags : [] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setContent("");
      setTitle("");
      setSelectedTags([]);
      setLocalImageFiles({});
      localStorage.removeItem(`draft-${activeTab}-content`);
      localStorage.removeItem(`draft-${activeTab}-title`);
      localStorage.removeItem(`draft-${activeTab}-tags`);

      if (onSuccess) onSuccess();
    } catch (err: any) {
      setUploadProgress("");
      alert("发布失败: " + err.message);
      if (err.message === "Unauthorized") {
         localStorage.removeItem("ADMIN_PASSWORD");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const extractImages = (text: string) => {
    const urls: string[] = [];
    const mdRegex = /!?\[.*?\]\((.*?)\)/g;
    let match;
    while ((match = mdRegex.exec(text)) !== null) {
      if (match[1]) {
        const urlPart = match[1].trim().replace(/^<|>$/g, '').split(/[\s'"]/)[0];
        urls.push(urlPart);
      }
    }
    const htmlRegex = /<(?:img|iframe|embed).*?src=["'](.*?)["']/gi;
    while ((match = htmlRegex.exec(text)) !== null) {
      if (match[1]) urls.push(match[1]);
    }
    return urls;
  };

  const previewUrls = extractImages(content);
  // 只在底部实时预览区显示合法的在线/blob/base64图片，忽略还没修好的本地占位路径
  const validPreviewImages = previewUrls.filter(url => {
    if (!url.startsWith('http') && !url.startsWith('blob:') && !url.startsWith('data:')) return false;
    const file = localImageFiles[url];
    if (file && file.type === "application/pdf") return false;
    if (url.toLowerCase().endsWith('.pdf')) return false;
    return true;
  });

  const removeImageFromContent = (urlToRemove: string) => {
    const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const safeUrl = escape(urlToRemove);
    setContent(prev => {
      let next = prev;
      next = next.replace(new RegExp(`\\n?!?\\[.*?\\]\\(${safeUrl}(?:\\s+["'][^"']*["'])?\\)\\n?`, 'g'), '');
      next = next.replace(new RegExp(`\\n?<(?:img|iframe|embed).*?src=["']${safeUrl}["'].*?>\\n?`, 'gi'), '');
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1 p-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#111]">
        <button
          onClick={() => setActiveTab("note")}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200",
            activeTab === "note" ? "bg-white dark:bg-[#222] shadow-sm text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222]"
          )}
        >
          <Type className="w-4 h-4" />碎碎念
        </button>
        <button
          onClick={() => setActiveTab("post")}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200",
            activeTab === "post" ? "bg-white dark:bg-[#222] shadow-sm text-gray-900 dark:text-white" : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#222]"
          )}
        >
          <FileText className="w-4 h-4" />写长文
        </button>
      </div>

      <div className="p-4 sm:p-6 flex flex-col gap-4">

        {/* 缺失图片修复提示区域 */}
        <AnimatePresence>
          {missingImages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl p-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between"
            >
              <div className="flex items-start gap-2 text-amber-700 dark:text-amber-400 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block mb-1">文档包含本地文件，需补充上传才能发布和预览：</span>
                  <span className="text-xs break-all opacity-80">{missingImages.join(", ")}</span>
                </div>
              </div>
              <label className="shrink-0 px-4 py-1.5 bg-amber-100 hover:bg-amber-200 dark:bg-amber-800/50 dark:hover:bg-amber-700 text-amber-800 dark:text-amber-200 rounded-lg text-sm font-medium cursor-pointer transition-colors whitespace-nowrap">
                批量选图修复
                <input
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      processLocalFiles(Array.from(e.target.files));
                      e.target.value = ""; // reset
                    }
                  }}
                />
              </label>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {activeTab === "post" && (
            <motion.div
              initial={{ opacity: 0, height: 0, scale: 0.98 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.98 }}
              className="overflow-hidden"
            >
              <input
                type="text"
                placeholder="给这篇长文起个标题..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-2xl font-bold bg-transparent border-none outline-none placeholder:text-gray-300 dark:placeholder:text-gray-700 pb-2"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                <div className="flex items-center text-sm text-gray-500 mr-2"><Tag className="w-4 h-4 mr-1" /> 标签:</div>
                {(Array.from(new Set([...AVAILABLE_TAGS, ...selectedTags]))).map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={clsx(
                      "px-3 py-1 rounded-full text-xs font-medium transition-colors border",
                      selectedTags.includes(tag)
                        ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-800"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative group">
          <textarea
            ref={textareaRef}
            placeholder={activeTab === "note" ? "此刻在想什么？（支持多图拖拽、粘贴，所见即所得）" : "在这里创作你的文章正文..."}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onPaste={handlePaste}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            disabled={isSubmitting}
            className="w-full min-h-[120px] resize-none bg-transparent text-gray-800 dark:text-gray-200 border-none outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 leading-relaxed text-base"
          />
        </div>

        {validPreviewImages.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-2">
            {validPreviewImages.map((url, idx) => (
              <div key={idx} className="relative group/img rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 w-24 h-24 sm:w-32 sm:h-32 shadow-sm bg-gray-50 dark:bg-[#111]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImageFromContent(url)}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity backdrop-blur-sm"
                  title="移除该图片"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50 dark:border-gray-800/50">
          <div className="flex items-center gap-2">
            <label className="p-2 cursor-pointer rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="选择相册图片或PDF">
              <span className="flex items-center gap-1.5"><ImageIcon className="w-5 h-5" /><FileIcon className="w-4 h-4 opacity-70" /></span>
              <input
                type="file"
                accept="image/*,.pdf"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                     processLocalFiles(Array.from(e.target.files));
                     e.target.value = "";
                  }
                }}
              />
            </label>
            <label className="p-2 cursor-pointer rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="导入 Markdown 文档 (可以同时选中相关文件)">
              <FileUp className="w-5 h-5" />
              <input
                type="file"
                accept=".md,image/*,.pdf"
                multiple
                className="hidden"
                onChange={handleMdImport}
              />
            </label>
          </div>

          <button
            onClick={handlePublish}
            disabled={isSubmitting || (!content.trim() && validPreviewImages.length === 0) || missingImages.length > 0}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm border border-blue-500"
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" />{uploadProgress ? ` 上传图 ${uploadProgress}` : "正在发布"}</>
            ) : (
              <><Send className="w-4 h-4" />发布{activeTab === "post" ? "长文" : "动态"}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}