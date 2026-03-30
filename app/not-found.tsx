import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-8xl font-black text-gray-200 dark:text-gray-800 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-6">哎呀，页面走丢了</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
        您想访问的页面可能已经被删除、重命名，或者您输入了错误的网址。
      </p>
      <Link 
        href="/"
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-colors"
      >
        带我回首页
      </Link>
    </div>
  );
}
