/** Заглушка на долю секунды, пока лента готовится к показу в браузере. */
export function FeedSkeleton() {
  return (
    <div className="animate-pulse space-y-3 px-4 pt-4 md:mx-auto md:max-w-7xl md:px-6 md:py-6">
      <div className="h-9 rounded-xl bg-surface md:max-w-xl" />
      <div className="h-9 rounded-xl bg-surface md:max-w-xl" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-56 rounded-2xl bg-surface" />
        ))}
      </div>
    </div>
  );
}
