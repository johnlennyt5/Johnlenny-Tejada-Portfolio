import { ImageResponse } from "next/og";
import { profile } from "@/content";
import { versions, type VersionId } from "@/lib/site";

/*
 * Pre-rendered Open Graph cards, written to out/og/<id>.png at build time.
 * One card for "/" (default) and one per version. Colors follow each version's palette.
 */

export const dynamic = "force-static";
export const dynamicParams = false;

type CardId = VersionId | "default";

const palettes: Record<CardId, { bg: string; fg: string; muted: string; accent: string; label: string }> = {
  default: { bg: "#0B0F0C", fg: "#D6E4D9", muted: "#8A9E90", accent: "#4ADE80", label: "Portfolio" },
  v1: { bg: "#F4F1EA", fg: "#111111", muted: "#5A5650", accent: "#C8261A", label: "The Index" },
  v2: { bg: "#07080C", fg: "#EDEEF3", muted: "#9AA0AE", accent: "#8EA6FF", label: "Launch" },
  v3: { bg: "#0B0F0C", fg: "#D6E4D9", muted: "#8A9E90", accent: "#4ADE80", label: "The Robot Room" },
  v4: { bg: "#FBF5EC", fg: "#2B1D14", muted: "#6B5646", accent: "#A9481F", label: "Providence, Built by Hand" },
};

export function generateStaticParams(): { file: string }[] {
  return (["default", ...versions.map((v) => v.id)] as CardId[]).map((id) => ({ file: `${id}.png` }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const id = file.replace(/\.png$/, "") as CardId;
  const p = palettes[id] ?? palettes.default;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: p.bg,
          color: p.fg,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <svg width="96" height="96" viewBox="0 0 100 100">
            <path d="M18 22 H82" stroke={p.fg} strokeWidth="12" fill="none" />
            <path
              d="M50 22 V60 C50 75 42 83 31 83 C24 83 19 79 17 73"
              stroke={p.accent}
              strokeWidth="12"
              fill="none"
            />
          </svg>
          <div style={{ display: "flex", fontSize: 28, color: p.muted, letterSpacing: 2, textTransform: "uppercase" }}>
            {p.label}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 92, fontWeight: 800, lineHeight: 1.02 }}>{profile.name}</div>
          <div style={{ display: "flex", fontSize: 44, marginTop: 20, color: p.accent }}>{profile.headline}</div>
          <div style={{ display: "flex", fontSize: 27, marginTop: 16, color: p.muted }}>{profile.subhead}</div>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: p.muted }}>{profile.location.label}</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
