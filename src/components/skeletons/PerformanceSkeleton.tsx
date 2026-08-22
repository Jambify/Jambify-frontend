import React from "react";

const PerformanceSkeleton: React.FC = () => (
  <div className="animate-fadeIn mx-auto max-w-350 animate-pulse space-y-6">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        <div className="bg-bgSurface h-9 w-56 rounded lg:h-11" />
        <div className="bg-bgSurface h-4 w-72 rounded lg:h-5" />
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-bgSurface h-9 w-32 rounded-full" />
          <div className="bg-bgSurface h-8 w-44 rounded-full" />
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-bgCard relative flex h-full flex-col overflow-hidden rounded-2xl p-6 shadow-sm lg:p-7"
        >
          <div className="bg-bgSurface mb-5 flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm" />
          <div className="bg-bgSurface mb-1.5 h-5 w-40 rounded" />
          <div className="mb-auto min-h-14">
            <div className="bg-bgSurface mt-1 h-10 w-24 rounded lg:h-11" />
          </div>
          <div className="bg-bgSurface mt-2 h-3 w-28 rounded" />
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <div className="space-y-8 lg:col-span-7 xl:col-span-8">
        <div className="bg-bgCard rounded-2xl p-6 shadow-sm lg:p-8">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <div className="bg-bgSurface h-6 w-40 rounded" />
              <div className="bg-bgSurface h-3 w-48 rounded" />
            </div>
            <div className="bg-bgSurface h-7 w-16 rounded-full" />
          </div>
          <div className="h-64 lg:h-80">
            <div className="flex h-full items-end justify-between gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <div
                  key={d}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <div
                    className="bg-bgSurface w-full rounded-t-lg"
                    style={{ height: `${20 + d * 10}%` }}
                  />
                  <div className="bg-bgSurface h-2 w-6 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className="bg-bgCard flex flex-col items-center gap-4 rounded-2xl p-5 shadow-sm"
            >
              <div className="bg-bgSurface flex h-12 w-12 items-center justify-center rounded-xl" />
              <div className="bg-bgSurface h-3 w-24 rounded" />
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6 lg:col-span-5 xl:col-span-4">
        <div className="group bg-bgCard relative flex h-full flex-col overflow-hidden rounded-2xl p-6 shadow-sm lg:p-8">
          <div className="bg-bgSurface absolute top-0 right-0 -mt-32 -mr-32 h-64 w-64 rounded-full blur-3xl" />
          <div className="relative z-10 mb-8 flex items-center justify-between">
            <div className="flex flex-col gap-2">
              <div className="bg-bgSurface h-6 w-52 rounded" />
              <div className="bg-bgSurface h-3 w-56 rounded" />
            </div>
            <div className="bg-bgSurface h-9 w-9 rounded-full" />
          </div>

          <div className="relative z-10 grid flex-1 grid-cols-1 gap-6">
            <div className="bg-bgSurface/40 flex flex-col justify-between rounded-2xl p-6">
              <div>
                <div className="mb-6 flex items-center gap-3">
                  <div className="bg-bgCard flex h-10 w-10 items-center justify-center rounded-xl" />
                  <div className="bg-bgCard h-3 w-32 rounded" />
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="bg-bgCard h-16 w-28 rounded" />
                  <div className="bg-bgCard h-5 w-12 rounded" />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between pt-4">
                <div className="bg-bgCard h-3 w-36 rounded" />
                <div className="bg-bgCard h-5 w-16 rounded" />
              </div>
            </div>

            <div className="bg-bgSurface/40 flex flex-col justify-between rounded-2xl p-6">
              <div>
                <div className="mb-6 flex items-center gap-3">
                  <div className="bg-bgCard flex h-10 w-10 items-center justify-center rounded-xl" />
                  <div className="bg-bgCard h-3 w-32 rounded" />
                </div>
                <div className="flex items-baseline gap-2">
                  <div className="bg-bgCard h-16 w-28 rounded" />
                  <div className="bg-bgCard h-5 w-12 rounded" />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between pt-4">
                <div className="bg-bgCard h-3 w-28 rounded" />
              </div>
            </div>
          </div>

          <div className="bg-bgSurface/40 relative z-10 mt-8 rounded-2xl p-6 lg:p-7">
            <div className="mb-6 flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="bg-bgCard flex h-10 w-10 items-center justify-center rounded-2xl" />
                <div className="space-y-1">
                  <div className="bg-bgCard h-3 w-40 rounded" />
                  <div className="bg-bgCard h-3 w-44 rounded" />
                </div>
              </div>
              <div className="space-y-1 text-right">
                <div className="bg-bgCard h-7 w-14 rounded" />
                <div className="bg-bgCard ml-auto h-2 w-20 rounded" />
              </div>
            </div>

            <div className="bg-bgCard h-5 overflow-hidden rounded-full p-1.5">
              <div className="bg-bgSurface h-full w-2/3 rounded-full" />
            </div>

            <div className="mt-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="bg-bgSurface h-3 w-48 rounded" />
              <div className="bg-bgSurface h-6 w-28 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="space-y-6 pt-4">
      <div className="flex items-center justify-between">
        <div className="bg-bgSurface h-7 w-44 rounded" />
        <div className="bg-bgSurface/50 mx-6 hidden h-px flex-1 md:block" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {[1, 2].map((s) => (
          <div
            key={s}
            className="bg-bgCard cursor-pointer rounded-2xl p-5 transition-all"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-bgSurface flex h-12 w-12 items-center justify-center rounded-xl" />
              <div className="space-y-1">
                <div className="bg-bgSurface h-5 w-28 rounded" />
                <div className="bg-bgSurface h-3 w-32 rounded" />
              </div>
            </div>
            <div className="bg-bgSurface/50 rounded-xl p-3">
              <div className="mb-1 flex items-center gap-1.5">
                <div className="bg-bgCard h-1.5 w-1.5 rounded-full" />
                <div className="bg-bgCard h-3 w-24 rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div className="bg-bgCard h-4 w-40 rounded" />
                <div className="bg-bgCard h-4 w-10 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default PerformanceSkeleton;
