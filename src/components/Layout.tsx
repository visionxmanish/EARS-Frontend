import React, { useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './sidebar';
// import { SmoothCursor } from '../ui/smooth-cursor';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* <SmoothCursor /> */}
      
      {/* Sidebar - Fixed position */}
      <Sidebar 
        onCollapseChange={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onMobileOpenChange={setIsMobileSidebarOpen}
      />
      
      {/* Main Content Area - With margin to account for fixed sidebar */}
      <div className={`transition-all duration-300 ease-in-out flex flex-col h-full ${
        // Mobile: no margin (sidebar is overlay)
        // Desktop: margin based on collapsed state  
        isSidebarCollapsed 
          ? 'ml-0 md:ml-16' 
          : 'ml-0 md:ml-64'
      }`}>
        {/* Header - Sticky at top */}
        <Header onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
        
        {/* Main Content - Flexible to fill available space with scrolling */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </div>
          
          {/* Footer - Always pushed to bottom, never scrolls */}
          <Footer />
        </main>
      </div>
    </div>
  );
}
