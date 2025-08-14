export const BurstStar = ({
  size = 20,
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
    console.warn("BurstStar: color is required");
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
        d="M50 5 L58 35 L75 15 L65 45 L95 25 L65 65 L85 85 L50 70 L15 90 L35 65 L5 75 L35 45 L25 15 L42 35 Z"
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
