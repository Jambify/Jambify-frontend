import React from "react";

const ProSkeleton: React.FC = () => (
  <div className="mx-auto max-w-5xl animate-pulse py-6 md:px-8">
    <div className="mb-12 space-y-3 text-center">
      <div className="bg-bgSurface mx-auto h-10 w-64 rounded" />
      <div className="bg-bgSurface mx-auto h-5 w-96 rounded" />
      <div className="bg-bgSurface mx-auto h-5 w-72 rounded" />
    </div>

    <div className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
      {[1, 2, 3].map((plan) => (
        <div
          key={plan}
          className={`bg-bgCard rounded-3xl p-8 shadow-lg ${
            plan === 2 ? "ring-brand scale-105 ring-2" : ""
          }`}
        >
          {plan === 2 && (
            <div className="bg-brand/10 mx-auto mb-4 h-6 w-28 rounded-full" />
          )}
          <div className="bg-bgSurface mb-2 h-7 w-28 rounded" />
          <div className="bg-bgSurface mb-6 h-4 w-48 rounded" />
          <div className="mb-6 flex items-baseline gap-2">
            <div className="bg-bgSurface h-14 w-20 rounded" />
            <div className="bg-bgSurface h-5 w-16 rounded" />
          </div>
          <div className="bg-bgSurface mb-8 h-12 w-full rounded-xl" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <div className="bg-bgSurface h-5 w-5 rounded-full" />
                <div className="bg-bgSurface h-4 w-full rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>

    <div className="mb-12 space-y-4">
      <div className="bg-bgSurface mx-auto mb-8 h-9 w-48 rounded" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((f) => (
          <div key={f} className="bg-bgCard rounded-2xl p-6">
            <div className="bg-bgSurface mb-4 h-12 w-12 rounded-xl" />
            <div className="bg-bgSurface mb-2 h-5 w-32 rounded" />
            <div className="bg-bgSurface h-4 w-full rounded" />
            <div className="bg-bgSurface mt-1 h-4 w-5/6 rounded" />
          </div>
        ))}
      </div>
    </div>

    <div className="bg-bgCard space-y-4 rounded-3xl p-8 text-center">
      <div className="bg-bgSurface mx-auto h-8 w-80 rounded" />
      <div className="bg-bgSurface mx-auto h-5 w-96 rounded" />
      <div className="bg-bgSurface mx-auto h-12 w-48 rounded-xl" />
    </div>
  </div>
);

export default ProSkeleton;
