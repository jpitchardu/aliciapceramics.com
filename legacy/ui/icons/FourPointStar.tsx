type FourPointStarProps = {
  size?: number;
  color: string;
  className?: string;
};

export function FourPointStar({
  size = 20,
  color,
  className,
}: FourPointStarProps) {
  if (!color) {
    console.warn("FourPointStar: color is required");
    return null;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`flex-shrink-0 ${className}`}
    >
      <path
        d="M50 10 L55 45 L90 50 L55 55 L50 90 L45 55 L10 50 L45 45 Z"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
