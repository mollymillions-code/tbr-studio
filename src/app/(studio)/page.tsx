import { getStats } from "@/lib/api";
import {
  Film,
  Image,
  AudioLines,
  BookOpen,
  Send,
  Video,
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

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">TBR Studio</h1>
        <p className="text-tbr-gray text-sm mt-1">
          Content studio for Team Blue Rising. E1 World Championship.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
        {statCards.map((card) => (
          <Link
            key={card.key}
            href={card.href}
            className="bg-tbr-card border border-tbr-border rounded-lg p-4 hover:border-tbr-blue/40 transition-colors"
          >
            <card.icon size={18} className={card.color} />
            <div className="text-2xl font-bold mt-2">
              {stats[card.key]}
            </div>
            <div className="text-xs text-tbr-gray mt-0.5">{card.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/storyboard"
          className="bg-tbr-card border border-tbr-border rounded-lg p-5 hover:border-purple-500/40 transition-colors group"
        >
          <BookOpen
            size={24}
            className="text-purple-400 mb-3 group-hover:scale-110 transition-transform"
          />
          <div className="font-semibold text-sm">Create Storyboard</div>
          <p className="text-xs text-tbr-gray mt-1">
            Write a storyline with AI assistance. Control the AI intensity with
            a slider from 0 to 10.
          </p>
        </Link>

        <Link
          href="/posts"
          className="bg-tbr-card border border-tbr-border rounded-lg p-5 hover:border-pink-500/40 transition-colors group"
        >
          <Send
            size={24}
            className="text-pink-400 mb-3 group-hover:scale-110 transition-transform"
          />
          <div className="font-semibold text-sm">Generate Posts</div>
          <p className="text-xs text-tbr-gray mt-1">
            Create carousels, image posts, stories. Publish via Postiz to all
            connected accounts.
          </p>
        </Link>

        <Link
          href="/videos"
          className="bg-tbr-card border border-tbr-border rounded-lg p-5 hover:border-cyan-500/40 transition-colors group"
        >
          <Video
            size={24}
            className="text-cyan-400 mb-3 group-hover:scale-110 transition-transform"
          />
          <div className="font-semibold text-sm">Short Videos</div>
          <p className="text-xs text-tbr-gray mt-1">
            Assemble race clips, narrations, and graphics into short-form video
            using Remotion.
          </p>
        </Link>
      </div>
    </div>
  );
}
