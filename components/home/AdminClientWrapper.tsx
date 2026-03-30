"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Modal } from "@/components/ui/Modal";
import { PostComposer } from "@/components/home/PostComposer";
import { useRouter } from "next/navigation";

export function AdminClientWrapper() {
  const [isComposerOpen, setComposerOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    setComposerOpen(false);
    // 强制刷新当前页面的 Server 数据并无感重载
    router.refresh();
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setComposerOpen(true)}
        className="fixed bottom-8 right-8 md:bottom-12 md:right-12 w-14 h-14 bg-black dark:bg-white text-white dark:text-black rounded-full shadow-2xl flex items-center justify-center z-40 focus:outline-none"
        title="发布新内容"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      <Modal isOpen={isComposerOpen} onClose={() => setComposerOpen(false)}>
        <PostComposer onSuccess={handleSuccess} />
      </Modal>
    </>
  );
}
