import React from "react";

const PastQuestionsSkeleton: React.FC = () => (
  <div className="animate-pulse mx-auto max-w-5xl space-y-6 py-6">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="mb-1 flex items-center gap-2">
          <div className="h-8 w-44 rounded bg-bgSurface lg:h-9 lg:w-52" />
          <div className="h-5 w-12 rounded-full bg-bgSurface" />
        </div>
        <div className="h-4 w-64 rounded bg-bgSurface" />
      </div>

      <div className="flex items-center gap-3">
        <div className="h-9 w-32 rounded-full bg-bgSurface" />
        <div className="h-9 w-36 rounded-full bg-bgSurface" />
      </div>
    </div>

    <div className="space-y-4 rounded-2xl bg-bgCard p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((f) => (
          <div key={f} className="space-y-1.5">
            <div className="h-3 w-16 rounded bg-bgSurface" />
            <div className="h-10 w-full rounded-xl bg-bgSurface" />
          </div>
        ))}
      </div>
    </div>

    <div className="flex items-center justify-between">
      <div className="h-4 w-40 rounded bg-bgSurface" />
    </div>

    <div className="space-y-4">
      {[1, 2, 3].map((q) => (
        <div key={q} className="overflow-hidden rounded-2xl bg-bgCard p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-bgSurface" />
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <div className="h-5 w-20 rounded-full bg-bgSurface" />
                <div className="h-4 w-16 rounded bg-bgSurface" />
                <div className="h-4 w-20 rounded bg-bgSurface" />
              </div>
              <div className="space-y-1.5">
                <div className="h-5 w-full rounded bg-bgSurface" />
                <div className="h-5 w-5/6 rounded bg-bgSurface" />
                <div className="h-5 w-2/3 rounded bg-bgSurface" />
              </div>
            </div>
            <div className="h-5 w-5 shrink-0 rounded bg-bgSurface" />
          </div>
        </div>
      ))}
    </div>

    <div className="flex items-center justify-between pt-2">
      <div className="h-10 w-28 rounded-xl bg-bgSurface" />
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((p) => (
          <div key={p} className="h-10 w-10 rounded-xl bg-bgSurface" />
        ))}
      </div>
      <div className="h-10 w-28 rounded-xl bg-bgSurface" />
    </div>
  </div>
);

export default PastQuestionsSkeleton;
