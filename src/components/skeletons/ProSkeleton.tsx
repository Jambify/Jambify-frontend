import React from "react";

const ProSkeleton: React.FC = () => (
  <div className="animate-pulse mx-auto max-w-5xl py-6 md:px-8">
    <div className="mb-12 text-center space-y-3">
      <div className="mx-auto h-10 w-64 rounded bg-bgSurface" />
      <div className="mx-auto h-5 w-96 rounded bg-bgSurface" />
      <div className="mx-auto h-5 w-72 rounded bg-bgSurface" />
    </div>

    <div className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
      {[1, 2, 3].map((plan) => (
        <div
          key={plan}
          className={`rounded-3xl border p-8 shadow-lg bg-bgCard border-borderMuted ${
            plan === 2 ? "ring-2 ring-brand scale-105" : ""
          }`}
        >
          {plan === 2 && (
            <div className="mx-auto mb-4 h-6 w-28 rounded-full bg-brand/10" />
          )}
          <div className="mb-2 h-7 w-28 rounded bg-bgSurface" />
          <div className="mb-6 h-4 w-48 rounded bg-bgSurface" />
          <div className="mb-6 flex items-baseline gap-2">
            <div className="h-14 w-20 rounded bg-bgSurface" />
            <div className="h-5 w-16 rounded bg-bgSurface" />
          </div>
          <div className="mb-8 h-12 w-full rounded-xl bg-bgSurface" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-bgSurface" />
                <div className="h-4 w-full rounded bg-bgSurface" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>

    <div className="mb-12 space-y-4">
      <div className="mx-auto mb-8 h-9 w-48 rounded bg-bgSurface" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((f) => (
          <div
            key={f}
            className="rounded-2xl border border-borderMuted bg-bgCard p-6"
          >
            <div className="mb-4 h-12 w-12 rounded-xl bg-bgSurface" />
            <div className="mb-2 h-5 w-32 rounded bg-bgSurface" />
            <div className="h-4 w-full rounded bg-bgSurface" />
            <div className="mt-1 h-4 w-5/6 rounded bg-bgSurface" />
          </div>
        ))}
      </div>
    </div>

    <div className="rounded-3xl border border-borderMuted bg-bgCard p-8 text-center space-y-4">
      <div className="mx-auto h-8 w-80 rounded bg-bgSurface" />
      <div className="mx-auto h-5 w-96 rounded bg-bgSurface" />
      <div className="mx-auto h-12 w-48 rounded-xl bg-bgSurface" />
    </div>
  </div>
);

export default ProSkeleton;
