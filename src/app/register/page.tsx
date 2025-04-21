'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { register as registerUser } from '@/lib/api/auth';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/store/auth';
import MainLayout from '@/components/layouts/MainLayout';
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon, CheckIcon } from '@heroicons/react/24/outline';

type RegisterFormData = {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  role: 'CLIENT' | 'MASTER';
  first_name?: string;
  last_name?: string;
  phone_number?: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'CLIENT' | 'MASTER'>('CLIENT');
  
  // Get role from query parameter
  useEffect(() => {
    const roleFromQuery = searchParams.get('role')?.toUpperCase();
    if (roleFromQuery === 'CLIENT' || roleFromQuery === 'MASTER') {
      setSelectedRole(roleFromQuery);
    }
  }, [searchParams]);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>();
  
  const password = watch('password', '');

  const onSubmit = async (data: RegisterFormData) => {
    if (data.password !== data.password_confirm) {
      toast.error("Parollar mos kelmadi");
      return;
    }
    
    try {
      setIsLoading(true);
      toast.loading('Ro\'yxatdan o\'tkazilmoqda...', { id: 'register' });
      
      const formData = {
        ...data,
        role: selectedRole,
      };
      
      delete formData.password_confirm;
      
      const response = await registerUser(formData);
      setUser(response.user);
      
      toast.success('Muvaffaqiyatli ro\'yxatdan o\'tdingiz!', { id: 'register' });
      router.push('/');
    } catch (error: any) {
      console.error('Registration error:', error);
      
      const errorMessage = error.response?.data?.detail || 
                           error.response?.data?.error || 
                           'Ro\'yxatdan o\'tishda xatolik yuz berdi';
      
      toast.error(errorMessage, { id: 'register' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        <button 
          onClick={() => router.push('/')} 
          className="absolute top-8 left-8 flex items-center text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-1" />
          <span>Bosh sahifa</span>
        </button>
        
        <div className="max-w-md w-full">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="relative w-20 h-20">
                <Image
                  src="/images/logo.png"
                  alt="Dwella logo"
                  fill
                  className="object-contain"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/150?text=Dwella';
                  }}
                />
              </div>
            </div>
            <h2 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
              Ro'yxatdan o'tish
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Yoki{' '}
              <Link href="/login" className="font-medium text-primary hover:text-primary-dark transition-colors">
                mavjud hisobingizga kiring
              </Link>
            </p>
          </div>
          
          <div className="mt-8">
            <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-md rounded-lg">
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Kim sifatida ro'yxatdan o'tmoqchisiz?</p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('CLIENT')}
                    className={`relative px-4 py-3 border rounded-lg flex flex-col items-center transition-all ${
                      selectedRole === 'CLIENT'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary/50 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {selectedRole === 'CLIENT' && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <CheckIcon className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm font-medium">Mijoz</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setSelectedRole('MASTER')}
                    className={`relative px-4 py-3 border rounded-lg flex flex-col items-center transition-all ${
                      selectedRole === 'MASTER'
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary/50 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {selectedRole === 'MASTER' && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <CheckIcon className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm font-medium">Usta</span>
                  </button>
                </div>
              </div>
              
              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ism
                    </label>
                    <input
                      id="first_name"
                      type="text"
                      {...register('first_name')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Familiya
                    </label>
                    <input
                      id="last_name"
                      type="text"
                      {...register('last_name')}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Foydalanuvchi nomi *
                  </label>
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    {...register('username', {
                      required: 'Foydalanuvchi nomi kiritilishi shart',
                      minLength: {
                        value: 3,
                        message: 'Foydalanuvchi nomi kamida 3 ta belgidan iborat bo\'lishi kerak'
                      }
                    })}
                    className={`w-full px-3 py-2 border ${errors.username ? 'border-error' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white`}
                    disabled={isLoading}
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-error">{errors.username.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register('email', {
                      required: 'Email kiritilishi shart',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Noto\'g\'ri email format'
                      }
                    })}
                    className={`w-full px-3 py-2 border ${errors.email ? 'border-error' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white`}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-error">{errors.email.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Telefon
                  </label>
                  <input
                    id="phone_number"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+998 XX XXX XX XX"
                    {...register('phone_number')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Parol *
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      {...register('password', {
                        required: 'Parol kiritilishi shart',
                        minLength: {
                          value: 8,
                          message: 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak'
                        }
                      })}
                      className={`w-full px-3 py-2 border ${errors.password ? 'border-error' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white pr-10`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-error">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Parolni tasdiqlang *
                  </label>
                  <div className="relative">
                    <input
                      id="password_confirm"
                      type={showPasswordConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      {...register('password_confirm', {
                        required: 'Parolni tasdiqlash shart',
                        validate: value => value === password || 'Parollar mos kelmadi'
                      })}
                      className={`w-full px-3 py-2 border ${errors.password_confirm ? 'border-error' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white pr-10`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                    >
                      {showPasswordConfirm ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password_confirm && (
                    <p className="mt-1 text-sm text-error">{errors.password_confirm.message}</p>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Ro'yxatdan o'tkazilmoqda...
                      </>
                    ) : (
                      'Ro\'yxatdan o\'tish'
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                      Yoki ijtimoiy tarmoqlar orqali ro'yxatdan o'ting
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <svg className="h-5 w-5 mr-2" fill="#4285F4" viewBox="0 0 24 24">
                      <path d="M12.545 10.239v3.818h5.556c-.226 1.338-1.682 3.673-5.555 3.673-3.347 0-6.078-2.735-6.078-6.111s2.731-6.111 6.078-6.111c1.903 0 3.176.789 3.886 1.481l2.664-2.535c-1.714-1.601-3.926-2.565-6.55-2.565-5.407 0-9.78 4.32-9.78 9.73s4.373 9.73 9.78 9.73c5.65 0 9.387-3.954 9.387-9.513 0-.755-.094-1.326-.188-1.897h-9.2z" />
                    </svg>
                    Google
                  </button>
                  <button
                    type="button"
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <svg className="h-5 w-5 mr-2" fill="#333333" viewBox="0 0 24 24">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                    </svg>
                    GitHub
                  </button>
                </div>
                
                <p className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
                  Ro'yxatdan o'tish orqali siz <Link href="/terms" className="text-primary hover:text-primary-dark">foydalanish shartlari</Link> va <Link href="/privacy" className="text-primary hover:text-primary-dark">maxfiylik siyosati</Link>ga rozilik bildirasiz.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 