type Props = {
  className?: string;
};

export function Skeleton({ className = '' }: Props) {
  return (
    <div
      aria-hidden="true"
      className={`relative overflow-hidden rounded-md bg-zinc-200/70 ${className}`}
    >
      <span className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
    </div>
  );
}
