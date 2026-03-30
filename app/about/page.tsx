import React from 'react';
import AboutClient from '@/components/about/AboutClient';
import { getAboutData } from '@/lib/posts';

export const revalidate = 60; // 每 60 秒刷新一次 (ISR)

export default async function AboutPage() {
  const initialData = await getAboutData();

  return (
    <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto min-h-screen">
      <AboutClient initialData={initialData} />
    </div>
  );
}