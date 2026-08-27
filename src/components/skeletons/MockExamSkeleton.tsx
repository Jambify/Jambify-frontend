import React from "react";

const MockExamSkeleton: React.FC = () => (
  <div className="bg-bgMain flex h-screen overflow-hidden">
    <div className="bg-bgCard hidden w-72 flex-col overflow-y-auto lg:flex">
      <div className="bg-bgSurface/50 p-5">
        <div className="mb-6 flex items-center gap-2">
          <div className="bg-bgMain skeleton-shimmer h-16 w-16 rounded-xl" />
          <div className="space-y-2">
            <div className="bg-bgSurface skeleton-shimmer h-4 w-24 rounded" />
            <div className="bg-bgSurface skeleton-shimmer h-2 w-20 rounded" />
          </div>
        </div>
        <div className="mb-4 flex items-center gap-2">
          <div className="bg-brand h-3 w-1 rounded-full" />
          <div className="bg-bgSurface skeleton-shimmer h-3 w-20 rounded" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-bgSurface skeleton-shimmer h-9 w-full rounded-xl" />
          ))}
        </div>
      </div>
      <div className="p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="bg-brand h-3 w-1 rounded-full" />
          <div className="bg-bgSurface skeleton-shimmer h-3 w-24 rounded" />
        </div>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="bg-bgSurface skeleton-shimmer h-8 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>

    <div className="bg-bgMain flex min-w-0 flex-1 flex-col overflow-hidden">
      <header className="bg-bgCard z-30 flex shrink-0 items-center justify-between px-3 py-2 shadow-sm sm:px-6 sm:py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
          <div className="bg-bgSurface skeleton-shimmer h-8 w-8 rounded-full sm:h-10 sm:w-10" />
          <div className="bg-bgSurface skeleton-shimmer hidden h-6 w-px sm:block" />
          <div className="min-w-0 space-y-1">
            <div className="bg-bgSurface skeleton-shimmer h-4 w-32 rounded sm:h-5" />
            <div className="bg-bgSurface skeleton-shimmer h-2 w-24 rounded" />
          </div>
        </div>
        <div className="ml-2 flex shrink-0 items-center gap-3 sm:gap-4">
          <div className="bg-bgSurface skeleton-shimmer h-8 w-24 rounded-full sm:h-10 sm:w-36" />
          <div className="bg-bgSurface skeleton-shimmer h-8 w-24 rounded-lg sm:h-10 sm:w-36" />
          <div className="bg-bgSurface skeleton-shimmer h-8 w-8 rounded-full sm:h-10 sm:w-10 lg:hidden" />
        </div>
      </header>

      <div className="bg-bgSurface skeleton-shimmer h-1 w-full shrink-0">
        <div className="bg-bgCard skeleton-shimmer h-full w-1/3" />
      </div>

      <main className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-12">
        <div className="mx-auto w-full max-w-3xl">
          <div className="bg-bgCard mb-10 rounded-2xl p-6 shadow-xl sm:p-10">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-bgSurface skeleton-shimmer h-7 w-20 rounded-full" />
                <div className="bg-bgSurface skeleton-shimmer h-7 w-16 rounded-full" />
                <div className="bg-bgSurface skeleton-shimmer h-7 w-7 rounded-lg" />
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-bgSurface skeleton-shimmer h-3 w-16 rounded" />
                <div className="bg-bgSurface skeleton-shimmer h-8 w-12 rounded-lg" />
              </div>
            </div>

            <div className="bg-bgSurface/50 mb-6 rounded-r-xl p-4">
              <div className="mb-2 flex items-center gap-2">
                <div className="bg-bgCard skeleton-shimmer h-1.5 w-1.5 rounded-full" />
                <div className="bg-bgCard skeleton-shimmer h-3 w-24 rounded" />
              </div>
              <div className="space-y-2">
                <div className="bg-bgCard skeleton-shimmer h-3 w-full rounded" />
                <div className="bg-bgCard skeleton-shimmer h-3 w-5/6 rounded" />
              </div>
            </div>

            <div className="mb-10 space-y-3">
              <div className="bg-bgSurface skeleton-shimmer h-6 w-full rounded sm:h-7" />
              <div className="bg-bgSurface skeleton-shimmer h-6 w-5/6 rounded sm:h-7" />
              <div className="bg-bgSurface skeleton-shimmer h-6 w-4/6 rounded sm:h-7" />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-bgSurface skeleton-shimmer flex min-w-0 items-center justify-between rounded-xl p-4"
                >
                  <div className="flex items-center gap-2">
                    <div className="bg-bgCard skeleton-shimmer h-5 w-5 rounded-md" />
                    <div className="bg-bgCard skeleton-shimmer h-4 w-64 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-12 flex flex-wrap items-center justify-between gap-4">
            <div className="flex w-full items-center justify-center gap-3 sm:w-auto sm:justify-start">
              <div className="bg-bgSurface skeleton-shimmer h-14 w-28 rounded-xl" />
              <div className="bg-bgSurface skeleton-shimmer h-14 w-28 rounded-xl" />
            </div>
            <div className="flex w-full items-center gap-3 sm:w-auto">
              <div className="bg-bgSurface skeleton-shimmer h-14 w-24 rounded-xl" />
              <div className="bg-bgSurface skeleton-shimmer h-14 flex-1 rounded-xl sm:w-40 sm:flex-none" />
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
);

export default MockExamSkeleton;
