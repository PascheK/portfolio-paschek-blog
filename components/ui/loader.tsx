/** Loading spinner — the only looping animation allowed (see /brand.md → Motion). */
export function Loader({ size = 24 }: { size?: number }) {
  const stroke = Math.max(2, Math.round(size * 0.1));
  return (
    <div className="flex w-full items-center justify-center py-8" role="status" aria-label="Loading">
      <svg
        width={size}
        height={size}
        viewBox="0 0 50 50"
        className="animate-spin text-primary"
        aria-hidden
      >
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray="90 60"
        />
      </svg>
    </div>
  );
}
