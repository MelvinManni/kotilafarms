// Class-name merge for Tailwind, taught our theme's font sizes and shadows so they aren't mistaken for colours
import { createCn } from "cn/config";

export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["caption", "body", "body-lg", "title", "figure", "title-lg", "display-sm", "figure-xl", "display", "display-xl"] },
      ],
      shadow: [{ shadow: ["raise", "glass", "modal", "primary", "focus", "tabbar", "seg"] }],
    },
  },
});
