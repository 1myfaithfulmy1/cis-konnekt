/** Заглушка на долю секунды, пока кабинет готовится к показу. */
export function CabinetSkeleton() {
  return (
    <div className="animate-pulse space-y-4 px-4 pt-4 md:mx-auto md:max-w-2xl md:px-6 md:py-6">
      <div className="h-24 rounded-2xl bg-surface" />
      <div className="h-24 rounded-2xl bg-surface" />
      <div className="h-24 rounded-2xl bg-surface" />
    </div>
  );
}
