import React from "react";

const AdminSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-6 p-6">
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <div className="bg-bgSurface h-8 w-40 rounded" />
        <div className="bg-bgSurface h-3 w-32 rounded" />
      </div>
      <div className="flex gap-2">
        <div className="bg-bgSurface h-9 w-28 rounded-lg" />
        <div className="bg-bgSurface h-9 w-24 rounded-lg" />
      </div>
    </div>

    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((s) => (
        <div key={s} className="bg-bgCard rounded-2xl p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="bg-bgSurface h-10 w-10 rounded-xl" />
            <div className="bg-bgSurface h-6 w-14 rounded-full" />
          </div>
          <div className="bg-bgSurface mb-1 h-8 w-24 rounded" />
          <div className="bg-bgSurface h-3 w-28 rounded" />
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <div className="bg-bgCard rounded-2xl p-6 lg:col-span-7">
        <div className="bg-bgSurface mb-6 h-6 w-36 rounded" />
        <div className="h-64">
          <div className="flex h-full items-end justify-between gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="bg-bgSurface w-full rounded-t-lg"
                  style={{ height: `${15 + ((i * 17) % 85)}%` }}
                />
                <div className="bg-bgSurface h-2 w-6 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-bgCard rounded-2xl p-6 lg:col-span-5">
        <div className="bg-bgSurface mb-6 h-6 w-32 rounded" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((r) => (
            <div key={r} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="bg-bgSurface h-9 w-9 rounded-full" />
                <div className="space-y-1">
                  <div className="bg-bgSurface h-4 w-24 rounded" />
                  <div className="bg-bgSurface h-2 w-20 rounded" />
                </div>
              </div>
              <div className="bg-bgSurface h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="bg-bgCard rounded-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="bg-bgSurface h-6 w-44 rounded" />
        <div className="bg-bgSurface h-9 w-72 rounded-lg" />
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-full">
          <div className="mb-3 flex pb-3">
            {[1, 2, 3, 4, 5, 6].map((h) => (
              <div key={h} className="flex-1">
                <div className="bg-bgSurface h-3 w-20 rounded" />
              </div>
            ))}
          </div>
          <div className="bg-bgSurface mb-2 h-px w-full" />
          {[1, 2, 3, 4, 5].map((r) => (
            <div key={r} className="flex items-center py-4">
              {[1, 2, 3, 4, 5, 6].map((c) => (
                <div key={c} className="flex-1">
                  <div
                    className={`bg-bgSurface h-4 rounded ${
                      c === 1 ? "w-40" : c === 6 ? "w-24" : "w-28"
                    }`}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default AdminSkeleton;
