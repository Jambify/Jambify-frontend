import React from "react";

const SettingsSkeleton: React.FC = () => (
  <div className="animate-pulse mx-auto max-w-5xl py-6 md:px-8">
    <div className="mb-8 space-y-2">
      <div className="h-9 w-44 rounded bg-bgSurface" />
      <div className="h-4 w-64 rounded bg-bgSurface" />
    </div>

    <div className="mb-6 flex gap-2 overflow-x-auto border-b border-borderMuted pb-1">
      {[1, 2, 3, 4, 5].map((t) => (
        <div key={t} className="h-9 w-28 shrink-0 rounded-lg bg-bgSurface" />
      ))}
    </div>

    <div className="space-y-6">
      <div className="rounded-2xl border border-borderMuted bg-bgCard p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-bgSurface" />
          <div className="space-y-2">
            <div className="h-5 w-32 rounded bg-bgSurface" />
            <div className="h-3 w-40 rounded bg-bgSurface" />
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((f) => (
            <div key={f} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-bgSurface" />
                <div className="h-11 w-full rounded-lg border bg-bgSurface" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-bgSurface" />
                <div className="h-11 w-full rounded-lg border bg-bgSurface" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-borderMuted bg-bgCard p-6">
        <div className="mb-4 h-5 w-32 rounded bg-bgSurface" />
        <div className="space-y-4">
          {[1, 2, 3].map((r) => (
            <div
              key={r}
              className="flex items-center justify-between rounded-xl border border-borderMuted bg-bgSurface/30 p-4"
            >
              <div className="space-y-1">
                <div className="h-4 w-36 rounded bg-bgCard" />
                <div className="h-3 w-52 rounded bg-bgCard" />
              </div>
              <div className="h-7 w-12 rounded-full bg-bgCard" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-borderMuted bg-bgCard p-6">
        <div className="mb-4 h-5 w-40 rounded bg-bgSurface" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((c) => (
            <div
              key={c}
              className="rounded-xl border border-borderMuted bg-bgSurface/30 p-5"
            >
              <div className="mb-3 h-10 w-10 rounded-xl bg-bgCard" />
              <div className="mb-1 h-4 w-20 rounded bg-bgCard" />
              <div className="h-3 w-32 rounded bg-bgCard" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default SettingsSkeleton;
