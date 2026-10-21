import type { ReactNode } from "react";
import { profile } from "@/content";

export interface ResumeButtonProps {
  className?: string;
  children?: ReactNode;
  /** "download" saves the PDF; "open" opens it in the browser. Default "download". */
  mode?: "download" | "open";
}

/** Link to the public resume PDF. A plain anchor, so it works without JavaScript. */
export function ResumeButton({ className, children, mode = "download" }: ResumeButtonProps) {
  const label = children ?? (mode === "download" ? "Download resume (PDF)" : "Resume (PDF)");
  return (
    <a
      href={profile.resume.href}
      className={className ?? "jt-resume-button"}
      download={mode === "download" ? profile.resume.fileName : undefined}
      type="application/pdf"
    >
      {label}
    </a>
  );
}
