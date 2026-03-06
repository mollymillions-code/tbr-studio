"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Film,
  Image,
  AudioLines,
  BookOpen,
  Send,
  Video,
  LayoutDashboard,
  FolderOpen,
  Calendar,
  Tv,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sections = [
  {
    label: "Overview",
    items: [
      { href: "/", icon: LayoutDashboard, label: "Dashboard" },
      { href: "/episodes", icon: Tv, label: "Episodes" },
      { href: "/calendar", icon: Calendar, label: "Season Calendar" },
    ],
  },
  {
    label: "Media Library",
    items: [
      { href: "/library?type=video", icon: Film, label: "Videos" },
      { href: "/library?type=photo", icon: Image, label: "Photos" },
      { href: "/library?type=audio", icon: AudioLines, label: "Audio" },
      { href: "/library", icon: FolderOpen, label: "All Media" },
    ],
  },
  {
    label: "Create",
    items: [
      { href: "/storyboard", icon: BookOpen, label: "Storyboard" },
      { href: "/posts", icon: Send, label: "Generate Posts" },
      { href: "/videos", icon: Video, label: "Short Videos" },
    ],
  },
];

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-[260px] flex flex-col transition-transform duration-200",
          "bg-tbr-dark/80 backdrop-blur-xl border-r border-tbr-border",
          "lg:translate-x-0 lg:static lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo area */}
        <div className="flex items-center justify-between px-6 py-6">
          <Link href="/" className="flex items-center gap-3" onClick={onClose}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-tbr-blue to-tbr-blue-light flex items-center justify-center text-white font-bold text-xs tracking-wider glow-blue">
              TBR
            </div>
            <div>
              <div className="text-sm font-semibold text-tbr-white leading-tight tracking-tight">
                TBR Studio
              </div>
              <div className="text-[10px] text-tbr-gray leading-tight mt-0.5">
                Team Blue Rising
              </div>
            </div>
          </Link>
          <button onClick={onClose} className="lg:hidden text-tbr-gray hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-5 h-px bg-gradient-to-r from-transparent via-tbr-border-hover to-transparent" />

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-5 px-4">
          {sections.map((section) => (
            <div key={section.label} className="mb-6">
              <div className="text-[10px] font-medium uppercase tracking-[0.15em] text-tbr-gray-muted px-3 mb-2.5">
                {section.label}
              </div>
              {section.items.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href.split("?")[0]);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all duration-200 mb-0.5",
                      isActive
                        ? "bg-tbr-blue-glow text-tbr-blue-light font-medium"
                        : "text-tbr-gray hover:text-tbr-white hover:bg-tbr-surface"
                    )}
                  >
                    <item.icon size={16} strokeWidth={isActive ? 2 : 1.5} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="mx-5 h-px bg-gradient-to-r from-transparent via-tbr-border-hover to-transparent" />
        <div className="px-6 py-5">
          <div className="text-[10px] text-tbr-gray-muted tracking-wide">
            E1 World Championship
          </div>
          <div className="text-[10px] text-tbr-gray-muted/50 mt-0.5">
            Electric Powerboat Racing
          </div>
        </div>
      </aside>
    </>
  );
}
