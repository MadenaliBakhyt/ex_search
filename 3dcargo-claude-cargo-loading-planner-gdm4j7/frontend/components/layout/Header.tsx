"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Package } from "lucide-react";

import { DemoButton } from "@/components/DemoButton";
import { ExportMenu } from "@/components/export/ExportMenu";
import { ProjectControls } from "@/components/export/ProjectControls";
import { ProjectNameInput } from "@/components/layout/ProjectNameInput";

// Build-time override, if set. Otherwise resolved on the client (after
// mount, to avoid an SSR/client markup mismatch) to the same host this page
// was opened from, on the standard EXIM Search port -- so it works whether
// opened via localhost, the server's IP, or a domain.
function useHubUrl() {
  const [hubUrl, setHubUrl] = useState(process.env.NEXT_PUBLIC_HUB_URL || "/");
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_HUB_URL) {
      setHubUrl(`${window.location.protocol}//${window.location.hostname}:8080`);
    }
  }, []);
  return hubUrl;
}

export function Header() {
  const hubUrl = useHubUrl();
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-2">
        <a
          href={hubUrl}
          className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          title="Back to EXIM Search"
        >
          <ArrowLeft className="h-4 w-4" />
          EXIM Search
        </a>
        <div className="mx-1 h-5 w-px shrink-0 bg-border" />
        <Package className="h-5 w-5 shrink-0 text-primary" />
        <span className="shrink-0 font-semibold tracking-tight">Cargo Loading Planner</span>
        <div className="mx-1 h-5 w-px shrink-0 bg-border" />
        <ProjectNameInput />
      </div>
      <div className="flex items-center gap-2">
        <DemoButton />
        <div className="mx-1 h-5 w-px bg-border" />
        <ProjectControls />
        <div className="mx-1 h-5 w-px bg-border" />
        <ExportMenu />
      </div>
    </header>
  );
}
