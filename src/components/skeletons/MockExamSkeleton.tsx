import React from "react";

const MockExamSkeleton: React.FC = () => (
  <div className="animate-pulse bg-bgMain flex h-screen overflow-hidden">
    <div className="bg-bgCard border-borderMuted hidden w-72 flex-col overflow-y-auto border-r lg:flex">
      <div className="border-borderMuted bg-bgSurface/50 border-b p-5">
        <div className="mb-6 flex items-center gap-2">
          <div className="h-16 w-16 rounded-xl bg-bgMain" />
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-bgSurface" />
            <div className="h-2 w-20 rounded bg-bgSurface" />
          </div>
        </div>
        <div className="mb-4 flex items-center gap-2">
          <div className="bg-brand h-3 w-1 rounded-full" />
          <div className="h-3 w-20 rounded bg-bgSurface" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-9 w-full rounded-xl bg-bgSurface" />
          ))}
        </div>
      </div>
      <div className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="bg-brand h-3 w-1 rounded-full" />
          <div className="h-3 w-24 rounded bg-bgSurface" />
        </div>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="h-8 w-full rounded-lg bg-bgSurface" />
          ))}
        </div>
      </div>
    </div>

    <div className="bg-bgMain flex min-w-0 flex-1 flex-col overflow-hidden">
      <header className="bg-bgCard border-borderMuted z-30 flex shrink-0 items-center justify-between border-b px-3 py-2 shadow-sm sm:px-6 sm:py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
          <div className="h-8 w-8 rounded-full bg-bgSurface sm:h-10 sm:w-10" />
          <div className="bg-borderMuted hidden h-6 w-px sm:block" />
          <div className="min-w-0 space-y-1">
            <div className="h-4 w-32 rounded bg-bgSurface sm:h-5" />
            <div className="h-2 w-24 rounded bg-bgSurface" />
          </div>
        </div>
        <div className="ml-2 flex shrink-0 items-center gap-3 sm:gap-4">
          <div className="h-8 w-24 rounded-full border bg-bgSurface sm:h-10 sm:w-36" />
          <div className="h-8 w-24 rounded-lg bg-bgSurface sm:h-10 sm:w-36" />
          <div className="h-8 w-8 rounded-full bg-bgSurface lg:hidden sm:h-10 sm:w-10" />
        </div>
      </header>

      <div className="bg-bgSurface h-1 w-full shrink-0">
        <div className="h-full w-1/3 bg-bgCard" />
      </div>

      <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12">
        <div className="mx-auto w-full max-w-3xl">
          <div className="bg-bgCard border-borderMuted mb-10 rounded-2xl border p-6 shadow-xl sm:p-10">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-20 rounded-full border bg-bgSurface" />
                <div className="h-7 w-16 rounded-full border bg-bgSurface" />
                <div className="h-7 w-7 rounded-lg bg-bgSurface" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 w-16 rounded bg-bgSurface" />
                <div className="h-8 w-12 rounded-lg border bg-bgSurface" />
              </div>
            </div>

            <div className="mb-6 rounded-r-xl border-l-4 border-borderMuted bg-bgSurface/50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-bgCard" />
                <div className="h-3 w-24 rounded bg-bgCard" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-bgCard" />
                <div className="h-3 w-5/6 rounded bg-bgCard" />
              </div>
            </div>

            <div className="mb-10 space-y-3">
              <div className="h-6 w-full rounded bg-bgSurface sm:h-7" />
              <div className="h-6 w-5/6 rounded bg-bgSurface sm:h-7" />
              <div className="h-6 w-4/6 rounded bg-bgSurface sm:h-7" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex min-w-0 items-center justify-between rounded-xl border-2 border-borderMuted bg-bgSurface p-4"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-md bg-bgCard" />
                    <div className="h-4 w-64 rounded bg-bgCard" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-12 flex flex-wrap items-center justify-between gap-4">
            <div className="flex w-full items-center justify-center gap-3 sm:w-auto sm:justify-start">
              <div className="h-14 w-28 rounded-xl border bg-bgSurface" />
              <div className="h-14 w-28 rounded-xl border bg-bgSurface" />
            </div>
            <div className="flex w-full items-center gap-3 sm:w-auto">
              <div className="h-14 w-24 rounded-xl bg-bgSurface" />
              <div className="h-14 flex-1 rounded-xl bg-bgSurface sm:flex-none sm:w-40" />
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
);

export default MockExamSkeleton;
