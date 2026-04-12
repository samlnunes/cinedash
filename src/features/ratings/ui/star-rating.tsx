import { useState, useRef, useCallback } from "react";
import { Star } from "lucide-react";
import {
  useMyRating,
  useSetRating,
  useRemoveRating,
} from "../hooks/use-ratings";

interface StarRatingProps {
  tmdbId: number;
  size?: "sm" | "md";
}

function HalfStar({
  value,
  display,
  iconSize,
}: {
  value: number;
  display: number;
  iconSize: string;
}) {
  const fill = display >= value ? 1 : display >= value - 0.5 ? 0.5 : 0;

  return (
    <div className="relative">
      <Star className={`${iconSize} text-muted-foreground/30`} />
      {fill > 0 && (
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: fill === 1 ? "100%" : "50%" }}
        >
          <Star className={`${iconSize} fill-yellow-400 text-yellow-400`} />
        </div>
      )}
    </div>
  );
}

function getValueFromTouch(container: HTMLElement, clientX: number): number {
  const rect = container.getBoundingClientRect();
  const x = clientX - rect.left;
  const starWidth = rect.width / 5;
  const starIndex = Math.floor(x / starWidth);
  const withinStar = x - starIndex * starWidth;
  const isLeftHalf = withinStar < starWidth / 2;
  const value = starIndex + (isLeftHalf ? 0.5 : 1);
  return Math.max(0.5, Math.min(5, value));
}

export function StarRating({ tmdbId, size = "md" }: StarRatingProps) {
  const { data: existing } = useMyRating(tmdbId);
  const setRating = useSetRating();
  const removeRating = useRemoveRating();
  const [hover, setHover] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentRating = existing?.rating ?? 0;
  const display = hover || currentRating;
  const iconSize = size === "sm" ? "size-4" : "size-5";
  const disabled = setRating.isPending || removeRating.isPending;

  const handleClick = (value: number) => {
    if (value === currentRating) {
      removeRating.mutate(tmdbId);
    } else {
      setRating.mutate({ tmdbId, rating: value });
    }
  };

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (disabled || !containerRef.current) return;
      const val = getValueFromTouch(containerRef.current, e.touches[0].clientX);
      setHover(val);
    },
    [disabled],
  );

  const handleTouchEnd = useCallback(() => {
    if (disabled || hover === 0) return;
    handleClick(hover);
    setHover(0);
  }, [disabled, hover]);

  return (
    <div
      ref={containerRef}
      className="flex items-center gap-0.5 touch-none"
      onMouseLeave={() => setHover(0)}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          className="transition-transform hover:scale-110"
          onMouseMove={(e) => {
            if (disabled) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const isLeftHalf = e.clientX - rect.left < rect.width / 2;
            setHover(isLeftHalf ? value - 0.5 : value);
          }}
          onClick={(e) => {
            if (disabled) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const isLeftHalf = e.clientX - rect.left < rect.width / 2;
            handleClick(isLeftHalf ? value - 0.5 : value);
          }}
          disabled={disabled}
        >
          <HalfStar value={value} display={display} iconSize={iconSize} />
        </button>
      ))}
    </div>
  );
}

export function StarDisplay({
  rating,
  iconSize = "size-4",
}: {
  rating: number;
  iconSize?: string;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((value) => (
        <HalfStar
          key={value}
          value={value}
          display={rating}
          iconSize={iconSize}
        />
      ))}
    </div>
  );
}
