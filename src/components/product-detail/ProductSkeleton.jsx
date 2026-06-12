export function ProductSkeleton() {
  return (
    <div className="space-y-8 py-4" aria-hidden="true">
      <div className="h-5 w-64 rounded-full bg-slate-200" />

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)_320px]">
        <div className="rounded-[32px] bg-white p-4 shadow-sm sm:p-6">
          <div className="h-[420px] rounded-[28px] bg-slate-100" />
          <div className="mt-4 grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-20 rounded-2xl bg-slate-100" />
            ))}
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-sm sm:p-8">
          <div className="space-y-3">
            <div className="h-4 w-28 rounded-full bg-slate-100" />
            <div className="h-8 w-full rounded-full bg-slate-100" />
            <div className="h-4 w-4/5 rounded-full bg-slate-100" />
          </div>
          <div className="mt-6 h-10 w-44 rounded-full bg-slate-100" />
          <div className="mt-6 grid gap-3 rounded-3xl bg-slate-50 p-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-12 rounded-2xl bg-slate-100" />
            ))}
          </div>
          <div className="mt-6 h-24 rounded-3xl bg-slate-50" />
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="h-12 rounded-full bg-slate-100" />
            <div className="h-12 rounded-full bg-slate-100" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[32px] bg-white p-4 shadow-sm">
            <div className="space-y-3">
              <div className="h-4 w-40 rounded-full bg-slate-100" />
              <div className="h-4 w-full rounded-full bg-slate-100" />
              <div className="h-4 w-5/6 rounded-full bg-slate-100" />
            </div>
          </div>
          <div className="space-y-3 rounded-[32px] bg-white p-4 shadow-sm">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-28 rounded-[24px] bg-slate-100" />
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)]">
        <div className="rounded-[32px] bg-white p-6 shadow-sm sm:p-8">
          <div className="h-6 w-48 rounded-full bg-slate-100" />
          <div className="mt-6 space-y-3">
            <div className="h-4 w-full rounded-full bg-slate-100" />
            <div className="h-4 w-5/6 rounded-full bg-slate-100" />
            <div className="h-4 w-4/5 rounded-full bg-slate-100" />
          </div>
        </div>
        <div className="rounded-[32px] bg-white p-6 shadow-sm sm:p-8">
          <div className="h-6 w-48 rounded-full bg-slate-100" />
          <div className="mt-6 space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-10 rounded-2xl bg-slate-100" />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
