import React from "react";

const ReviewExamSkeleton: React.FC = () => (
  <div className="relative box-border w-full max-w-full overflow-x-hidden">
    <div className="mx-auto max-w-5xl overflow-hidden py-6 md:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="bg-bgSurface skeleton-shimmer h-10 w-24 shrink-0 self-start rounded-xl" />
        <div className="bg-bgSurface skeleton-shimmer h-11 w-40 shrink-0 self-start rounded-xl sm:self-auto" />
      </div>

      <div className="bg-bgPage sticky top-0 z-20 mb-6 max-w-full space-y-3 py-2">
        <div className="no-scrollbar flex max-w-full gap-2 overflow-x-auto pb-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-bgSurface skeleton-shimmer h-9 w-28 shrink-0 rounded-xl"
            />
          ))}
        </div>
        <div className="no-scrollbar flex max-w-full items-center gap-2 overflow-x-auto pb-1">
          <div className="bg-bgSurface skeleton-shimmer h-3 w-3 shrink-0 rounded" />
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-bgSurface skeleton-shimmer h-7 w-16 shrink-0 rounded-lg"
            />
          ))}
        </div>
        <div className="bg-bgSurface skeleton-shimmer h-px w-full" />
      </div>

      <div className="max-w-full space-y-6 overflow-hidden pb-20">
        {[1, 2, 3].map((i) => (
          <article
            key={i}
            className="bg-bgCard box-border w-full overflow-hidden rounded-2xl md:rounded-3xl"
            role="region"
          >
            <div className="p-4 md:p-8">
              <header className="mb-6 flex min-w-0 items-start gap-3 md:gap-5">
                <div className="bg-bgSurface skeleton-shimmer mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl md:h-12 md:w-12" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="bg-bgSurface skeleton-shimmer h-3 w-12 rounded" />
                  <div className="bg-bgSurface skeleton-shimmer h-4 w-3/4 rounded md:h-5" />
                  <div className="bg-bgSurface skeleton-shimmer h-4 w-1/2 rounded md:h-5" />
                </div>
              </header>

              <fieldset className="mb-6 grid grid-cols-1 gap-3 md:ml-16 md:grid-cols-2">
                <legend className="sr-only">Answer options</legend>
                {[1, 2, 3, 4].map((j) => (
                  <div
                    key={j}
                    className="bg-bgSurface skeleton-shimmer flex min-w-0 items-center justify-between rounded-xl p-3 md:p-4"
                  >
                    <div className="bg-bgCard skeleton-shimmer h-3 w-3/4 rounded" />
                    <div className="bg-bgCard skeleton-shimmer h-4 w-4 rounded-full" />
                  </div>
                ))}
              </fieldset>

              <footer className="space-y-4 md:ml-16">
                <section className="bg-bgSurface/50 overflow-hidden rounded-2xl p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="bg-bgCard skeleton-shimmer h-3.5 w-3.5 rounded" />
                    <div className="bg-bgCard skeleton-shimmer h-3 w-20 rounded" />
                  </div>
                  <div className="space-y-2">
                    <div className="bg-bgCard skeleton-shimmer h-3 w-full rounded" />
                    <div className="bg-bgCard skeleton-shimmer h-3 w-5/6 rounded" />
                    <div className="bg-bgCard skeleton-shimmer h-3 w-4/6 rounded" />
                  </div>
                </section>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-bgSurface skeleton-shimmer h-10 w-32 rounded-xl" />
                    <div className="bg-bgSurface skeleton-shimmer h-10 w-10 rounded-xl" />
                  </div>
                  <div className="min-w-0 space-y-1 text-right">
                    <div className="bg-bgSurface skeleton-shimmer ml-auto h-2 w-12 rounded" />
                    <div className="bg-bgSurface skeleton-shimmer h-3 w-24 rounded" />
                  </div>
                </div>
              </footer>
            </div>
          </article>
        ))}
      </div>
    </div>
  </div>
);

export default ReviewExamSkeleton;
