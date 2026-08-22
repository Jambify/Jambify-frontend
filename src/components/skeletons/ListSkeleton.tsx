import React from "react";

const ListSkeleton: React.FC = () => (
  <div className="animate-pulse mx-auto max-w-5xl py-6 md:px-8">
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div className="space-y-2">
        <div className="h-9 w-40 rounded bg-bgSurface" />
        <div className="h-4 w-56 rounded bg-bgSurface" />
      </div>
      <div className="flex gap-2">
        <div className="h-10 w-32 rounded-lg border bg-bgSurface" />
        <div className="h-10 w-28 rounded-lg border bg-bgSurface" />
      </div>
    </div>

    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className="rounded-2xl border border-borderMuted bg-bgCard p-5 shadow-sm"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4 flex-1">
              <div className="h-14 w-14 shrink-0 rounded-xl bg-bgSurface" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-5 w-56 rounded bg-bgSurface" />
                <div className="flex gap-2 flex-wrap">
                  {[1, 2, 3].map((t) => (
                    <div
                      key={t}
                      className="h-5 w-20 rounded-full bg-bgSurface"
                    />
                  ))}
                </div>
                <div className="h-3 w-40 rounded bg-bgSurface" />
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <div className="h-7 w-20 rounded-full bg-bgSurface" />
              <div className="h-8 w-24 rounded-lg bg-bgSurface" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ListSkeleton;
