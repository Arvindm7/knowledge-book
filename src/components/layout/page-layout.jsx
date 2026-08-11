'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Navbar } from './navbar';
import { Sidebar } from './sidebar';
import { MobileSidebar } from './mobile-sidebar';
import { Footer } from './footer';
import { ResizeHandle, useResizableWidth } from './resize-handle';

const LEFT_SIDEBAR_DEFAULT = 256; // 16rem = w-64
const LEFT_SIDEBAR_MIN = 200;
const LEFT_SIDEBAR_MAX = 420;

/**
 * PageLayout — composition root for the application shell.
 *
 * Arranges Navbar, MobileSidebar, desktop Sidebar, main content area,
 * and Footer into a cohesive responsive layout.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Page content.
 * @param {boolean} [props.showSidebar=true] - Whether to show the sidebar.
 * @param {Array} [props.navItems] - Navigation tree for sidebar.
 * @param {string} [props.className] - Additional CSS for main content.
 * @returns {React.ReactElement}
 */
export function PageLayout({ children, showSidebar = true, navItems, className }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useResizableWidth(
    LEFT_SIDEBAR_DEFAULT,
    'docs-sidebar-width'
  );

  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar onMobileMenuToggle={() => setMobileMenuOpen(true)} />

      {/* Mobile sidebar (Sheet) */}
      <MobileSidebar open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} navItems={navItems} />

      <div className="flex flex-1">
        {showSidebar && (
          <>
            <Sidebar navItems={navItems} style={{ width: sidebarWidth }} />
            <ResizeHandle
              side="left"
              defaultWidth={LEFT_SIDEBAR_DEFAULT}
              minWidth={LEFT_SIDEBAR_MIN}
              maxWidth={LEFT_SIDEBAR_MAX}
              storageKey="docs-sidebar-width"
              onResize={setSidebarWidth}
            />
          </>
        )}

        <main
          className={cn(
            'flex-1 min-w-0 px-4 py-8 sm:px-6 lg:px-8',
            showSidebar && 'lg:pl-6',
            className
          )}
        >
          <div className="mx-auto max-w-4xl">{children}</div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
