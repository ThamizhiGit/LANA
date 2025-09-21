import type { Metadata } from 'next'
import './globals.css'
import Analytics from '../components/Analytics'
import TRPCProvider from '../components/TRPCProvider'

export const metadata: Metadata = {
  title: 'Lana - Logical Automation. Networked Analytics.',
  description: 'Advanced CRM with AI-powered insights and automation',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <TRPCProvider>
          <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <a href="/" className="text-xl font-bold text-blue-600">
                      Lana
                    </a>
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    <a
                      href="/"
                      className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                      Dashboard
                    </a>
                    <a
                      href="/customers"
                      className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                      Customers
                    </a>
                    <a
                      href="/projects"
                      className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                      Projects
                    </a>
                    <a
                      href="/analytics"
                      className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                      Analytics
                    </a>
                    <a
                      href="/test-automation"
                      className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    >
                      🧪 Test Automation
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </nav>
          <Analytics />
          {children}
        </TRPCProvider>
      </body>
    </html>
  )
}