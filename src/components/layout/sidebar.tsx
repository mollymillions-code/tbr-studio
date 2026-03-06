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
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sections = [
  {
    label: "Overview",
    items: [
      { href: "/", icon: LayoutDashboard, label: "Dashboard" },
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
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-tbr-dark border-r border-tbr-border flex flex-col transition-transform duration-200",
          "lg:translate-x-0 lg:static lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-tbr-border">
          <Link href="/" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="w-8 h-8 rounded-lg bg-tbr-blue flex items-center justify-center text-white font-bold text-sm">
              TBR
            </div>
            <div>
              <div className="text-sm font-semibold text-tbr-white leading-tight">
                TBR Studio
              </div>
              <div className="text-[10px] text-tbr-gray leading-tight">
                Team Blue Rising
              </div>
            </div>
          </Link>
          <button onClick={onClose} className="lg:hidden text-tbr-gray hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {sections.map((section) => (
            <div key={section.label} className="mb-5">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-tbr-gray px-2 mb-2">
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
                      "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors mb-0.5",
                      isActive
                        ? "bg-tbr-blue/15 text-tbr-blue-light font-medium"
                        : "text-tbr-gray hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-tbr-border">
          <div className="text-[10px] text-tbr-gray">
            E1 World Championship
          </div>
          <div className="text-[10px] text-tbr-gray/60">
            Electric Powerboat Racing
          </div>
        </div>
      </aside>
    </>
  );
}
