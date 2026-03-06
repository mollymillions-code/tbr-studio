import { getStats } from "@/lib/api";
import {
  Film,
  Image,
  AudioLines,
  BookOpen,
  Send,
  Video,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const statCards = [
  { key: "videoFiles", label: "Video Clips", icon: Film, href: "/library?type=video", color: "text-blue-400" },
  { key: "photoFiles", label: "Photos", icon: Image, href: "/library?type=photo", color: "text-emerald-400" },
  { key: "audioFiles", label: "Audio Files", icon: AudioLines, href: "/library?type=audio", color: "text-amber-400" },
  { key: "storyboardCount", label: "Storyboards", icon: BookOpen, href: "/storyboard", color: "text-purple-400" },
  { key: "postCount", label: "Posts", icon: Send, href: "/posts", color: "text-pink-400" },
  { key: "videoCount", label: "Video Projects", icon: Video, href: "/videos", color: "text-cyan-400" },
] as const;

const actions = [
  {
    href: "/storyboard",
    icon: BookOpen,
    label: "Create Storyboard",
    desc: "Write a storyline with AI assistance. Control the AI intensity with a slider from 0 to 10.",
    accent: "from-purple-500/20 to-purple-500/0",
    iconColor: "text-purple-400",
    borderHover: "hover:border-purple-500/20",
  },
  {
    href: "/posts",
    icon: Send,
    label: "Generate Posts",
    desc: "Create carousels, image posts, stories. Publish via Postiz to all connected accounts.",
    accent: "from-pink-500/20 to-pink-500/0",
    iconColor: "text-pink-400",
    borderHover: "hover:border-pink-500/20",
  },
  {
    href: "/videos",
    icon: Video,
    label: "Short Videos",
    desc: "Assemble race clips, narrations, and graphics into short-form video using Remotion.",
    accent: "from-cyan-500/20 to-cyan-500/0",
    iconColor: "text-cyan-400",
    borderHover: "hover:border-cyan-500/20",
  },
];

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="p-8 lg:p-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-px w-8 bg-tbr-blue" />
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-tbr-blue-light">
            Content Studio
          </span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
          TBR Studio
        </h1>
        <p className="text-tbr-gray text-sm mt-2 max-w-md">
          Team Blue Rising. E1 World Championship. Electric powerboat racing.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-14">
        {statCards.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className="glass-card rounded-xl p-5 group"
          >
            <card.icon
              size={16}
              className={`${card.color} opacity-70 group-hover:opacity-100 transition-opacity`}
            />
            <div className="text-2xl font-bold mt-3 tracking-tight">
              {stats[card.key]}
            </div>
            <div className="text-[11px] text-tbr-gray mt-1">{card.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px w-6 bg-tbr-gray-muted" />
          <h2 className="text-[11px] font-medium uppercase tracking-[0.2em] text-tbr-gray-muted">
            Quick Actions
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`glass-card rounded-xl p-6 group relative overflow-hidden ${action.borderHover}`}
            >
              {/* Subtle gradient accent */}
              <div
                className={`absolute top-0 left-0 right-0 h-24 bg-gradient-to-b ${action.accent} pointer-events-none`}
              />
              <div className="relative">
                <div className={`w-10 h-10 rounded-lg bg-tbr-surface flex items-center justify-center mb-4 ${action.iconColor} group-hover:scale-105 transition-transform`}>
                  <action.icon size={20} />
                </div>
                <div className="font-semibold text-sm tracking-tight mb-1.5">
                  {action.label}
                </div>
                <p className="text-xs text-tbr-gray leading-relaxed">
                  {action.desc}
                </p>
                <div className="flex items-center gap-1.5 mt-4 text-[11px] text-tbr-gray-muted group-hover:text-tbr-blue-light transition-colors">
                  <span>Open</span>
                  <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
