'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MainLayout from '@/components/layouts/MainLayout';

export default function Home() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative">
        {/* Background image */}
        <div className="absolute inset-0 -z-10">
          <div className="relative h-full w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#4CAF50]/80 to-[#388E3C]/80 mix-blend-multiply" />
            <div className="absolute inset-0 bg-[#4CAF50]/50" /> {/* Fallback background color */}
            <Image
              src="/images/hero-bg.jpg"
              alt="Construction workers"
              fill
              priority
              className="object-cover"
              quality={90}
              onError={(e) => {
                // Hide broken image on error
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-display mb-6">
              Qurilish va ta'mirlash xizmatlarini birlashtiruvchi platforma
            </h1>
            <p className="text-xl text-white mb-8 opacity-90">
              Dwella orqali malakali ustalarni toping yoki o'z xizmatlaringizni taklif qiling
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register?role=client" className="bg-primary text-white font-medium py-3 px-8 rounded-md text-lg hover:bg-[#388E3C] transition duration-300">
                Mijoz sifatida boshlash
              </Link>
              <Link href="/register?role=master" className="bg-white text-[#4CAF50] hover:bg-gray-100 transition duration-300 px-8 py-3 rounded-md text-lg font-medium text-center">
                Usta sifatida boshlash
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-display">
              Dwella nima uchun kerak?
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Qurilish va ta'mirlash xizmatlarini topish va taklif qilish uchun eng yaxshi platforma
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-card-hover">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Ishonchli ustalarni toping</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Reyting va sharhlar asosida o'zingizga mos keladigan eng yaxshi ustalarni tanlang.
              </p>
              <Link href="/masters" className="text-primary font-medium hover:text-primary-dark transition-colors">
                Ustalarni ko'rish →
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="card p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-card-hover">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">E'lonlar joylashtiring</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Qurilish yoki ta'mirlash ishlaringiz uchun e'lon bering va ustalardan takliflar oling.
              </p>
              <Link href="/announcements" className="text-primary font-medium hover:text-primary-dark transition-colors">
                E'lonlarni ko'rish →
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="card p-6 transition-transform duration-300 hover:-translate-y-1 hover:shadow-card-hover">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Real vaqtda suhbatlashing</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Ustalar bilan to'g'ridan-to'g'ri bog'laning, narxlarni muhokama qiling va ishlaringizni rejalashtiring.
              </p>
              <Link href="/chat" className="text-primary font-medium hover:text-primary-dark transition-colors">
                Chatni ko'rish →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-display">
              Dwella qanday ishlaydi?
            </h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Qurilish va ta'mirlash xizmatlarini osongina toping yoki taklif qiling
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Ro'yxatdan o'ting</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Mijoz yoki usta sifatida tizimga kiring va profilingizni to'ldiring
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">E'lon joylashtiring</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Mijoz sifatida o'z e'loningizni joylashtiring yoki usta sifatida e'lonlarni toping
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Bog'laning</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Chat orqali malakali ustalar bilan bog'laning va shartnoma tuzishni muhokama qiling
              </p>
            </div>

            {/* Step 4 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                4
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Baholang</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Ishlar yakunlangach, ustalarni baholang va boshqalarga yordamlashing
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white font-display mb-6">
            Hoziroq Dwella platformasiga qo'shiling
          </h2>
          <p className="text-xl text-white opacity-90 mb-8 max-w-3xl mx-auto">
            Mijoz sifatida o'z ehtiyojlaringiz uchun eng yaxshi ustalarni toping yoki usta sifatida yangi mijozlar bilan ishlang
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-white text-primary hover:bg-gray-100 transition duration-300 px-8 py-3 rounded-md text-lg font-medium text-center">
              Hozir ro'yxatdan o'ting
            </Link>
            <Link href="/about" className="border border-white text-white hover:bg-white/10 transition duration-300 px-8 py-3 rounded-md text-lg font-medium text-center">
              Ko'proq ma'lumot
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
