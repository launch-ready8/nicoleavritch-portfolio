import { defineField, defineType } from "sanity";

export const aboutPage = defineType({
  name: "aboutPage",
  title: "About Page",
  type: "document",
  fields: [
    defineField({
      name: "headline",
      title: "Headline",
      description: "The big line at the top of the About page.",
      type: "string",
    }),
    defineField({
      name: "bio",
      title: "Bio",
      description: "A few paragraphs about you. Blank line = new paragraph.",
      type: "text",
      rows: 10,
    }),
    defineField({
      name: "portrait",
      title: "Portrait photo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "experience",
      title: "Experience",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "company", title: "Company", type: "string" }),
            defineField({ name: "role", title: "Role", type: "string" }),
            defineField({ name: "dates", title: "Dates (e.g. 2019 – Present)", type: "string" }),
            defineField({ name: "summary", title: "One-line summary (optional)", type: "text", rows: 2 }),
          ],
          preview: { select: { title: "company", subtitle: "role" } },
        },
      ],
    }),
    defineField({
      name: "skills",
      title: "Skills",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "recognition",
      title: "Awards & recognition",
      type: "array",
      of: [{ type: "string" }],
    }),
  ],
  preview: { prepare: () => ({ title: "About Page" }) },
});
