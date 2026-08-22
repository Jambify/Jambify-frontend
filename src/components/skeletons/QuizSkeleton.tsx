import React from "react";

const QuizSkeleton: React.FC = () => (
  <div className="mx-auto max-w-2xl animate-pulse py-6">
    <div className="mb-8 space-y-2">
      <div className="bg-bgSurface h-8 w-40 rounded" />
      <div className="bg-bgSurface h-4 w-64 rounded" />
    </div>

    <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
      {[1, 2, 3].map((m) => (
        <div key={m} className="bg-bgCard rounded-2xl p-5">
          <div className="bg-bgSurface mb-3 h-10 w-10 rounded-xl" />
          <div className="bg-bgSurface mb-2 h-5 w-24 rounded" />
          <div className="bg-bgSurface h-3 w-full rounded" />
          <div className="bg-bgSurface mt-1 h-3 w-3/4 rounded" />
          <div className="bg-bgSurface mt-5 h-9 w-full rounded-lg" />
        </div>
      ))}
    </div>

    <div className="mb-6 space-y-2">
      <div className="bg-bgSurface h-4 w-32 rounded" />
      <div className="bg-bgSurface h-3 w-56 rounded" />
    </div>

    <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((s) => (
        <div key={s} className="bg-bgCard rounded-2xl p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="bg-bgSurface h-10 w-10 rounded-xl" />
            <div className="bg-bgSurface h-4 w-20 rounded" />
          </div>
          <div className="flex items-center justify-between">
            <div className="bg-bgSurface h-3 w-16 rounded" />
            <div className="bg-bgSurface h-3 w-3 rounded-full" />
          </div>
        </div>
      ))}
    </div>

    <div className="mb-6 flex justify-center">
      <div className="bg-bgSurface h-9 w-40 rounded-xl" />
    </div>

    <div className="mb-8 space-y-2">
      <div className="bg-bgSurface h-4 w-24 rounded" />
      <div className="bg-bgSurface h-3 w-48 rounded" />
    </div>

    <div className="mb-5 flex flex-wrap gap-2">
      {[1, 2, 3, 4, 5].map((t) => (
        <div key={t} className="bg-bgSurface h-8 w-28 rounded-full" />
      ))}
    </div>

    <div className="mb-8 space-y-2">
      <div className="bg-bgSurface h-4 w-28 rounded" />
    </div>

    <div className="mb-5 flex flex-wrap gap-2">
      {[1, 2, 3].map((d) => (
        <div key={d} className="bg-bgSurface h-9 w-24 rounded-xl" />
      ))}
    </div>

    <div className="bg-bgSurface h-14 w-full rounded-2xl" />
  </div>
);

export default QuizSkeleton;
