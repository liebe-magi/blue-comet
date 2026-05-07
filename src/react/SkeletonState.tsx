'use client';

export interface SkeletonStateProps {
  className?: string;
  rows?: number;
}

export function SkeletonState({ className, rows = 2 }: SkeletonStateProps) {
  return (
    <div className={className} aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="bluecomet-skeleton-row">
          <div className="bluecomet-skeleton-avatar" />
          <div className="bluecomet-skeleton-lines">
            <div className="bluecomet-skeleton-line" />
            <div className="bluecomet-skeleton-line" />
          </div>
        </div>
      ))}
    </div>
  );
}
