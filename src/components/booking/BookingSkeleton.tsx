import React from 'react';

export const BookingSkeleton: React.FC = () => {
  return (
    <div className="min-h-[100dvh] bg-dots text-foreground py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-surface rounded-[22px] p-6 border-2 border-ink shadow-hard-lg space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-[14px] bg-surface-alt border-2 border-ink" />
            <div className="w-48 h-9 bg-surface-alt rounded-lg" />
          </div>
          <div className="flex gap-2">
            <div className="w-24 h-7 bg-surface-alt rounded-full" />
            <div className="w-28 h-7 bg-surface-alt rounded-full" />
          </div>
        </div>

        {/* Steps Skeleton */}
        <div className="flex gap-2">
          <div className="flex-[2.2] h-11 bg-primary/30 rounded-full border-2 border-ink" />
          <div className="flex-1 h-11 bg-surface rounded-full border-2 border-ink" />
          <div className="flex-1 h-11 bg-surface rounded-full border-2 border-ink" />
          <div className="flex-1 h-11 bg-surface rounded-full border-2 border-ink" />
        </div>

        {/* Service Cards Skeleton */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-surface rounded-[18px] p-5 border-2 border-ink shadow-hard-md flex items-center justify-between"
            >
              <div className="space-y-2">
                <div className="w-48 h-5 bg-surface-alt rounded-md" />
                <div className="w-28 h-3.5 bg-surface-alt rounded-md" />
              </div>
              <div className="w-24 h-8 bg-sun/50 rounded-full border-2 border-ink" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
