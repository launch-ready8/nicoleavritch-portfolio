"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { colorInput } from "@sanity/color-input";
import { projectId, dataset } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schemaTypes";

export default defineConfig({
  name: "nicole-avritch-portfolio",
  title: "Nicole's Portfolio",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("✦ Projects")
              .child(
                S.documentTypeList("project")
                  .title("Projects")
                  .defaultOrdering([{ field: "order", direction: "asc" }])
              ),
            S.divider(),
            S.listItem()
              .title("About Page")
              .child(S.document().schemaType("aboutPage").documentId("aboutPage")),
            S.listItem()
              .title("Site Settings (colors, fonts, contact)")
              .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
          ]),
    }),
    colorInput(),
  ],
  schema: { types: schemaTypes },
});
