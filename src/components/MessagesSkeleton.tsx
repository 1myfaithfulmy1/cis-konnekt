/** Заглушка на долю секунды, пока список сообщений готовится к показу. */
export function MessagesSkeleton() {
  return (
    <div className="animate-pulse space-y-3 px-4 pt-4 md:mx-auto md:max-w-2xl md:px-6 md:py-6">
      <div className="h-12 rounded-xl bg-surface" />
      <div className="h-16 rounded-2xl bg-surface" />
      <div className="h-16 rounded-2xl bg-surface" />
      <div className="h-16 rounded-2xl bg-surface" />
    </div>
  );
}
