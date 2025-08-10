import { HTMLInputTypeAttribute } from "react";

export type TextInputFormField = {
  _type: "input";
  label: string;
  placeholder: string;
  type: HTMLInputTypeAttribute;
  required: boolean;
};

export type TextareaFormField = {
  _type: "textarea";
  label: string;
  placeholder: string;
  required: boolean;
};

export type SelectFormField = {
  _type: "select";
  label: string;
  options: string[];
  required: boolean;
};

export type IconSelectFormField = {
  _type: "icon-select";
  label?: string;
  options: {
    label: string;
    icon: string;
  }[];
  required: true;
};

export type CardOptionsFormField = {
  _type: "card-options";
  options: {
    id: string;
    label: string;
    image: string;
    sizes?: string[];
  }[];
};

export type FormField =
  | TextInputFormField
  | TextareaFormField
  | SelectFormField
  | IconSelectFormField
  | CardOptionsFormField;

export type CommisionRequestFormStep = {
  title: string;
  body: string;
  fields: FormField[];
  infoCard?: {
    title: string;
    body: string;
  };
};

export const COMMISION_REQUEST_FORM_STEPS: CommisionRequestFormStep[] = [
  {
    title: "what should I call you?",
    body: "let's get to know each other",
    fields: [
      {
        _type: "input",
        label: "what should I call you?",
        placeholder: "your beautiful name",
        type: "text",
        required: true,
      },
      {
        _type: "input",
        label: "email (for progress pics)",
        placeholder: "you@example.com",
        type: "email",
        required: true,
      },
      {
        _type: "input",
        label: "phone (for quick updates)",
        placeholder: "(555) 123-4567",
        type: "tel",
        required: true,
      },
    ],
  },
  {
    title: "what are you looking for?",
    body: "choose the type of piece that calls to your space",
    fields: [
      {
        _type: "card-options",
        options: [
          {
            id: "matcha-bowl",
            label: "matcha bowl",
            image: "/icons/matcha_bowl.png",
          },
          {
            id: "mug-with-handle",
            label: "mug w handle",
            image: "/icons/mug_with_handle.png",
            sizes: ["8 oz", "12 oz", "16 oz"],
          },
          {
            id: "tumbler",
            label: "tumbler",
            image: "/icons/tumbler.png",
            sizes: ["8 oz", "12 oz", "16 oz"],
          },
          {
            id: "mug-without-handle",
            label: "mug w/o handle",
            image: "/icons/mug_without_handle.png",
            sizes: ["8 oz", "12 oz", "16 oz"],
          },
          {
            id: "trinket-dish",
            label: "trinket dish",
            image: "/icons/trinket_dish.png",
          },

          {
            id: "dinnerware",
            label: "dinnerware",
            image: "/icons/plate.png",
          },
          {
            id: "something-else",
            label: "something else",
            image: "/icons/vase.png",
          },
        ],
      },
    ],
  },
  {
    title: "your vision",
    body: "help me understand the feeling and function you're seekingt",
    fields: [
      {
        _type: "textarea",
        label: "describe your ideal piece",
        placeholder:
          "think textures, colors, how it fits into your daily rituals...",
        required: true,
      },
      {
        _type: "input",
        label: "timeline",
        placeholder: "when would you love to have it by?",
        type: "date",
        required: false,
      },
    ],
  },
  {
    title: "finishing touches",
    body: "any inspiration or special requests?",
    fields: [
      {
        _type: "textarea",
        label: "inspiration",
        placeholder: "inspiration board",
        required: false,
      },
      {
        _type: "input",
        label: "special considerations",
        placeholder: "any special requests?",
        type: "text",
        required: false,
      },
    ],
    infoCard: {
      title: "what happens next?",
      body: "i'll reach out within 24 hours with initial ideas and pricing. together, we'll refine the concept until it feels just right",
    },
  },
];
