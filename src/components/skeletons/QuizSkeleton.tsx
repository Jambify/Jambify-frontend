import React from "react";

const QuizSkeleton: React.FC = () => (
  <div className="animate-pulse mx-auto max-w-5xl py-6 md:px-8">
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div className="space-y-2">
        <div className="h-8 w-40 rounded bg-bgSurface" />
        <div className="h-4 w-56 rounded bg-bgSurface" />
      </div>
      <div className="h-10 w-36 rounded-full border bg-bgSurface" />
    </div>

    <div className="mb-6 flex items-center justify-between">
      <div className="h-6 w-40 rounded-full border bg-bgSurface px-3" />
      <div className="h-1.5 w-48 rounded-full bg-bgSurface">
        <div className="h-full w-1/3 rounded-full bg-bgCard" />
      </div>
      <div className="h-6 w-24 rounded-full border bg-bgSurface" />
    </div>

    <div className="mb-10 rounded-2xl border border-borderMuted bg-bgCard p-6 shadow-xl sm:p-10">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-24 rounded-full border bg-bgSurface" />
          <div className="h-7 w-20 rounded-full border bg-bgSurface" />
        </div>
        <div className="h-3 w-20 rounded bg-bgSurface" />
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

    <div className="flex w-full items-center justify-between gap-3">
      <div className="h-14 w-28 rounded-xl bg-bgSurface" />
      <div className="h-14 flex-1 rounded-xl bg-bgSurface sm:flex-none sm:w-44" />
    </div>
  </div>
);

export default QuizSkeleton;
