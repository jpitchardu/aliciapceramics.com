export const SparkleStar = ({
  size = 16,
  color,
  className = "",
  style,
}: {
  size?: number;
  color: string;
  className?: string;
  style?: React.CSSProperties;
}) => {
  if (!color) {
    console.warn("SparkleStar: color is required");
    return null;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`flex-shrink-0 ${className}`}
      style={style}
    >
      <path
        d="M50 15 L50 85 M15 50 L85 50 M25 25 L75 75 M75 25 L25 75"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
};
