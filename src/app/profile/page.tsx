'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layouts/MainLayout';
import ProfileHeader from '@/components/user/ProfileHeader';
import ProfileStats from '@/components/user/ProfileStats';
import { useAuthStore } from '@/lib/store/auth';
import { Tab } from '@headlessui/react';
import { 
  Cog6ToothIcon, 
  UserCircleIcon, 
  BookmarkIcon, 
  BriefcaseIcon,
  EnvelopeIcon,
  HomeIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      setIsLoading(true);
      const isAuth = await checkAuth();
      
      if (!isAuth) {
        toast.error('Iltimos, avval tizimga kiring');
        router.push('/login');
      }
      
      setIsLoading(false);
    };
    
    checkAuthentication();
  }, [checkAuth, router]);

  const handleLogout = async () => {
    try {
      toast.loading('Chiqish amalga oshirilmoqda...', { id: 'logout' });
      await logout();
      toast.success('Tizimdan muvaffaqiyatli chiqdingiz', { id: 'logout' });
      router.push('/');
    } catch (error) {
      toast.error('Chiqishda xatolik yuz berdi', { id: 'logout' });
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </MainLayout>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Router will redirect in useEffect
  }

  const isMaster = user.role === 'MASTER';

  const tabItems = [
    { 
      name: 'Mening ma\'lumotlarim', 
      icon: <UserCircleIcon className="h-5 w-5 mr-2" />,
      content: <PersonalInfoTab user={user} />
    },
    { 
      name: isMaster ? 'Mening ishlarim' : 'Mening e\'lonlarim', 
      icon: isMaster ? <BriefcaseIcon className="h-5 w-5 mr-2" /> : <BookmarkIcon className="h-5 w-5 mr-2" />,
      content: <div className="p-4 text-center text-gray-500">Ma'lumotlar yo'q</div>
    },
    { 
      name: 'Sozlamalar', 
      icon: <Cog6ToothIcon className="h-5 w-5 mr-2" />,
      content: <div className="p-4 text-center text-gray-500">Ma'lumotlar yo'q</div>
    },
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <ProfileHeader className="mb-6" />
        <ProfileStats className="mb-8" />
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <Tab.Group>
            <Tab.List className="flex w-full overflow-x-auto bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              {tabItems.map((item, index) => (
                <Tab key={index} className={({ selected }) => 
                  `px-4 py-3 text-sm font-medium focus:outline-none whitespace-nowrap flex items-center
                  ${selected 
                    ? 'border-b-2 border-primary text-primary dark:text-primary-400' 
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`
                }>
                  {item.icon}
                  {item.name}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels>
              {tabItems.map((item, index) => (
                <Tab.Panel key={index}>
                  {item.content}
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </div>
        
        <button 
          onClick={handleLogout}
          className="mt-8 flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
          Tizimdan chiqish
        </button>
      </div>
    </MainLayout>
  );
}

interface UserInfo {
  label: string;
  value: string | null;
  icon: React.ReactNode;
}

const PersonalInfoTab = ({ user }: { user: any }) => {
  const userInfoItems: UserInfo[] = [
    {
      label: 'Ism familiya',
      value: user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.username,
      icon: <UserCircleIcon className="h-5 w-5 text-gray-400" />
    },
    {
      label: 'Email',
      value: user.email,
      icon: <EnvelopeIcon className="h-5 w-5 text-gray-400" />
    },
    {
      label: 'Rol',
      value: user.role === 'MASTER' ? 'Usta' : user.role === 'CLIENT' ? 'Mijoz' : user.role,
      icon: <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
    },
    {
      label: 'Manzil',
      value: user.address || 'Kiritilmagan',
      icon: <HomeIcon className="h-5 w-5 text-gray-400" />
    }
  ];

  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Shaxsiy ma'lumotlar</h3>
      <div className="space-y-4">
        {userInfoItems.map((item, index) => (
          <div key={index} className="flex items-start border-b border-gray-100 dark:border-gray-700 pb-4">
            <div className="flex-shrink-0 mt-1">{item.icon}</div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.label}</p>
              <p className="text-sm text-gray-900 dark:text-white">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 