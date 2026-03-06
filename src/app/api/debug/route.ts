import { NextResponse } from "next/server";

export async function GET() {
  const info: Record<string, unknown> = {
    NEXT_PUBLIC_STATIC_DATA: process.env.NEXT_PUBLIC_STATIC_DATA,
    IS_STATIC: process.env.NEXT_PUBLIC_STATIC_DATA === "true",
    NODE_ENV: process.env.NODE_ENV,
    cwd: process.cwd(),
  };

  // Test the data imports
  try {
    const { getVideoProjects } = await import("@/lib/api");
    const videos = await getVideoProjects();
    info.videosOk = true;
    info.videosCount = (videos as unknown[]).length;
  } catch (e: unknown) {
    info.videosOk = false;
    info.videosError = e instanceof Error ? e.message : String(e);
    info.videosStack = e instanceof Error ? e.stack : undefined;
  }

  return NextResponse.json(info);
}
