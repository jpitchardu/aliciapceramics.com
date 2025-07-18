export default function CommisionsPage() {
  return (
    <div className="relative w-96 mh-m bg-cream/95 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-sky-300/20 transition-all duration-300 cursor-pointer flex flex-col items-start justify-start font-bold overflow-hidden">
      <div className="absolute inset-0 bg-gradient-primary opacity-20 focus:opacity-20 transition-opacity duration-300 rounded-xl" />
      <ProgressBar />
      <h2 className="text-2xl font-medium mb-2">hey friend! 👋</h2>
      <p className="text-sm opacity-70 mb-6">let's get to know each other</p>
      <div className="flex flex-col w-full z-10 space-y-5">
        <TextInput
          label="what should I call you?"
          placeholder="your beautiful name"
        />
        <TextInput
          label="email (for progress pics)"
          placeholder="you@example.com"
        />
        <TextInput
          label="phone (for quick updates)"
          placeholder="(555) 123-4567"
        />
      </div>
      <FormFooter />
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
    <div className=" w-full">
      <label className="block text-sm font-medium mb-2">{label}</label>
      <input
        className="w-full px-5 py-4 rounded-2xl bg-warm-gray-100 border-2 border-transparent focus:border-sky-300 focus:bg-cream transition-all outline-none"
        placeholder={placeholder}
      />
    </div>
  );
};

const ProgressBar = () => (
  <div className="flex justify-center gap-3 mb-8 w-full">
    <div className="w-8 h-2.5 rounded-full bg-gradient-primary"></div>
    <div className="w-2.5 h-2.5 rounded-full bg-clay-600"></div>
    <div className="w-2.5 h-2.5 rounded-full bg-warm-gray-200"></div>
  </div>
);

const FormFooter = () => (
  <div className="flex justify-end mt-8 w-full">
    <button className="px-8 py-4 bg-charcoal text-cream rounded-full font-medium hover:-translate-y-0.5 hover:shadow-lg transition-all">
      let's talk pottery →
    </button>
  </div>
);
