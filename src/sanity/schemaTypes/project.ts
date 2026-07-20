import { defineArrayMember, defineField, defineType } from "sanity";

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Project title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Web address",
      description: "Click 'Generate' after typing the title — this becomes the page URL.",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "featured",
      title: "Feature on homepage?",
      description: "Featured projects show large on the homepage.",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "order",
      title: "Order",
      description: "Lower numbers appear first on the Work page. (1 = first)",
      type: "number",
      initialValue: 99,
    }),
    defineField({
      name: "client",
      title: "Client / brand",
      type: "string",
    }),
    defineField({
      name: "year",
      title: "Year(s)",
      description: "e.g. '2020–2023' or '2024'",
      type: "string",
    }),
    defineField({
      name: "role",
      title: "Your role",
      description: "e.g. 'Co-Founder & Designer' or 'Art Direction, Packaging'",
      type: "string",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      description: "Short labels like 'Branding', 'Packaging', 'Motion'. Press Enter after each.",
      type: "array",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "intro",
      title: "Intro paragraph",
      description: "1–3 sentences that set up the project. Shows at the top of the page.",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "heroImage",
      title: "Cover image",
      description: "The main image — used on cards and at the top of the project page.",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "blocks",
      title: "Page content",
      description: "Build the page by stacking blocks — drag to reorder.",
      type: "array",
      of: [
        defineArrayMember({
          name: "textSection",
          title: "Text section",
          type: "object",
          fields: [
            defineField({ name: "heading", title: "Heading (optional)", type: "string" }),
            defineField({ name: "body", title: "Text", type: "text", rows: 6 }),
          ],
          preview: {
            select: { title: "heading", subtitle: "body" },
            prepare: ({ title, subtitle }) => ({
              title: title || "Text section",
              subtitle: subtitle?.slice(0, 60),
            }),
          },
        }),
        defineArrayMember({
          name: "fullBleedImage",
          title: "Big image (full width)",
          type: "object",
          fields: [
            defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true } }),
            defineField({ name: "caption", title: "Caption (optional)", type: "string" }),
          ],
          preview: {
            select: { media: "image", title: "caption" },
            prepare: ({ media, title }) => ({ title: title || "Big image", media }),
          },
        }),
        defineArrayMember({
          name: "imageGrid",
          title: "Image grid",
          type: "object",
          fields: [
            defineField({
              name: "images",
              title: "Images",
              type: "array",
              of: [{ type: "image", options: { hotspot: true } }],
            }),
            defineField({
              name: "columns",
              title: "Columns",
              type: "number",
              options: { list: [2, 3, 4] },
              initialValue: 2,
            }),
          ],
          preview: {
            select: { images: "images" },
            prepare: ({ images }) => ({ title: `Image grid (${images?.length || 0} images)` }),
          },
        }),
        defineArrayMember({
          name: "videoEmbed",
          title: "Video",
          type: "object",
          fields: [
            defineField({
              name: "url",
              title: "Video link",
              description: "YouTube or Vimeo link, or a direct .mp4 link.",
              type: "url",
            }),
            defineField({ name: "caption", title: "Caption (optional)", type: "string" }),
          ],
          preview: {
            select: { title: "caption", subtitle: "url" },
            prepare: ({ title, subtitle }) => ({ title: title || "Video", subtitle }),
          },
        }),
        defineArrayMember({
          name: "statsRow",
          title: "Numbers / results",
          type: "object",
          fields: [
            defineField({
              name: "stats",
              title: "Stats",
              type: "array",
              of: [
                {
                  type: "object",
                  fields: [
                    defineField({ name: "value", title: "Number (e.g. '40K+')", type: "string" }),
                    defineField({ name: "label", title: "Label (e.g. 'streams')", type: "string" }),
                  ],
                },
              ],
            }),
          ],
          preview: {
            select: { stats: "stats" },
            prepare: ({ stats }) => ({ title: `Numbers (${stats?.length || 0})` }),
          },
        }),
        defineArrayMember({
          name: "logoList",
          title: "Name / logo list",
          type: "object",
          fields: [
            defineField({ name: "heading", title: "Heading (e.g. 'Featured guests')", type: "string" }),
            defineField({
              name: "items",
              title: "Names",
              type: "array",
              of: [{ type: "string" }],
              options: { layout: "tags" },
            }),
          ],
          preview: {
            select: { title: "heading" },
            prepare: ({ title }) => ({ title: title || "Name list" }),
          },
        }),
      ],
    }),
    defineField({
      name: "credits",
      title: "Credits (optional)",
      description: "e.g. 'Photography: Jane Doe · Production: Studio X'",
      type: "text",
      rows: 3,
    }),
  ],
  orderings: [
    {
      title: "Display order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "client", media: "heroImage" },
  },
});
