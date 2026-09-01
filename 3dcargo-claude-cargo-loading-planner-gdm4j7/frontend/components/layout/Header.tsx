"use client";

import { ArrowLeft, Package } from "lucide-react";

import { DemoButton } from "@/components/DemoButton";
import { ExportMenu } from "@/components/export/ExportMenu";
import { ProjectControls } from "@/components/export/ProjectControls";
import { ProjectNameInput } from "@/components/layout/ProjectNameInput";

const HUB_URL = process.env.NEXT_PUBLIC_HUB_URL || "/";

export function Header() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4">
      <div className="flex items-center gap-2">
        <a
          href={HUB_URL}
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
