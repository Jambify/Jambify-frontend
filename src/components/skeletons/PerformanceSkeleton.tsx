import React from "react";

const PerformanceSkeleton: React.FC = () => (
  <div className="animate-pulse mx-auto max-w-5xl space-y-6 py-6 md:px-8">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        <div className="h-9 w-56 rounded bg-bgSurface lg:h-11" />
        <div className="h-4 w-72 rounded bg-bgSurface lg:h-5" />
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-32 rounded-full border bg-bgSurface" />
          <div className="h-8 w-44 rounded-full border bg-bgSurface" />
        </div>
      </div>
    </div>

    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-borderMuted bg-bgCard p-6 shadow-sm lg:p-7"
        >
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-bgSurface shadow-sm" />
          <div className="mb-1.5 h-5 w-40 rounded bg-bgSurface" />
          <div className="mb-auto min-h-14">
            <div className="mt-1 h-10 w-24 rounded bg-bgSurface lg:h-11" />
          </div>
          <div className="mt-2 h-3 w-28 rounded bg-bgSurface" />
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <div className="space-y-8 lg:col-span-7 xl:col-span-8">
        <div className="rounded-2xl border border-borderMuted bg-bgCard p-6 shadow-sm lg:p-8">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <div className="h-6 w-40 rounded bg-bgSurface" />
              <div className="h-3 w-48 rounded bg-bgSurface" />
            </div>
            <div className="h-7 w-16 rounded-full border bg-bgSurface" />
          </div>
          <div className="h-64 lg:h-80">
            <div className="flex h-full items-end justify-between gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <div
                  key={d}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <div
                    className="w-full rounded-t-lg bg-bgSurface"
                    style={{ height: `${20 + d * 10}%` }}
                  />
                  <div className="h-2 w-6 rounded bg-bgSurface" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className="flex flex-col items-center gap-4 rounded-2xl border border-borderMuted bg-bgCard p-5 shadow-sm"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bgSurface" />
              <div className="h-3 w-24 rounded bg-bgSurface" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6 lg:col-span-5 xl:col-span-4">
        <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-borderMuted bg-bgCard p-6 shadow-sm lg:p-8">
          <div className="absolute -mt-32 -mr-32 top-0 right-0 h-64 w-64 rounded-full bg-bgSurface blur-3xl" />
          <div className="relative z-10 mb-8 flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <div className="h-6 w-52 rounded bg-bgSurface" />
              <div className="h-3 w-56 rounded bg-bgSurface" />
            </div>
            <div className="h-9 w-9 rounded-full bg-bgSurface" />
          </div>

          <div className="relative z-10 grid flex-1 grid-cols-1 gap-6">
            <div className="flex flex-col justify-between rounded-2xl border bg-bgSurface/40 p-6">
              <div>
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bgCard" />
                  <div className="h-3 w-32 rounded bg-bgCard" />
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="h-16 w-28 rounded bg-bgCard" />
                  <div className="h-5 w-12 rounded bg-bgCard" />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-borderMuted/30 pt-4">
                <div className="h-3 w-36 rounded bg-bgCard" />
                <div className="h-5 w-16 rounded bg-bgCard" />
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border bg-bgSurface/40 p-6">
              <div>
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-bgCard" />
                  <div className="h-3 w-32 rounded bg-bgCard" />
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="h-16 w-28 rounded bg-bgCard" />
                  <div className="h-5 w-12 rounded bg-bgCard" />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-borderMuted/30 pt-4">
                <div className="h-3 w-28 rounded bg-bgCard" />
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-8 rounded-2xl border border-borderMuted/40 bg-bgSurface/40 p-6 lg:p-7">
            <div className="mb-6 flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-bgCard" />
                <div className="space-y-1">
                  <div className="h-3 w-40 rounded bg-bgCard" />
                  <div className="h-3 w-44 rounded bg-bgCard" />
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="h-7 w-14 rounded bg-bgCard" />
                <div className="h-2 w-20 ml-auto rounded bg-bgCard" />
              </div>
            </div>

            <div className="h-5 overflow-hidden rounded-full border border-borderMuted/20 bg-bgCard p-1.5">
              <div className="h-full w-2/3 rounded-full bg-bgSurface" />
            </div>

            <div className="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="h-3 w-48 rounded bg-bgSurface" />
              <div className="h-6 w-28 rounded-full bg-bgSurface" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <div className="h-7 w-44 rounded bg-bgSurface" />
        <div className="bg-borderMuted/50 mx-6 hidden h-px flex-1 md:block" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[1, 2].map((s) => (
          <div
            key={s}
            className="cursor-pointer rounded-2xl border border-borderMuted bg-bgCard p-5 transition-all"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bgSurface" />
              <div className="space-y-1">
                <div className="h-5 w-28 rounded bg-bgSurface" />
                <div className="h-3 w-32 rounded bg-bgSurface" />
              </div>
            </div>
            <div className="rounded-xl border bg-bgSurface/50 p-3">
              <div className="mb-1 flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-bgCard" />
                <div className="h-3 w-24 rounded bg-bgCard" />
              </div>
              <div className="flex items-center justify-between">
                <div className="h-4 w-40 rounded bg-bgCard" />
                <div className="h-4 w-10 rounded bg-bgCard" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default PerformanceSkeleton;
