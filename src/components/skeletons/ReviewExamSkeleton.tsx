import React from "react";

const ReviewExamSkeleton: React.FC = () => (
  <div className="animate-pulse relative box-border w-full max-w-full overflow-x-hidden">
    <div className="mx-auto max-w-5xl overflow-hidden py-6 md:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="h-10 w-24 shrink-0 self-start rounded-xl bg-bgSurface" />
        <div className="h-11 w-40 shrink-0 self-start rounded-xl border border-borderMuted bg-bgSurface sm:self-auto" />
      </div>

      <div className="bg-bgPage sticky top-0 z-20 mb-6 max-w-full space-y-3 py-2">
        <div className="no-scrollbar flex max-w-full gap-2 overflow-x-auto pb-1">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-9 w-28 shrink-0 rounded-xl border border-borderMuted bg-bgSurface"
            />
          ))}
        </div>
        <div className="no-scrollbar flex max-w-full items-center gap-2 overflow-x-auto pb-1">
          <div className="h-3 w-3 shrink-0 rounded bg-bgSurface" />
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-7 w-16 shrink-0 rounded-lg border border-borderMuted bg-bgSurface"
            />
          ))}
        </div>
        <div className="h-px w-full bg-borderMuted" />
      </div>

      <div className="max-w-full space-y-6 overflow-hidden pb-20">
        {[1, 2, 3].map((i) => (
          <article
            key={i}
            className="box-border w-full overflow-hidden rounded-2xl border border-borderMuted bg-bgCard md:rounded-3xl"
            role="region"
          >
            <div className="p-4 md:p-8">
              <header className="mb-6 flex min-w-0 items-start gap-3 md:gap-5">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-bgSurface md:h-12 md:w-12" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3 w-12 rounded bg-bgSurface" />
                  <div className="h-4 w-3/4 rounded bg-bgSurface md:h-5" />
                  <div className="h-4 w-1/2 rounded bg-bgSurface md:h-5" />
                </div>
              </header>

              <fieldset className="mb-6 grid grid-cols-1 gap-3 md:ml-16 md:grid-cols-2">
                <legend className="sr-only">Answer options</legend>
                {[1, 2, 3, 4].map((j) => (
                  <div
                    key={j}
                    className="flex min-w-0 items-center justify-between rounded-xl border-2 border-borderMuted bg-bgSurface p-3 md:p-4"
                  >
                    <div className="h-3 w-3/4 rounded bg-bgCard" />
                    <div className="h-4 w-4 rounded-full bg-bgCard" />
                  </div>
                ))}
              </fieldset>

              <footer className="space-y-4 md:ml-16">
                <section className="overflow-hidden rounded-2xl border border-borderMuted bg-bgSurface/50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="h-3.5 w-3.5 rounded bg-bgCard" />
                    <div className="h-3 w-20 rounded bg-bgCard" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-full rounded bg-bgCard" />
                    <div className="h-3 w-5/6 rounded bg-bgCard" />
                    <div className="h-3 w-4/6 rounded bg-bgCard" />
                  </div>
                </section>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-32 rounded-xl bg-bgSurface" />
                    <div className="h-10 w-10 rounded-xl bg-bgSurface" />
                  </div>
                  <div className="min-w-0 text-right space-y-1">
                    <div className="h-2 w-12 ml-auto rounded bg-bgSurface" />
                    <div className="h-3 w-24 rounded bg-bgSurface" />
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
