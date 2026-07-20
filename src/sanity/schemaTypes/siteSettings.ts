import { defineField, defineType, type StringRule } from "sanity";

const hexValidation = (r: StringRule) =>
  r.regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, { name: "hex color like #EB3D00" });

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    { name: "identity", title: "Your Info" },
    { name: "look", title: "Look & Feel" },
    { name: "labels", title: "Little Labels & Buttons" },
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
      description: "The line under your name on the homepage, e.g. 'Creative Director & Senior Designer'",
      type: "string",
      group: "identity",
    }),
    defineField({
      name: "heroLine",
      title: "Hero sentence",
      description: "One sentence about what you do. Appears on the homepage.",
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
      name: "phone",
      title: "Phone (optional — leave empty to hide)",
      type: "string",
      group: "identity",
    }),
    defineField({
      name: "tickerItems",
      title: "Scrolling ticker words (homepage)",
      description: "The words in the moving strip on the homepage, e.g. 'Brand identity', 'Campaigns'. Press Enter after each.",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
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

    /* ---------- little labels & buttons ---------- */
    defineField({
      name: "labels",
      title: "Little labels & buttons",
      description: "The small recurring text around the site. Leave any field empty to keep the default shown in it.",
      type: "object",
      group: "labels",
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({ name: "selectedWork", title: "Homepage: featured section label", type: "string", placeholder: "Selected work" }),
        defineField({ name: "moreProjects", title: "Homepage: index label", type: "string", placeholder: "More projects" }),
        defineField({ name: "seeAllWork", title: "Homepage: button to Work page", type: "string", placeholder: "See all work →" }),
        defineField({ name: "workIndexLabel", title: "Work page: top label", type: "string", placeholder: "Selected projects" }),
        defineField({ name: "backToWork", title: "Project page: back link", type: "string", placeholder: "← Work" }),
        defineField({ name: "nextProject", title: "Project page: next-project label", type: "string", placeholder: "Next project" }),
        defineField({ name: "getToKnowMe", title: "About: opener label", type: "string", placeholder: "Get to know me" }),
        defineField({ name: "aboutHeading", title: "About: bio heading", type: "string", placeholder: "About" }),
        defineField({ name: "contactHeading", title: "About: contact heading", type: "string", placeholder: "Contact" }),
        defineField({ name: "experienceLabel", title: "About: experience label", type: "string", placeholder: "Experience" }),
        defineField({ name: "recognitionLabel", title: "About: recognition label", type: "string", placeholder: "Recognition & education" }),
        defineField({ name: "craftLabel", title: "About: craft label", type: "string", placeholder: "Craft" }),
        defineField({ name: "softwareLabel", title: "About: software label", type: "string", placeholder: "Software" }),
        defineField({ name: "footerContact", title: "Footer: contact label", type: "string", placeholder: "Contact" }),
        defineField({ name: "backToTop", title: "Footer: back-to-top text", type: "string", placeholder: "↑ Back to top" }),
      ],
    }),

    /* ---------- fonts ---------- */
    defineField({
      name: "fontPairing",
      title: "Font preset",
      description: "Quick presets. The fields below override these if filled in.",
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
      name: "headlineGoogleFont",
      title: "Headline font — Google Fonts name (optional)",
      description:
        "Type any font name exactly as it appears on fonts.google.com (e.g. 'Bebas Neue', 'Archivo Black'). Overrides the preset for headlines.",
      type: "string",
      group: "look",
    }),
    defineField({
      name: "bodyGoogleFont",
      title: "Body font — Google Fonts name (optional)",
      description: "Any Google Fonts name (e.g. 'Inter', 'Space Grotesk'). Overrides the preset for body text.",
      type: "string",
      group: "look",
    }),
    defineField({
      name: "headlineFontFile",
      title: "Headline font — upload your own file (optional)",
      description: "Upload a .ttf, .otf, .woff or .woff2 file. Overrides everything else for headlines.",
      type: "file",
      group: "look",
      options: { accept: ".ttf,.otf,.woff,.woff2" },
    }),
    defineField({
      name: "bodyFontFile",
      title: "Body font — upload your own file (optional)",
      description: "Upload a .ttf, .otf, .woff or .woff2 file. Overrides everything else for body text.",
      type: "file",
      group: "look",
      options: { accept: ".ttf,.otf,.woff,.woff2" },
    }),

    /* ---------- colors (hex codes) ---------- */
    defineField({
      name: "colorBackground",
      title: "Background color",
      description: "Hex code, e.g. #FDFCF9 (near-white). The main page background.",
      type: "string",
      group: "look",
      validation: hexValidation,
    }),
    defineField({
      name: "colorInk",
      title: "Text / dark color",
      description: "Hex code, e.g. #09201B (deep forest green). Used for text and dark sections.",
      type: "string",
      group: "look",
      validation: hexValidation,
    }),
    defineField({
      name: "colorAccent",
      title: "Accent color",
      description: "Hex code, e.g. #EB3D00 (tangerine). Links, doodles, highlights, hovers.",
      type: "string",
      group: "look",
      validation: hexValidation,
    }),
    defineField({
      name: "colorAccent2",
      title: "Second accent",
      description: "Hex code, e.g. #F9B122 (marigold). Used sparingly.",
      type: "string",
      group: "look",
      validation: hexValidation,
    }),
    defineField({
      name: "colorSurface",
      title: "Card / surface color",
      description: "Hex code, e.g. #ECDFAB (cream). Cards, callouts, placeholder tiles.",
      type: "string",
      group: "look",
      validation: hexValidation,
    }),
  ],
  preview: { prepare: () => ({ title: "Site Settings" }) },
});
