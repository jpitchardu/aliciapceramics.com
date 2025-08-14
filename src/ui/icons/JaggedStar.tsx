export const JaggedStar = ({
  size = 24,
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
    console.warn("JaggedStar: color is required");
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
        d="M50 10 L55 35 L65 20 L60 45 L85 35 L60 55 L75 70 L50 60 L25 75 L40 55 L15 65 L40 45 L35 20 L45 35 Z"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
