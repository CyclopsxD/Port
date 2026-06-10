import React from "react";

interface ProjectSkeletonProps {
  layoutMode: "grid" | "list";
  key?: React.Key;
}

export default function ProjectSkeleton({ layoutMode }: ProjectSkeletonProps) {
  if (layoutMode === "list") {
    return (
      <div className="w-full bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 animate-pulse select-none">
        <div className="w-full md:w-48 h-32 bg-slate-800 rounded-xl flex-shrink-0" />
        <div className="flex-1 w-full space-y-4 text-left">
          <div className="h-4 bg-slate-800 rounded w-1/3" />
          <div className="h-3 bg-slate-800 rounded w-full" />
          <div className="h-3 bg-slate-800 rounded w-2/3" />
          <div className="flex gap-2 pt-2">
            <div className="h-6 w-16 bg-slate-800 rounded-full" />
            <div className="h-6 w-16 bg-slate-800 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 space-y-4 animate-pulse select-none">
      <div className="aspect-video w-full bg-slate-800 rounded-xl" />
      <div className="space-y-3">
        <div className="h-4 bg-slate-800 rounded w-2/3" />
        <div className="h-3 bg-slate-800 rounded w-full" />
        <div className="h-3 bg-slate-800 rounded w-5/6" />
        <div className="flex gap-2 pt-2">
          <div className="h-6 w-12 bg-slate-800 rounded-full" />
          <div className="h-6 w-12 bg-slate-800 rounded-full" />
        </div>
      </div>
    </div>
  );
}
