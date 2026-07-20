import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    { name: "identity", title: "Your Info" },
    { name: "look", title: "Look & Feel" },
  ],
  fields: [
    defineField({
      name: "siteTitle",
      title: "Your name",
      description: "Shows up in the big header and the browser tab.",
      type: "string",
      group: "identity",
      initialValue: "Nicole Avritch",
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      description: "The short line under your name on the homepage. e.g. 'Senior Designer & Brand Strategist'",
      type: "string",
      group: "identity",
    }),
    defineField({
      name: "heroLine",
      title: "Hero sentence",
      description: "One friendly sentence about what you do. Appears on the homepage.",
      type: "text",
      rows: 3,
      group: "identity",
    }),
    defineField({
      name: "email",
      title: "Contact email",
      type: "string",
      group: "identity",
    }),
    defineField({
      name: "socials",
      title: "Social links",
      type: "array",
      group: "identity",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label (e.g. Instagram)", type: "string" }),
            defineField({ name: "url", title: "Link", type: "url" }),
          ],
        },
      ],
    }),
    defineField({
      name: "fontPairing",
      title: "Font style",
      description: "Changes the fonts across the whole site instantly.",
      type: "string",
      group: "look",
      options: {
        list: [
          { title: "Editorial Bold — big condensed headlines (default)", value: "editorial" },
          { title: "Poster — tall cinematic headlines", value: "poster" },
          { title: "Grotesque — wide modernist headlines", value: "grotesque" },
        ],
        layout: "radio",
      },
      initialValue: "editorial",
    }),
    defineField({
      name: "colorBackground",
      title: "Background color",
      description: "The main page background (default: warm off-white).",
      type: "color",
      group: "look",
      options: { disableAlpha: true },
    }),
    defineField({
      name: "colorInk",
      title: "Text / dark color",
      description: "Used for text and dark sections (default: deep forest green).",
      type: "color",
      group: "look",
      options: { disableAlpha: true },
    }),
    defineField({
      name: "colorAccent",
      title: "Accent color",
      description: "The punchy color — links, highlights, hovers (default: tangerine).",
      type: "color",
      group: "look",
      options: { disableAlpha: true },
    }),
    defineField({
      name: "colorAccent2",
      title: "Second accent",
      description: "Used sparingly for tags and details (default: marigold yellow).",
      type: "color",
      group: "look",
      options: { disableAlpha: true },
    }),
    defineField({
      name: "colorSurface",
      title: "Card / surface color",
      description: "Background for cards and callouts (default: cream).",
      type: "color",
      group: "look",
      options: { disableAlpha: true },
    }),
  ],
  preview: { prepare: () => ({ title: "Site Settings" }) },
});
