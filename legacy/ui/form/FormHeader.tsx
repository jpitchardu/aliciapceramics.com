export function FormHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex-shrink-0">
      <h2 className="font-heading text-2xl mb-1 text-earth-dark">{title}</h2>
      <p className="font-body text-sm mb-4 text-earth-dark">{description}</p>
    </div>
  );
}
