"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { profile } from "@/content/profile";

/** Built in the browser only, so the address never appears in the static HTML. */
function assembleEmail(): string {
  const { user, domain } = profile.emailParts;
  return [user, domain.join(".")].join("@");
}

export interface CopyEmailProps {
  /** Button text before copying. */
  label?: ReactNode;
  /** Button text right after a successful copy. */
  copiedLabel?: ReactNode;
  className?: string;
  /** Show the address next to the button once the page has loaded (still never in the HTML). */
  showAddress?: boolean;
  addressClassName?: string;
}

/**
 * Click to copy the email address. Announces the result through a polite live region.
 * If the clipboard is blocked, the address is revealed so it can be copied by hand.
 */
export function CopyEmail({
  label = "Copy email",
  copiedLabel = "Copied",
  className,
  showAddress = false,
  addressClassName,
}: CopyEmailProps) {
  const [state, setState] = useState<"idle" | "copied" | "manual">("idle");
  const [address, setAddress] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (showAddress) setAddress(assembleEmail());
    return () => window.clearTimeout(timer.current);
  }, [showAddress]);

  async function copy() {
    const email = assembleEmail();
    window.clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(email);
      setState("copied");
      setMessage(`Email address copied: ${email}`);
      timer.current = window.setTimeout(() => {
        setState("idle");
        setMessage("");
      }, 2500);
    } catch {
      setAddress(email);
      setState("manual");
      setMessage(`Copy is blocked in this browser. The address is ${email}`);
    }
  }

  return (
    <span className="jt-copy-email" data-state={state}>
      <button type="button" onClick={copy} className={className}>
        {state === "copied" ? copiedLabel : label}
      </button>
      {address ? (
        <span className={addressClassName ?? "jt-copy-email-address"} data-email="">
          {address}
        </span>
      ) : null}
      <span role="status" aria-live="polite" className="jt-sr-only">
        {message}
      </span>
    </span>
  );
}
