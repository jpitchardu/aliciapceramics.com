export default function CommisionsPage() {
  return (
    <div className="relative w-96 min-h-min p-8 rounded-xl shadow-heavy bg-white transition-all duration-300 cursor-pointer flex flex-col items-start justify-start font-bold overflow-hidden">
      <div className="absolute inset-0 bg-gradient-primary opacity-0 hover:opacity-20 transition-opacity duration-300 rounded-xl"></div>
      <p className="z-10 text-2xl mb-1">hey friend! 👋</p>
      <p className="z-10 text-sm text-charcoal mb-3 opacity-70">
        let's make something together!
      </p>
      <TextInput
        label="what should I call you?"
        placeholder="your beautiful name"
      />
      <TextInput
        label="email (for progress pics)"
        placeholder="you@example.com"
      />
      <TextInput
        label="phone (for quiick updates)"
        placeholder="(555) 123-4567"
      />
    </div>
  );
}

const TextInput = ({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) => {
  return (
    <div className="flex flex-col w-full">
      <label className="text-xs text-charcoal mb-1">{label}</label>
      <input
        className="w-full p-2 rounded-md bg-warm-gray-50 text-charcoal transition-all duration-300 hover:bg-warm-gray-100"
        placeholder={placeholder}
      />
    </div>
  );
};
