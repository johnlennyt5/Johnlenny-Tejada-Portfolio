import type { ReactNode } from "react";
import { V1Shell } from "@/components/v1/Shell";

export default function V1Layout({ children }: { children: ReactNode }) {
  return <V1Shell>{children}</V1Shell>;
}
