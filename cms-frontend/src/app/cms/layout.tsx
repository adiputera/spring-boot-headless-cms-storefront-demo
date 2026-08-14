'use client';

import Link from 'next/link';
import { useState } from 'react';
import StorefrontHeaderLink from '@/components/cms/StorefrontHeaderLink';
import ApiUrlInitializer from '@/components/ApiUrlInitializer';

export default function CMSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex flex-col">
      {/* Initialize API URL at runtime */}
      <ApiUrlInitializer />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Hamburger Button */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="md:hidden p-2 -ml-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none transition-colors"
                aria-label="Open Sidebar"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Link href="/cms" className="text-2xl font-bold text-gray-900 font-sans tracking-tight">
                CMS Admin
              </Link>
            </div>
            <nav className="flex gap-6">
              <StorefrontHeaderLink />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="container mx-auto px-4 py-6 flex-1 flex flex-col md:flex-row gap-8 relative">
        {/* Backdrop for Mobile Sidebar Drawer */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/45 z-30 md:hidden transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed md:sticky inset-y-0 left-0 z-40 w-64 bg-white md:bg-transparent shadow-xl md:shadow-none p-4 md:p-0 transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 transition-transform duration-300 ease-in-out md:flex-shrink-0 flex flex-col h-full md:h-auto md:top-24`}
          style={{ maxHeight: 'calc(100vh - 6rem)' }}
        >
          {/* Mobile Sidebar Close Header */}
          <div className="flex justify-between items-center mb-6 md:hidden border-b pb-3">
            <span className="font-bold text-gray-900 font-sans">Navigation</span>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Close Sidebar"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="bg-white rounded-xl border border-gray-150 md:shadow-sm p-4 flex-1 md:flex-none">
            <ul className="space-y-1.5">
              <li>
                <Link
                  href="/cms"
                  onClick={() => setIsSidebarOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all font-sans"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/cms/pages"
                  onClick={() => setIsSidebarOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all font-sans"
                >
                  Pages
                </Link>
              </li>
              <li>
                <Link
                  href="/cms/products"
                  onClick={() => setIsSidebarOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all font-sans"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  href="/cms/articles"
                  onClick={() => setIsSidebarOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all font-sans"
                >
                  Articles
                </Link>
              </li>
              <li>
                <Link
                  href="/cms/models"
                  onClick={() => setIsSidebarOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all font-sans"
                >
                  All Models
                </Link>
              </li>
              <li>
                <Link
                  href="/cms/sync-catalogs"
                  onClick={() => setIsSidebarOpen(false)}
                  className="block px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all font-sans"
                >
                  Sync Catalogs
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-gray-150 shadow-sm p-4 sm:p-6 min-h-[400px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

