export const SimpleCross = ({
  size = 18,
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
    console.warn("SimpleCross: color is required");
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
        d="M50 25 L50 75 M25 50 L75 50"
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
};
