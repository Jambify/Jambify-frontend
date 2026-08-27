import React from "react";

const ChatSkeleton: React.FC = () => (
  <div className="bg-bgMain fixed top-14 right-0 bottom-18 left-0 z-40 flex flex-col lg:bottom-0 lg:left-60">
    <div className="bg-bgCard flex shrink-0 items-center justify-between px-4 py-3 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="bg-bgSurface skeleton-shimmer h-10 w-10 rounded-full" />
        <div className="space-y-1">
          <div className="bg-bgSurface skeleton-shimmer h-4 w-32 rounded" />
          <div className="bg-bgSurface skeleton-shimmer h-2 w-20 rounded" />
        </div>
      </div>
      <div className="bg-bgSurface skeleton-shimmer h-9 w-9 rounded-full" />
    </div>

    <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
      <div className="flex justify-start">
        <div className="bg-bgSurface skeleton-shimmer h-10 w-10 shrink-0 rounded-full" />
        <div className="ml-3 max-w-[75%] space-y-2">
          <div className="bg-bgCard skeleton-shimmer h-4 w-64 rounded-2xl" />
          <div className="bg-bgCard skeleton-shimmer h-4 w-48 rounded-2xl" />
        </div>
      </div>
      <div className="flex justify-end">
        <div className="mr-3 max-w-[75%] space-y-2">
          <div className="bg-bgSurface skeleton-shimmer h-4 w-40 rounded-2xl" />
        </div>
      </div>
      <div className="flex justify-start">
        <div className="bg-bgSurface skeleton-shimmer h-10 w-10 shrink-0 rounded-full" />
        <div className="ml-3 max-w-[75%] space-y-2">
          <div className="bg-bgCard skeleton-shimmer h-4 w-56 rounded-2xl" />
          <div className="bg-bgCard skeleton-shimmer h-4 w-60 rounded-2xl" />
          <div className="bg-bgCard skeleton-shimmer h-4 w-32 rounded-2xl" />
        </div>
      </div>
      <div className="flex justify-end">
        <div className="mr-3 max-w-[75%] space-y-2">
          <div className="bg-bgSurface skeleton-shimmer h-4 w-52 rounded-2xl" />
          <div className="bg-bgSurface skeleton-shimmer h-4 w-28 rounded-2xl" />
        </div>
      </div>
      <div className="flex justify-start">
        <div className="bg-bgSurface skeleton-shimmer h-10 w-10 shrink-0 rounded-full" />
        <div className="ml-3 space-y-2">
          <div className="flex gap-1">
            <div className="bg-bgCard skeleton-shimmer h-2 w-2 rounded-full" />
            <div className="bg-bgCard skeleton-shimmer h-2 w-2 rounded-full" />
            <div className="bg-bgCard skeleton-shimmer h-2 w-2 rounded-full" />
          </div>
        </div>
      </div>
    </div>

    <div className="bg-bgCard shrink-0 p-4">
      <div className="flex items-center gap-3">
        <div className="bg-bgSurface skeleton-shimmer h-10 w-10 rounded-full" />
        <div className="bg-bgSurface skeleton-shimmer h-12 flex-1 rounded-full" />
        <div className="bg-bgSurface skeleton-shimmer h-10 w-10 rounded-full" />
      </div>
    </div>
  </div>
);

export default ChatSkeleton;
