'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  UserCircleIcon,
  SparklesIcon,
  LightBulbIcon,
  UsersIcon,
  BookOpenIcon,
  HeartIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const categories = [
  { name: 'Home', href: '/', icon: HomeIcon },
  { name: 'Roots (Sanctum)', href: '/roots', icon: UserCircleIcon, emoji: '🌱' },
  { name: 'Stem (Skills)', href: '/stem', icon: ChartBarIcon, emoji: '📈' },
  { name: 'Leaves (Moments)', href: '/leaves', icon: BookOpenIcon, emoji: '🌿' },
  { name: 'Memory Garden', href: '/memories', icon: HeartIcon, emoji: '🍂' },
  { name: 'Bloom (Spirit)', href: '/bloom', icon: SparklesIcon, emoji: '🌸' },
  { name: 'Fruit (Contributions)', href: '/fruit', icon: HeartIcon, emoji: '🍇' },
  { name: 'Community Garden', href: '/community', icon: UsersIcon, emoji: '🪴' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 pt-24">
      <nav className="space-y-1 px-2">
        {categories.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-2 py-2 text-lg font-medium rounded-md ${
                isActive
                  ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                  : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              <item.icon
                className={`mr-3 h-6 w-6 flex-shrink-0 ${
                  isActive
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300'
                }`}
                aria-hidden="true"
              />
              <span className="flex items-center">
                {item.emoji && <span className="mr-2">{item.emoji}</span>}
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
} 