import React from 'react';
import { 
  UsersIcon, 
  ChatBubbleLeftRightIcon, 
  HandThumbUpIcon, 
  StarIcon 
} from '@heroicons/react/24/outline';
import { useAuthStore } from '@/lib/store/auth';

interface ProfileStatsProps {
  className?: string;
}

interface StatItem {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

export default function ProfileStats({ className = '' }: ProfileStatsProps) {
  const { user } = useAuthStore();

  if (!user) {
    return null;
  }
  
  // These would come from API in a real app
  const isMaster = user.role === 'MASTER';
  const stats: StatItem[] = [
    {
      label: isMaster ? 'Mijozlar' : 'Ustalar',
      value: 0,
      icon: <UsersIcon className="h-6 w-6" />,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      label: 'Chatlar',
      value: 0,
      icon: <ChatBubbleLeftRightIcon className="h-6 w-6" />,
      color: 'bg-green-100 text-green-800'
    },
    {
      label: isMaster ? 'Reyting' : 'Baholar',
      value: isMaster ? 0 : 0,
      icon: <StarIcon className="h-6 w-6" />,
      color: 'bg-amber-100 text-amber-800'
    },
    {
      label: 'Layklar',
      value: 0,
      icon: <HandThumbUpIcon className="h-6 w-6" />,
      color: 'bg-pink-100 text-pink-800'
    }
  ];

  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <div key={index} className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <div className={`p-3 rounded-full ${stat.color} mb-3`}>
            {stat.icon}
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
        </div>
      ))}
    </div>
  );
} 