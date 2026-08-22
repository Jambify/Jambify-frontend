import React from "react";

const StudyGroupsSkeleton: React.FC = () => (
  <div className="animate-pulse py-6 md:px-8">
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div className="space-y-2">
        <div className="bg-bgSurface h-8 w-44 rounded" />
        <div className="bg-bgSurface h-4 w-72 rounded" />
      </div>
      <div className="bg-bgSurface h-10 w-32 rounded-xl" />
    </div>

    <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="bg-bgCard rounded-lg p-4">
        <div className="bg-bgSurface mb-2 h-3 w-24 rounded" />
        <div className="flex gap-2">
          <div className="bg-bgSurface h-9 flex-1 rounded-lg" />
          <div className="bg-bgSurface h-9 w-16 rounded-lg" />
        </div>
      </div>
      <div className="bg-bgCard flex flex-col justify-end rounded-lg p-4">
        <div className="bg-bgSurface mb-2 h-3 w-32 rounded" />
        <div className="bg-bgSurface h-9 w-full rounded-lg" />
      </div>
    </div>

    <div className="bg-bgSurface mb-4 flex w-fit gap-1 rounded-lg p-1">
      {[1, 2].map((t) => (
        <div key={t} className="bg-bgCard h-8 w-40 rounded-md" />
      ))}
    </div>

    <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1">
      {[1, 2, 3, 4].map((c) => (
        <div
          key={c}
          className="bg-bgSurface flex h-8 w-28 shrink-0 items-center gap-1.5 rounded-lg px-3"
        >
          <div className="bg-bgCard h-3 w-3 rounded" />
          <div className="bg-bgCard h-3 w-14 rounded" />
        </div>
      ))}
    </div>

    <div className="bg-bgSurface mb-3 h-4 w-44 rounded" />

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((g) => (
        <div
          key={g}
          className="bg-bgCard overflow-hidden rounded-2xl shadow-sm"
        >
          <div className="bg-bgSurface h-28 w-full" />
          <div className="space-y-3 p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="bg-bgSurface h-5 w-40 rounded" />
                <div className="bg-bgSurface h-3 w-24 rounded" />
              </div>
              <div className="bg-bgSurface h-6 w-6 rounded-full" />
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-bgSurface h-6 w-6 rounded-full" />
              <div className="bg-bgSurface h-3 w-20 rounded" />
              <div className="ml-auto flex -space-x-2">
                {[1, 2, 3].map((m) => (
                  <div
                    key={m}
                    className="bg-bgSurface ring-bgCard h-6 w-6 rounded-full ring-2"
                  />
                ))}
              </div>
              <div className="bg-bgSurface h-3 w-8 rounded" />
            </div>
            <div className="bg-bgSurface h-10 w-full rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default StudyGroupsSkeleton;
