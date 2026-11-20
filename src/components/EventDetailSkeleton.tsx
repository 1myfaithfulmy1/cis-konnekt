/** Заглушка на долю секунды, пока страница события готовится к показу. */
export function EventDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-4 px-4 pt-4 md:mx-auto md:max-w-2xl md:px-6 md:py-6">
      <div className="h-6 w-20 rounded bg-surface" />
      <div className="aspect-[4/3] rounded-2xl bg-surface" />
      <div className="h-5 w-2/3 rounded bg-surface" />
      <div className="h-20 rounded-xl bg-surface" />
      <div className="h-12 rounded-xl bg-surface" />
    </div>
  );
}
