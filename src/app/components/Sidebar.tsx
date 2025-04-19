'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  SparklesIcon,
  BookOpenIcon,
  PencilSquareIcon,
  UserGroupIcon,
  NewspaperIcon,
  HeartIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

export default function Sidebar() {
  const pathname = usePathname();

  const sections = [
    {
      title: '🌱 My Garden',
      subtitle: 'Personal Growth & Reflection',
      description: 'This plot is your personal space to nurture your Life Plant, combining expression, reflection, and growth.',
      links: [
        { name: '🪴 My Plant', href: '/garden/plant', description: 'View your Life Plant, a visual representation of your threads, moments, and milestones.' },
        { name: '📖 Threads', href: '/garden/threads', description: 'Access your ongoing stories (e.g., "Learning to Cook," "Healing Journey").' },
        { name: '✍️ New Moment', href: '/garden/new', description: 'Share a joy, insight, healing log, or skill update.' },
        { name: '🪞 Reflections', href: '/garden/reflections', description: 'Private journaling or mood check-ins, with prompts.' }
      ]
    },
    {
      title: '🌻 Community Meadow',
      subtitle: 'Connection & Inspiration',
      description: 'This plot connects you to others\' plants and shared spaces, fostering resonance and belonging.',
      links: [
        { name: '📰 Growth Feed', href: '/community/feed', description: 'A curated stream of moments from connections, with resonance options.' },
        { name: '👥 Circles', href: '/community/circles', description: 'Join or explore intentional groups.' },
        { name: '🌈 Resonances', href: '/community/resonances', description: 'See who\'s watered or sunlighted your moments.' }
      ]
    },
    {
      title: '🍇 Fruit Patch',
      subtitle: 'Collaboration & Creation',
      description: 'This plot is where you create and collaborate, including projects visualized as "fruit" you share with the world.',
      links: [
        { name: '💡 Projects', href: '/fruit/projects', description: 'Explore and manage your collaborative projects.' },
        { name: '🎨 Create', href: '/fruit/create', description: 'Start a new project or collaboration.' },
        { name: '🌟 Showcase', href: '/fruit/showcase', description: 'Share your creations with the community.' }
      ]
    }
  ];

  return (
    <div className="fixed left-0 top-24 w-72 h-[calc(100vh-6rem)] bg-white dark:bg-gray-800 rounded-r-lg shadow-lg p-4 overflow-y-auto">
      <nav className="space-y-8">
        {sections.map((section) => (
          <div key={section.title}>
            <div className="px-4 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {section.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {section.subtitle}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                {section.description}
              </p>
            </div>
            <div className="space-y-1">
              {section.links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`block px-4 py-2 text-sm rounded-lg transition-colors ${
                      isActive
                        ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="font-medium">{link.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {link.description}
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="my-4 border-t border-gray-200 dark:border-gray-700" />
          </div>
        ))}
      </nav>
    </div>
  );
} 