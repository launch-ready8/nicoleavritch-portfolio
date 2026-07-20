export default function Star({ className = "", spin = true }: { className?: string; spin?: boolean }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`${spin ? "spin-slow" : ""} ${className}`}
      aria-hidden
      fill="currentColor"
    >
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <ellipse key={deg} cx="50" cy="27" rx="9.5" ry="23" transform={`rotate(${deg} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="7" fill="var(--background)" />
    </svg>
  );
}
