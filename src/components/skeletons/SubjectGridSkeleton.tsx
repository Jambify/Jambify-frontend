import React from "react";

const SubjectGridSkeleton: React.FC = () => (
  <div className="animate-pulse mx-auto max-w-5xl py-6 md:px-8">
    <div className="mb-8 space-y-2">
      <div className="h-9 w-48 rounded bg-bgSurface" />
      <div className="h-4 w-64 rounded bg-bgSurface" />
    </div>

    <div className="mb-6 flex items-center gap-2">
      <div className="h-11 flex-1 rounded-full border bg-bgSurface" />
      <div className="h-11 w-24 rounded-full border bg-bgSurface" />
    </div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((s) => (
        <div
          key={s}
          className="rounded-2xl border border-borderMuted bg-bgCard p-6 shadow-sm"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-bgSurface" />
            <div className="space-y-1">
              <div className="h-5 w-28 rounded bg-bgSurface" />
              <div className="h-3 w-20 rounded bg-bgSurface" />
            </div>
          </div>

          <div className="mb-4 h-2 w-full rounded-full bg-bgSurface">
            <div
              className="h-full rounded-full bg-bgCard"
              style={{ width: `${30 + s * 8}%` }}
            />
          </div>
          <div className="mb-5 flex justify-between">
            <div className="h-3 w-16 rounded bg-bgSurface" />
            <div className="h-3 w-10 rounded bg-bgSurface" />
          </div>

          <div className="h-11 w-full rounded-xl bg-bgSurface" />
        </div>
      ))}
    </div>
  </div>
);

export default SubjectGridSkeleton;
