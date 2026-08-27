import React from "react";

const PastQuestionsSkeleton: React.FC = () => (
  <div className="mx-auto max-w-5xl space-y-6 py-6">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="mb-1 flex items-center gap-2">
          <div className="bg-bgSurface skeleton-shimmer h-8 w-44 rounded lg:h-9 lg:w-52" />
          <div className="bg-bgSurface skeleton-shimmer h-5 w-12 rounded-full" />
        </div>
        <div className="bg-bgSurface skeleton-shimmer h-4 w-64 rounded" />
      </div>

      <div className="flex items-center gap-3">
        <div className="bg-bgSurface skeleton-shimmer h-9 w-32 rounded-full" />
        <div className="bg-bgSurface skeleton-shimmer h-9 w-36 rounded-full" />
      </div>
    </div>

    <div className="bg-bgCard space-y-4 rounded-2xl p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((f) => (
          <div key={f} className="space-y-1.5">
            <div className="bg-bgSurface skeleton-shimmer h-3 w-16 rounded" />
            <div className="bg-bgSurface skeleton-shimmer h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>

    <div className="flex items-center justify-between">
      <div className="bg-bgSurface skeleton-shimmer h-4 w-40 rounded" />
    </div>

    <div className="space-y-4">
      {[1, 2, 3].map((q) => (
        <div key={q} className="bg-bgCard overflow-hidden rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="bg-bgSurface skeleton-shimmer flex h-10 w-10 shrink-0 items-center justify-center rounded-full" />
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <div className="bg-bgSurface skeleton-shimmer h-5 w-20 rounded-full" />
                <div className="bg-bgSurface skeleton-shimmer h-4 w-16 rounded" />
                <div className="bg-bgSurface skeleton-shimmer h-4 w-20 rounded" />
              </div>
              <div className="space-y-1.5">
                <div className="bg-bgSurface skeleton-shimmer h-5 w-full rounded" />
                <div className="bg-bgSurface skeleton-shimmer h-5 w-5/6 rounded" />
                <div className="bg-bgSurface skeleton-shimmer h-5 w-2/3 rounded" />
              </div>
            </div>
            <div className="bg-bgSurface skeleton-shimmer h-5 w-5 shrink-0 rounded" />
          </div>
        </div>
      ))}
    </div>

    <div className="flex items-center justify-between pt-2">
      <div className="bg-bgSurface skeleton-shimmer h-10 w-28 rounded-xl" />
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((p) => (
          <div key={p} className="bg-bgSurface skeleton-shimmer h-10 w-10 rounded-xl" />
        ))}
      </div>
      <div className="bg-bgSurface skeleton-shimmer h-10 w-28 rounded-xl" />
    </div>
  </div>
);

export default PastQuestionsSkeleton;
