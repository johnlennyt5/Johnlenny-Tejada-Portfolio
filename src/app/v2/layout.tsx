import type { ReactNode } from "react";
import { V2Shell } from "@/components/v2/Shell";

export default function V2Layout({ children }: { children: ReactNode }) {
  return <V2Shell>{children}</V2Shell>;
}
