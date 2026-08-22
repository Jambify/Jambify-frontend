import React from "react";

const ListSkeleton: React.FC = () => (
  <div className="animate-fadeIn mx-auto max-w-4xl animate-pulse space-y-6 px-2 lg:px-4">
    <div className="mb-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div className="space-y-2">
        <div className="bg-bgSurface h-9 w-40 rounded" />
        <div className="bg-bgSurface h-4 w-56 rounded" />
      </div>
      <div className="flex gap-2">
        <div className="bg-bgSurface h-10 w-32 rounded-lg" />
        <div className="bg-bgSurface h-10 w-28 rounded-lg" />
      </div>
    </div>

    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((item) => (
        <div key={item} className="bg-bgCard rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <div className="bg-bgSurface h-14 w-14 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="bg-bgSurface h-5 w-56 rounded" />
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3].map((t) => (
                    <div
                      key={t}
                      className="bg-bgSurface h-5 w-20 rounded-full"
                    />
                  ))}
                </div>
                <div className="bg-bgSurface h-3 w-40 rounded" />
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <div className="bg-bgSurface h-7 w-20 rounded-full" />
              <div className="bg-bgSurface h-8 w-24 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default ListSkeleton;
