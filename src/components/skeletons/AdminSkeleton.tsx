import React from "react";

const AdminSkeleton: React.FC = () => (
  <div className="animate-pulse p-6 space-y-6">
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <div className="h-8 w-40 rounded bg-bgSurface" />
        <div className="h-3 w-32 rounded bg-bgSurface" />
      </div>
      <div className="flex gap-2">
        <div className="h-9 w-28 rounded-lg bg-bgSurface" />
        <div className="h-9 w-24 rounded-lg bg-bgSurface" />
      </div>
    </div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((s) => (
        <div
          key={s}
          className="rounded-2xl border border-borderMuted bg-bgCard p-5"
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="h-10 w-10 rounded-xl bg-bgSurface" />
            <div className="h-6 w-14 rounded-full bg-bgSurface" />
          </div>
          <div className="mb-1 h-8 w-24 rounded bg-bgSurface" />
          <div className="h-3 w-28 rounded bg-bgSurface" />
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="rounded-2xl border border-borderMuted bg-bgCard p-6 lg:col-span-7">
        <div className="mb-6 h-6 w-36 rounded bg-bgSurface" />
        <div className="h-64">
          <div className="flex h-full items-end justify-between gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-lg bg-bgSurface"
                  style={{ height: `${15 + ((i * 17) % 85)}%` }}
                />
                <div className="h-2 w-6 rounded bg-bgSurface" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-borderMuted bg-bgCard p-6 lg:col-span-5">
        <div className="mb-6 h-6 w-32 rounded bg-bgSurface" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((r) => (
            <div key={r} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-bgSurface" />
                <div className="space-y-1">
                  <div className="h-4 w-24 rounded bg-bgSurface" />
                  <div className="h-2 w-20 rounded bg-bgSurface" />
                </div>
              </div>
              <div className="h-6 w-16 rounded-full bg-bgSurface" />
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="rounded-2xl border border-borderMuted bg-bgCard p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-6 w-44 rounded bg-bgSurface" />
        <div className="h-9 w-72 rounded-lg border bg-bgSurface" />
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className="mb-3 flex border-b border-borderMuted pb-3">
            {[1, 2, 3, 4, 5, 6].map((h) => (
              <div key={h} className="flex-1">
                <div className="h-3 w-20 rounded bg-bgSurface" />
              </div>
            ))}
          </div>
          {[1, 2, 3, 4, 5].map((r) => (
            <div key={r} className="flex items-center border-b border-borderMuted/50 py-4">
              {[1, 2, 3, 4, 5, 6].map((c) => (
                <div key={c} className="flex-1">
                  <div
                    className={`h-4 rounded bg-bgSurface ${
                      c === 1 ? "w-40" : c === 6 ? "w-24" : "w-28"
                    }`}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default AdminSkeleton;
