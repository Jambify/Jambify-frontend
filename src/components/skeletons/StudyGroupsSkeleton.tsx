import React from "react";

const StudyGroupsSkeleton: React.FC = () => (
  <div className="animate-pulse py-6 md:px-8">
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="space-y-2">
        <div className="h-8 w-44 rounded bg-bgSurface" />
        <div className="h-4 w-72 rounded bg-bgSurface" />
      </div>
      <div className="h-10 w-32 rounded-xl bg-bgSurface" />
    </div>

    <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="rounded-lg border border-borderMuted bg-bgCard p-4">
        <div className="mb-2 h-3 w-24 rounded bg-bgSurface" />
        <div className="flex gap-2">
          <div className="h-9 flex-1 rounded-lg border bg-bgSurface" />
          <div className="h-9 w-16 rounded-lg bg-bgSurface" />
        </div>
      </div>
      <div className="rounded-lg flex flex-col justify-end border border-borderMuted bg-bgCard p-4">
        <div className="mb-2 h-3 w-32 rounded bg-bgSurface" />
        <div className="h-9 w-full rounded-lg border bg-bgSurface" />
      </div>
    </div>

    <div className="mb-4 flex w-fit gap-1 rounded-lg border border-borderMuted bg-bgSurface p-1">
      {[1, 2].map((t) => (
        <div key={t} className="h-8 w-40 rounded-md bg-bgCard" />
      ))}
    </div>

    <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1">
      {[1, 2, 3, 4].map((c) => (
        <div
          key={c}
          className="flex h-8 w-28 shrink-0 items-center gap-1.5 rounded-lg border bg-bgSurface px-3"
        >
          <div className="h-3 w-3 rounded bg-bgCard" />
          <div className="h-3 w-14 rounded bg-bgCard" />
        </div>
      ))}
    </div>

    <div className="mb-3 h-4 w-44 rounded bg-bgSurface" />

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((g) => (
        <div
          key={g}
          className="overflow-hidden rounded-2xl border border-borderMuted bg-bgCard shadow-sm"
        >
          <div className="h-28 w-full bg-bgSurface" />
          <div className="p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-5 w-40 rounded bg-bgSurface" />
                <div className="h-3 w-24 rounded bg-bgSurface" />
              </div>
              <div className="h-6 w-6 rounded-full bg-bgSurface" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-bgSurface" />
              <div className="h-3 w-20 rounded bg-bgSurface" />
              <div className="ml-auto flex -space-x-2">
                {[1, 2, 3].map((m) => (
                  <div
                    key={m}
                    className="h-6 w-6 rounded-full border-2 border-bgCard bg-bgSurface"
                  />
                ))}
              </div>
              <div className="h-3 w-8 rounded bg-bgSurface" />
            </div>
            <div className="h-10 w-full rounded-xl bg-bgSurface" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default StudyGroupsSkeleton;
