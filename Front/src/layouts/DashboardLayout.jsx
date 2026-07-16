import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import { Menu } from 'lucide-react'

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile-only header for sidebar toggle */}
        <div className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center shadow-sm z-20 relative">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none"
          >
            <Menu size={24} />
          </button>
          <span className="ml-3 font-semibold text-gray-800">Inventarios Z</span>
        </div>
        
        <main className="flex-1 bg-gray-50 flex flex-col overflow-hidden relative">
          <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
            <div className={`
              max-w-7xl mx-auto w-full pb-8
              px-4 sm:px-6 md:px-8
              [&>div>div:first-child]:sticky 
              [&>div>div:first-child]:top-0 
              [&>div>div:first-child]:z-50 
              [&>div>div:first-child]:bg-gray-50 
              [&>div>div:first-child]:pt-4 
              md:[&>div>div:first-child]:pt-6 
              [&>div>div:first-child]:pb-4 
              [&>div>div:first-child]:!mb-6 
              [&>div>div:first-child]:-mx-4 
              [&>div>div:first-child]:px-4 
              sm:[&>div>div:first-child]:-mx-6 
              sm:[&>div>div:first-child]:px-6 
              md:[&>div>div:first-child]:-mx-8 
              md:[&>div>div:first-child]:px-8
            `.replace(/\s+/g, ' ').trim()}>
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
