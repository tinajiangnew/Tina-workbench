/**
 * 合并类名工具函数
 * 用于条件性地合并Tailwind CSS类名
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}