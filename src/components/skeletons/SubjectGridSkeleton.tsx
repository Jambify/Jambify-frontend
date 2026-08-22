import React from "react";

const SubjectGridSkeleton: React.FC = () => (
  <div className="animate-fadeIn mx-auto max-w-350 animate-pulse space-y-6">
    <div className="space-y-2">
      <div className="bg-bgSurface h-9 w-48 rounded" />
      <div className="bg-bgSurface h-4 w-64 rounded" />
    </div>

    <div className="flex items-center gap-2">
      <div className="bg-bgSurface h-11 flex-1 rounded-full" />
      <div className="bg-bgSurface h-11 w-24 rounded-full" />
    </div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((s) => (
        <div key={s} className="bg-bgCard rounded-2xl p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="bg-bgSurface h-12 w-12 rounded-xl" />
            <div className="space-y-1">
              <div className="bg-bgSurface h-5 w-28 rounded" />
              <div className="bg-bgSurface h-3 w-20 rounded" />
            </div>
          </div>

          <div className="bg-bgSurface mb-4 h-2 w-full rounded-full">
            <div
              className="bg-bgCard h-full rounded-full"
              style={{ width: `${30 + s * 8}%` }}
            />
          </div>
          <div className="mb-5 flex justify-between">
            <div className="bg-bgSurface h-3 w-16 rounded" />
            <div className="bg-bgSurface h-3 w-10 rounded" />
          </div>

          <div className="bg-bgSurface h-11 w-full rounded-xl" />
        </div>
      ))}
    </div>
  </div>
);

export default SubjectGridSkeleton;
