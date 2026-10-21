import type { ReactNode } from "react";
import { V3Shell } from "@/components/v3/Shell";

export default function V3Layout({ children }: { children: ReactNode }) {
  return <V3Shell>{children}</V3Shell>;
}
