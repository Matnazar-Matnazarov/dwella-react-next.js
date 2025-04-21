'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import MainLayout from '@/components/layouts/MainLayout';
import { useAuthStore } from '@/lib/store/auth';
import { getActiveChats } from '@/lib/api/chat';
import { toast } from '@/lib/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Search, UserRound, ArrowRightIcon, Loader2 } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/utils';

type ChatPreview = {
  id: number;
  connect_announcement: string;
  master: number;
  client: number;
  master_details: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    picture: string;
  };
  client_details: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    picture: string;
  };
  last_message: string;
  last_message_time: string;
  unread_count: number;
};

export default function ChatListPage() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [chatsList, setChatsList] = useState<ChatPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch active chats
  useEffect(() => {
    const fetchChats = async () => {
      if (!isAuthenticated && !checkAuth()) return;

      try {
        setIsLoading(true);
        const chats = await getActiveChats();
        setChatsList(chats);
      } catch (err: any) {
        console.error('Failed to load chats:', err);
        setError(err.message || 'Chatlarni yuklashda xatolik yuz berdi');
        toast({
          title: "Xatolik",
          description: "Chatlarni yuklashda xatolik yuz berdi",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, [isAuthenticated, checkAuth]);

  // Filter chats based on search query
  const filteredChats = chatsList.filter(chat => {
    const userRole = user?.role;
    const searchIn = userRole === 'MASTER' 
      ? `${chat.client_details.first_name} ${chat.client_details.last_name} ${chat.client_details.username}`.toLowerCase()
      : `${chat.master_details.first_name} ${chat.master_details.last_name} ${chat.master_details.username}`.toLowerCase();
    
    return searchIn.includes(searchQuery.toLowerCase()) || 
           (chat.last_message && chat.last_message.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  // Format display name for a chat partner
  const getPartnerName = (chat: ChatPreview) => {
    const isUserMaster = user?.role === 'MASTER';
    const partner = isUserMaster ? chat.client_details : chat.master_details;
    return `${partner.first_name || ''} ${partner.last_name || ''}`.trim() || partner.username;
  };

  // Get partner picture
  const getPartnerPicture = (chat: ChatPreview) => {
    const isUserMaster = user?.role === 'MASTER';
    const partner = isUserMaster ? chat.client_details : chat.master_details;
    return partner.picture || '/images/placeholder-user.jpg';
  };

  if (!isAuthenticated && !checkAuth()) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="max-w-md mx-auto text-center p-8">
            <CardHeader>
              <div className="mx-auto rounded-full bg-gray-200 dark:bg-gray-800 w-16 h-16 flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-gray-500 dark:text-gray-400" strokeWidth={1.5} />
              </div>
              <CardTitle className="text-2xl font-bold">
                Kirish talab qilinadi
              </CardTitle>
              <CardDescription className="mt-2 text-lg">
                Chatlarni ko'rish uchun tizimga kirishingiz kerak
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Button onClick={() => router.push('/login')}>
                Tizimga kirish
              </Button>
            </CardFooter>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Chatlar
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              E'lonlar bo'yicha suhbatlar
            </p>
          </div>
          
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Chatlarni qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full md:w-64"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Chatlar yuklanmoqda...</p>
          </div>
        ) : error ? (
          <Card className="text-center p-8">
            <CardHeader>
              <div className="w-16 h-16 bg-error-light/20 dark:bg-error-dark/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <CardTitle>{error}</CardTitle>
              <CardDescription className="mt-2">
                Iltimos, keyinroq qayta urinib ko'ring
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center">
              <Button onClick={() => window.location.reload()}>
                Qayta yuklash
              </Button>
            </CardFooter>
          </Card>
        ) : filteredChats.length === 0 ? (
          <Card className="text-center p-8">
            {searchQuery ? (
              <>
                <CardHeader>
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-gray-500" />
                  </div>
                  <CardTitle>Qidiruv bo'yicha chatlar topilmadi</CardTitle>
                  <CardDescription className="mt-2">
                    "{searchQuery}" so'rovi bo'yicha hech qanday chat topilmadi
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-center">
                  <Button variant="outline" onClick={() => setSearchQuery('')}>
                    Qidiruvni tozalash
                  </Button>
                </CardFooter>
              </>
            ) : (
              <>
                <CardHeader>
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-10 h-10 text-primary" strokeWidth={1.5} />
                  </div>
                  <CardTitle>Hozircha chatlar yo'q</CardTitle>
                  <CardDescription className="mt-2">
                    {user?.role === 'MASTER' 
                      ? "Mijozlar bilan suhbatlar bu yerda ko'rsatiladi" 
                      : "Ustalar bilan suhbatlar bu yerda ko'rsatiladi"}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-center">
                  <Button 
                    onClick={() => router.push(user?.role === 'MASTER' ? "/announcements" : "/masters")}
                    className="gap-2"
                  >
                    {user?.role === 'MASTER' ? "E'lonlarni ko'rish" : "Ustalarni ko'rish"}
                    <ArrowRightIcon className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredChats.map((chat) => (
              <Link
                key={chat.id} 
                href={`/chat/${chat.connect_announcement}/${chat.master}/${chat.client}`}
                className="block transition hover:transform hover:scale-[1.01]"
              >
                <Card className="hover:shadow-md transition-shadow duration-200 h-full">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="relative w-16 h-16 rounded-full overflow-hidden">
                          <Image
                            src={getPartnerPicture(chat)}
                            alt={getPartnerName(chat)}
                            fill
                            className="object-cover"
                          />
                        </div>
                        {chat.unread_count > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                            {chat.unread_count}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-grow overflow-hidden">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {getPartnerName(chat)}
                          </h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                            {formatDate(chat.last_message_time)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between mt-1">
                          <p className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px]">
                            {chat.last_message || 'Hozircha xabarlar yo\'q'}
                          </p>
                          <ArrowRightIcon className="h-5 w-5 text-gray-400 flex-shrink-0 ml-2" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
} 