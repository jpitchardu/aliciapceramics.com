const stepData = {
  title: "your pottery timeline",
  body: "from conversation to creation in 4 simple steps",
  fields: [
    {
      _type: "checkbox",
      label: "I accept the terms and conditions",
    },
  ],
  infoCard: {
    title: "beware",
    body: "Because of high demand, I'm not always able to finish a piece in the time frame you're looking for.",
  },
};
export function AcceptTermsAndConditionsFormStep() {
  return (
    <>
      <div className="flex-shrink-0 px-8">
        <h2 className="font-heading text-2xl mb-1 text-earth-dark">
          {stepData.title}
        </h2>
        <p className="font-body text-sm  text-earth-dark">{stepData.body}</p>

        <div className="pt-4 space-y-4 flex flex-row ">
          <div className="flex flex-col gap-2 items-center">
            <span className="text-xl bg-(--color-red-focus) rounded-full p-2">
              💬
            </span>
            <p className=" font-label text-earth-dark text-center">
              chat
              <br />
              ~1 day
            </p>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <span className="text-xl text-(--color-red-focus) p-2">→</span>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <span className="text-xl bg-(--color-red-focus) rounded-full p-2">
              ✏️
            </span>
            <p className=" font-label text-earth-dark text-center">
              design together
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xl text-(--color-red-focus) p-2">→</span>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <span className="text-xl bg-(--color-red-focus) rounded-full p-2">
              🏺
            </span>
            <p className=" font-label text-earth-dark text-center">
              craft
              <br />
              10 wks
            </p>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <span className="text-xl text-(--color-red-focus) p-2">→</span>
          </div>
          <div className="flex flex-col gap-2 items-center">
            <span className="text-xl bg-(--color-red-focus) rounded-full p-2">
              ✨
            </span>
            <p className=" font-label text-earth-dark text-center">
              enjoy forever
            </p>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="info-panel">
            <h3 className="font-heading text-sm mb-2 text-earth-dark">
              important details
            </h3>

            <p className="font-body text-sm mb-4 text-earth-dark text-left">
              <StarIcon color="#d62411" className="inline-block mr-2" />
              <span className="font-bold">Handmade nature:</span> Each piece is
              unique with intentional variations that make it yours alone
            </p>
            <p className="font-body text-sm mb-4 text-earth-dark text-left">
              <LightbulbIcon color="#d62411" className="inline-block mr-2" />
              <span className="font-bold">Creative process:</span>Sometimes clay
              teaches us new directions—I'll always check with you about any
              adjustments
            </p>
            <p className="font-body text-sm mb-4 text-earth-dark text-left">
              <DollarIcon color="#d62411" className="inline-block mr-2" />
              <span className="font-bold">Payment:</span> I'll send an invoice
              after we've discussed the details
            </p>
          </div>
          <div className="bg-(--color-stone-disabled) rounded-lg p-4">
            <input type="checkbox" />
            <label>I accept the terms and conditions</label>
          </div>
        </div>
      </div>
    </>
  );
}

// Star Icon Component
export const StarIcon = ({ size = 12, color = "#d62411", className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    className={className}
    style={{ flexShrink: 0 }}
  >
    <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
  </svg>
);

// Lightbulb Icon Component
export const LightbulbIcon = ({
  size = 12,
  color = "#d62411",
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    className={className}
    style={{ flexShrink: 0 }}
  >
    <path d="M12,2A7,7 0 0,0 5,9C5,11.38 6.19,13.47 8,14.74V17A1,1 0 0,0 9,18H15A1,1 0 0,0 16,17V14.74C17.81,13.47 19,11.38 19,9A7,7 0 0,0 12,2M9,21A1,1 0 0,0 10,22H14A1,1 0 0,0 15,21V20H9V21Z" />
  </svg>
);

// Dollar Sign Icon Component
export const DollarIcon = ({
  size = 12,
  color = "#d62411",
  className = "",
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    className={className}
    style={{ flexShrink: 0 }}
  >
    <path d="M7,15H9C9,16.08 10.37,17 12,17C13.63,17 15,16.08 15,15C15,13.9 13.96,13.5 11.76,12.97C9.64,12.44 7,11.78 7,9C7,7.21 8.47,5.69 10.5,5.18V3H13.5V5.18C15.53,5.69 17,7.21 17,9H15C15,7.92 13.63,7 12,7C10.37,7 9,7.92 9,9C9,10.1 10.04,10.5 12.24,11.03C14.36,11.56 17,12.22 17,15C17,16.79 15.53,18.31 13.5,18.82V21H10.5V18.82C8.47,18.31 7,16.79 7,15Z" />
  </svg>
);
