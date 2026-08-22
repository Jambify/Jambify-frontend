import React from "react";

const SettingsSkeleton: React.FC = () => (
  <div className="mx-auto max-w-2xl animate-pulse py-6">
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1.5">
        <div className="bg-bgSurface h-8 w-32 rounded" />
        <div className="bg-bgSurface h-4 w-72 rounded" />
      </div>
      <div className="bg-bgSurface h-10 w-32 rounded-xl sm:h-9" />
    </div>

    <div className="bg-bgCard mb-5 flex items-center gap-4 rounded-2xl p-5">
      <div className="bg-bgSurface flex h-16 w-16 shrink-0 items-center justify-center rounded-full" />
      <div className="space-y-1.5">
        <div className="bg-bgSurface h-5 w-28 rounded" />
        <div className="bg-bgSurface h-4 w-44 rounded" />
      </div>
    </div>

    <div className="bg-bgSurface mb-5 flex gap-1 rounded-xl p-1">
      {[1, 2, 3, 4].map((t) => (
        <div key={t} className="bg-bgCard h-9 flex-1 rounded-lg" />
      ))}
    </div>

    <div className="space-y-5">
      <div className="bg-bgCard space-y-4 rounded-xl p-5">
        <div className="bg-bgSurface h-3 w-32 rounded" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <div className="bg-bgSurface h-3 w-12 rounded" />
            <div className="bg-bgSurface h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <div className="bg-bgSurface h-3 w-12 rounded" />
            <div className="bg-bgSurface h-10 w-full rounded-lg" />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="bg-bgSurface h-3 w-24 rounded" />
          <div className="bg-bgSurface relative h-10 w-full rounded-lg">
            <div className="bg-bgCard absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 rounded" />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="bg-bgSurface h-3 w-36 rounded" />
          <div className="bg-bgSurface h-14 w-full rounded-xl" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <div className="bg-bgSurface h-3 w-20 rounded" />
            <div className="bg-bgSurface h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <div className="bg-bgSurface h-3 w-24 rounded" />
            <div className="bg-bgSurface h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <div className="bg-bgSurface h-3 w-20 rounded" />
            <div className="bg-bgSurface h-10 w-full rounded-lg" />
          </div>
        </div>
        <div className="flex justify-end pt-2">
          <div className="bg-bgSurface h-10 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  </div>
);

export default SettingsSkeleton;
