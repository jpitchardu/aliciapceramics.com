export default function FloatingBall() {
  return (
    <>
      <div
        className="absolute top-1 left-1 size-75
   bg-clay-600/20 animate-float blur-[150px]"
      />
      <div
        className="absolute top-1/2 right-1/2 size-75
     bg-accent-orange animate-float blur-[150px]"
      />
      <div
        className="absolute -bottom-1 -right-1 size-75

      bg-sky-300 animate-float blur-[150px]"
      />
    </>
  );
}
