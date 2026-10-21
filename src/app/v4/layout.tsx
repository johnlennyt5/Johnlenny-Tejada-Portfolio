import type { ReactNode } from "react";
import { V4Shell } from "@/components/v4/Shell";

export default function V4Layout({ children }: { children: ReactNode }) {
  return <V4Shell>{children}</V4Shell>;
}
