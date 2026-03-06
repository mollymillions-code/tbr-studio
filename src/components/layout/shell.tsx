"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./sidebar";

export function Shell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar — mobile only */}
        <header className="lg:hidden flex items-center gap-3 px-5 py-4 border-b border-tbr-border bg-tbr-dark/80 backdrop-blur-xl">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-tbr-gray hover:text-white transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="text-sm font-semibold tracking-tight">TBR Studio</div>
        </header>

        <main className="flex-1 overflow-y-auto bg-tbr-navy">{children}</main>
      </div>
    </div>
  );
}
