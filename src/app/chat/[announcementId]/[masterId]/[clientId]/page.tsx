'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layouts/MainLayout';
import { useAuthStore } from '@/lib/store/auth';
import { getChatHistory, createChatWebSocket, Chat } from '@/lib/api/chat';
import { PaperAirplaneIcon, PhotoIcon, ArrowLeftIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const announcementId = params.announcementId as string;
  const masterId = Number(params.masterId);
  const clientId = Number(params.clientId);
  
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [chatMessages, setChatMessages] = useState<Chat[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [chatPartner, setChatPartner] = useState<{
    id: number;
    name: string;
    picture: string;
  } | null>(null);
  const [showImagePreview, setShowImagePreview] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Focus on input when chat opens
  useEffect(() => {
    if (!isLoading && !error) {
      chatInputRef.current?.focus();
    }
  }, [isLoading, error]);
  
  // Load chat history
  useEffect(() => {
    if (!isAuthenticated && !checkAuth()) return;
    
    const fetchChatHistory = async () => {
      try {
        setIsLoading(true);
        const history = await getChatHistory(announcementId, masterId, clientId);
        setChatMessages(history);
        
        // Set chat partner
        if (history.length > 0) {
          const message = history[0];
          const isCurrentUserMaster = user?.id === masterId;
          const partner = isCurrentUserMaster 
            ? {
                id: message.client,
                name: `${message.client_details.first_name || ''} ${message.client_details.last_name || ''}`.trim() || message.client_details.username,
                picture: message.client_details.picture || '/images/placeholder-user.jpg'
              }
            : {
                id: message.master,
                name: `${message.master_details.first_name || ''} ${message.master_details.last_name || ''}`.trim() || message.master_details.username,
                picture: message.master_details.picture || '/images/placeholder-user.jpg'
              };
          
          setChatPartner(partner);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load chat history');
        toast.error('Xabarlarni yuklashda xatolik yuz berdi');
      } finally {
        setIsLoading(false);
        // Short delay to ensure DOM is updated before scrolling
        setTimeout(scrollToBottom, 100);
      }
    };
    
    fetchChatHistory();
  }, [announcementId, masterId, clientId, isAuthenticated, user, checkAuth]);
  
  // Setup WebSocket connection
  useEffect(() => {
    if (!isAuthenticated && !checkAuth()) return;
    
    const newSocket = createChatWebSocket(announcementId, masterId, clientId);
    
    newSocket.onopen = () => {
      console.log('WebSocket connection established');
      toast.success('Chat ulanishi o\'rnatildi', { id: 'ws-connect' });
    };
    
    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Add received message to chat
      setChatMessages((prevMessages) => [
        ...prevMessages,
        {
          id: data.chat_id,
          connect_announcement: announcementId,
          master: masterId,
          master_details: {
            id: masterId,
            username: '',
            first_name: '',
            last_name: '',
            picture: ''
          },
          client: clientId,
          client_details: {
            id: clientId,
            username: '',
            first_name: '',
            last_name: '',
            picture: ''
          },
          message: data.message,
          image: data.image,
          created_at: data.timestamp,
          sender_id: Number(data.sender_id)
        }
      ]);
    };
    
    newSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setError('WebSocket connection error');
      toast.error('Serverga ulanishda xatolik', { id: 'ws-error' });
    };
    
    newSocket.onclose = () => {
      console.log('WebSocket connection closed');
      toast.error('Chat ulanishi uzildi', { id: 'ws-close' });
    };
    
    setSocket(newSocket);
    
    return () => {
      if (newSocket && newSocket.readyState === WebSocket.OPEN) {
        newSocket.close();
      }
    };
  }, [announcementId, masterId, clientId, isAuthenticated, checkAuth]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);
  
  // Group messages by date
  const getMessageDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };
  
  const messagesByDate = chatMessages.reduce<{[key: string]: Chat[]}>((groups, message) => {
    const date = getMessageDate(message.created_at);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});
  
  // Send message handler
  const handleSendMessage = () => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      toast.error('Server bilan aloqa yo\'q');
      return;
    }
    
    if (!newMessage.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      socket.send(JSON.stringify({
        message: newMessage
      }));
      
      setNewMessage('');
    } catch (error) {
      toast.error('Xabar yuborishda xatolik yuz berdi');
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
      // Focus back on input after sending
      chatInputRef.current?.focus();
    }
  };
  
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      toast.error('Server bilan aloqa yo\'q');
      return;
    }
    
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Rasm hajmi 5MB dan oshmasligi kerak');
      return;
    }
    
    // Show loading toast
    toast.loading('Rasm yuklanmoqda...', { id: 'upload-image' });
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        try {
          socket.send(JSON.stringify({
            message: '',
            image: event.target.result
          }));
          toast.success('Rasm yuklandi', { id: 'upload-image' });
        } catch (error) {
          toast.error('Rasmni yuborishda xatolik', { id: 'upload-image' });
          console.error('Error sending image:', error);
        }
      }
    };
    reader.onerror = () => {
      toast.error('Rasmni o\'qishda xatolik', { id: 'upload-image' });
    };
    reader.readAsDataURL(file);
    
    // Reset file input
    e.target.value = '';
  };
  
  // Handle image click to preview
  const handleImageClick = (imageSrc: string) => {
    setShowImagePreview(imageSrc);
  };
  
  // Check if current user is allowed to view this chat
  const isUserAllowed = user && (user.id === masterId || user.id === clientId);
  
  if (!isAuthenticated && !checkAuth()) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <XMarkIcon className="w-8 h-8 text-gray-500 dark:text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Kirish talab qilinadi
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Bu sahifani ko'rish uchun tizimga kirishingiz kerak
            </p>
            <button
              onClick={() => router.push('/login')}
              className="mt-6 btn-primary"
            >
              Tizimga kirish
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  if (!isUserAllowed) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-error-light/20 dark:bg-error-dark/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XMarkIcon className="w-8 h-8 text-error" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Ruxsat yo'q
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Bu chatni ko'rishga ruxsatingiz yo'q
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-6 btn-primary"
            >
              Bosh sahifaga qaytish
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      {/* Image Preview Modal */}
      {showImagePreview && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
          onClick={() => setShowImagePreview(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button 
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-full text-white hover:bg-opacity-75 transition-all"
              onClick={() => setShowImagePreview(null)}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <Image
              src={showImagePreview}
              alt="Preview"
              width={1200}
              height={800}
              className="rounded-lg object-contain max-h-[90vh] w-auto mx-auto"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="card min-h-[80vh] flex flex-col rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          {/* Chat header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800 shadow-sm">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-3 p-2 rounded-full text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors hidden md:flex"
                aria-label="Go back"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              
              {chatPartner ? (
                <div className="flex items-center">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary">
                    <Image
                      src={chatPartner.picture || '/images/placeholder-user.jpg'}
                      alt={chatPartner.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {chatPartner.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user?.role === 'MASTER' ? 'Mijoz' : 'Usta'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="animate-pulse flex items-center space-x-4">
                  <div className="rounded-full bg-gray-300 dark:bg-gray-700 h-12 w-12"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-36"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
                  </div>
                </div>
              )}
            </div>
            
            <button className="p-2 rounded-full text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <EllipsisVerticalIcon className="w-5 h-5" />
            </button>
          </div>
          
          {/* Chat messages */}
          <div 
            ref={chatContainerRef}
            className="flex-grow p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900 scroll-smooth"
          >
            {isLoading ? (
              <div className="flex flex-col justify-center items-center h-full">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Xabarlar yuklanmoqda...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-error-light/20 dark:bg-error-dark/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XMarkIcon className="w-8 h-8 text-error" />
                </div>
                <p className="text-error font-medium">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                >
                  Qayta yuklash
                </button>
              </div>
            ) : chatMessages.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-full text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <PaperAirplaneIcon className="w-10 h-10 text-primary -rotate-45" />
                </div>
                <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  Hali xabar yo'q
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  Suhbatni boshlash uchun xabar yuboring. Xabar matnini kiriting yoki rasm yuklang.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(messagesByDate).map(([date, messages]) => (
                  <div key={date}>
                    <div className="flex justify-center mb-4">
                      <div className="bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1 text-xs text-gray-600 dark:text-gray-300">
                        {new Date(date).toLocaleDateString(undefined, { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {messages.map((message, index) => {
                        const isCurrentUser = user?.id === (message.sender_id || (user.role === 'MASTER' ? masterId : clientId));
                        // Show sender avatar only if different from previous message
                        const showAvatar = index === 0 || 
                          messages[index - 1].sender_id !== message.sender_id;
                        
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                          >
                            {!isCurrentUser && showAvatar && (
                              <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                                <Image
                                  src={chatPartner?.picture || '/images/placeholder-user.jpg'}
                                  alt={chatPartner?.name || 'User'}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            
                            <div
                              className={`max-w-[75%] md:max-w-[80%] rounded-lg p-3 ${
                                isCurrentUser
                                  ? 'bg-primary text-white rounded-tr-none shadow-sm'
                                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-tl-none shadow-sm'
                              }`}
                            >
                              {message.message && (
                                <p className={`text-sm md:text-base ${isCurrentUser ? 'text-white' : 'text-gray-800 dark:text-white'}`}>
                                  {message.message}
                                </p>
                              )}
                              
                              {message.image && (
                                <div className="mt-2 relative group">
                                  <div 
                                    className="overflow-hidden rounded-md cursor-pointer"
                                    onClick={() => handleImageClick(message.image || '')}
                                  >
                                    <Image
                                      src={message.image}
                                      alt="Chat image"
                                      width={300}
                                      height={200}
                                      className="rounded-md max-w-full object-cover transition-transform duration-200 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                      <div className="bg-black bg-opacity-50 rounded-full p-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex items-center justify-end mt-1 space-x-1">
                                <p className={`text-xs ${isCurrentUser ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>
                                  {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                {isCurrentUser && (
                                  <CheckIcon className="w-3 h-3 text-white/70" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          {/* Chat input */}
          <div className="p-3 md:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-full text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
                aria-label="Upload image"
              >
                <PhotoIcon className="w-6 h-6" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              
              <div className="flex-grow mx-2 relative">
                <input
                  ref={chatInputRef}
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Xabar yozing..."
                  className="w-full py-2 px-4 bg-gray-100 dark:bg-gray-700 rounded-full border border-transparent focus:border-primary dark:focus:border-primary focus:ring-1 focus:ring-primary dark:focus:ring-primary outline-none transition-all text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  disabled={isLoading || isSubmitting}
                />
              </div>
              
              <button
                type="button"
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isSubmitting}
                className={`p-2 rounded-full flex-shrink-0 ${
                  newMessage.trim() && !isSubmitting
                    ? 'bg-primary text-white hover:bg-primary-dark'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                } transition-colors`}
                aria-label="Send message"
              >
                <PaperAirplaneIcon className="w-6 h-6 rotate-90 transform -translate-y-px" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}