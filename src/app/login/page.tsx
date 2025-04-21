'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { login, googleLogin } from '@/lib/api/auth';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/store/auth';
import MainLayout from '@/components/layouts/MainLayout';
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          prompt: () => void;
          cancel?: () => void;
        };
      };
    };
  }
}

type LoginFormData = {
  username: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  // Google login initialization
  useEffect(() => {
    let scriptElement: HTMLScriptElement | null = null;
    
    const loadGoogleSignIn = () => {
      // Check if script already exists
      if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
        console.log('Google Sign-In script already loaded');
        initializeGoogleAuth();
        return;
      }
      
      console.log('Loading Google Sign-In script');
      // Create script element
      scriptElement = document.createElement('script');
      scriptElement.src = 'https://accounts.google.com/gsi/client';
      scriptElement.async = true;
      scriptElement.defer = true;
      scriptElement.onload = () => {
        console.log('Google Sign-In script loaded successfully');
        initializeGoogleAuth();
      };
      scriptElement.onerror = (error) => {
        console.error('Failed to load Google Sign-In script', error);
      };
      
      document.body.appendChild(scriptElement);
    };
    
    const initializeGoogleAuth = () => {
      if (!window.google?.accounts?.id) {
        console.error('Google accounts API not available');
        return;
      }
      
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      console.log('Initializing Google auth with client ID:', clientId);
      
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleResponse,
          cancel_on_tap_outside: false,
          context: 'signin',
          auto_select: false
        });
        
        // Render the button
        const googleBtn = document.getElementById('google-signin-button');
        if (googleBtn) {
          window.google.accounts.id.renderButton(googleBtn, {
            theme: 'filled_blue',
            size: 'large',
            shape: 'rectangular',
            text: 'continue_with',
            width: '100%',
            locale: 'uz',
          });
          
          console.log('Google Sign-In button rendered');
        } else {
          console.error('Google Sign-In button container not found');
        }
      } catch (error) {
        console.error('Error initializing Google Sign-In:', error);
      }
    };
    
    loadGoogleSignIn();
    
    // Cleanup function
    return () => {
      // Only remove the script if we created it
      if (scriptElement && document.body.contains(scriptElement)) {
        document.body.removeChild(scriptElement);
      }
      
      // Cancel One Tap UI if active
      if (window.google?.accounts?.id?.cancel) {
        try {
          window.google.accounts.id.cancel();
        } catch (e) {
          console.error('Error cancelling Google Sign-In:', e);
        }
      }
    };
  }, []);
  
  // Handle Google sign-in response
  const handleGoogleResponse = async (response: any) => {
    console.log('Google response received:', response);
    setIsLoading(true);
    toast.loading('Logging in with Google...', { id: 'google-login' });
    
    try {
      // Get credential from response
      const credential = response?.credential;
      if (!credential) {
        throw new Error('No credential received from Google');
      }
      
      console.log('Got credential from Google');
      
      // Decode the JWT to get user info (client-side only)
      // This doesn't verify the signature but gives us access to the payload
      const base64Url = credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const decodedCredential = JSON.parse(atob(base64));
      
      console.log('Decoded user info:', decodedCredential);
      
      // Send token to our backend
      const authResponse = await googleLogin(credential);
      console.log('Auth response from backend:', authResponse);
      
      // If successful, redirect
      if (authResponse?.access) {
        toast.success('Login successful!', { id: 'google-login' });
        
        // Set user in context or state if needed
        if (authResponse.user) {
          setUser(authResponse.user);
        }
        
        router.push('/profile');
      } else {
        throw new Error('Login failed - no access token received');
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage, { id: 'google-login' });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      toast.loading('Kirish amalga oshirilmoqda...', { id: 'login' });
      
      const response = await login(data);
      
      if (response.user) {
        setUser(response.user);
        toast.success('Muvaffaqiyatli kirildi!', { id: 'login' });
        router.push('/profile');
      } else {
        throw new Error('Foydalanuvchi ma\'lumotlari olinmadi');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      const errorMessage = error.response?.data?.detail || 
                           error.response?.data?.error || 
                           error.message ||
                           'Tizimga kirishda xatolik yuz berdi';
      
      toast.error(errorMessage, { id: 'login' });
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
                  src="/images/logo.svg"
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
              Tizimga kirish
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Yoki{' '}
              <Link href="/register" className="font-medium text-primary hover:text-primary-dark transition-colors">
                yangi hisob yarating
              </Link>
            </p>
          </div>
          
          <div className="mt-8">
            <div className="bg-white dark:bg-gray-800 py-8 px-6 shadow-md rounded-lg">
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Foydalanuvchi nomi
                  </label>
                  <input
                    id="username"
                    type="text"
                    autoComplete="username"
                    {...register('username', {
                      required: 'Foydalanuvchi nomi kiritilishi shart',
                    })}
                    className={`w-full px-3 py-2 border ${errors.username ? 'border-error' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white`}
                    disabled={isLoading}
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-error">{errors.username.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Parol
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      {...register('password', {
                        required: 'Parol kiritilishi shart',
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

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Eslab qolish
                    </label>
                  </div>

                  <div className="text-sm">
                    <Link href="/forgot-password" className="font-medium text-primary hover:text-primary-dark">
                      Parolni unutdingizmi?
                    </Link>
                  </div>
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
                        Kirilmoqda...
                      </>
                    ) : (
                      'Kirish'
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
                      Yoki ijtimoiy tarmoqlar orqali kiring
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-3">
                  <div id="google-signin-button" className="flex justify-center"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 