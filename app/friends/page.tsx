import { FriendsMap } from '@/components/ui/FriendsMap';

export default function FriendsPage() {
  return (
    <div className="max-w-4xl mx-auto pt-32 pb-20 px-6">
      <h1 className="text-3xl font-bold mb-4 text-center">Friends</h1>
      <p className="text-center text-gray-500 mb-8">我与这个世界的连接</p>

      <div className="w-full h-[600px] relative bg-gray-50 dark:bg-[#111] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
        <FriendsMap />
      </div>
    </div>
  );
}
