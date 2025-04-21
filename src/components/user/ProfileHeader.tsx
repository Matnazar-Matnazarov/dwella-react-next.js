import React from 'react';
import Image from 'next/image';
import { useAuthStore } from '@/lib/store/auth';

interface ProfileHeaderProps {
  className?: string;
}

export default function ProfileHeader({ className = '' }: ProfileHeaderProps) {
  const { user } = useAuthStore();

  if (!user) {
    return null;
  }

  const fullName = user.first_name && user.last_name 
    ? `${user.first_name} ${user.last_name}` 
    : user.username;

  const userImage = user.picture || '/images/default-avatar.png';
  
  const roleBadgeStyle = () => {
    switch (user.role) {
      case 'MASTER':
        return 'bg-primary-100 text-primary-800';
      case 'CLIENT':
        return 'bg-secondary-100 text-secondary-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDisplayRole = () => {
    switch (user.role) {
      case 'MASTER':
        return 'Usta';
      case 'CLIENT':
        return 'Mijoz';
      default:
        return user.role;
    }
  };

  return (
    <div className={`flex flex-col md:flex-row items-center gap-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm ${className}`}>
      <div className="relative w-24 h-24 md:w-32 md:h-32">
        <Image
          src={userImage}
          alt={fullName}
          fill
          className="object-cover rounded-full border-4 border-primary-50 dark:border-primary-900"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/images/default-avatar.png';
          }}
        />
      </div>
      
      <div className="flex flex-col items-center md:items-start">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{fullName}</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-2">{user.email}</p>
        <div className={`px-3 py-1 text-sm rounded-full ${roleBadgeStyle()}`}>
          {getDisplayRole()}
        </div>
      </div>
    </div>
  );
} 