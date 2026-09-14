export const OBSERVER_INSTRUCTIONS = {
  title: "Counter instructions",
  intro: "Counts are divided into 15-minute segments.",
  sections: [
    {
      heading: "Cyclists",
      items: [
        "Riding on-street",
        "Riding on sidewalk",
        "Riding on-street the wrong way (against traffic)",
      ],
    },
    {
      heading: "Gender",
      items: ["M — male", "F — female", "X — unknown"],
    },
    {
      heading: "Direction",
      items: ["Turning cyclists count for the direction they came from"],
    },
    {
      heading: "Helmet & Indego",
      items: [
        "Helmet — mark riders wearing a helmet",
        "Indego — mark bike share riders",
      ],
    },
  ],
  tips: ["Don't count devices without pedals"],
} as const;
