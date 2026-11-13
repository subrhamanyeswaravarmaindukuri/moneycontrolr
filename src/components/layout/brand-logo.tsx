import { cn } from "@/lib/utils";

interface BrandEmblemProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Renders the official MoneyControlr MC monogram emblem from the supplied brand asset.
 * Uses explicit dimensions on a clean white surface to preserve original proportions,
 * crisp edge contrast on light or dark backgrounds, and zero layout shift.
 */
export function BrandEmblem({ size = "md", className }: BrandEmblemProps) {
  const sizeClasses = {
    sm: "w-9 h-9 rounded-lg p-1",
    md: "w-10 h-10 sm:w-11 sm:h-11 rounded-xl p-1",
    lg: "w-12 h-12 rounded-2xl p-1.5",
  };

  const pixelSize = size === "sm" ? 36 : size === "lg" ? 48 : 44;

  return (
    <div
      className={cn(
        "bg-white border border-border/80 flex items-center justify-center shrink-0 shadow-sm overflow-hidden",
        sizeClasses[size],
        className
      )}
    >
      <img
        src="/images/mc-emblem.png"
        alt="MoneyControlr logo"
        width={pixelSize}
        height={pixelSize}
        loading="eager"
        decoding="async"
        className="w-full h-full object-contain select-none"
      />
    </div>
  );
}

