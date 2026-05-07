import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSanitize from "rehype-sanitize";
import rehypeShiki from "@shikijs/rehype";
import { sanitizeSchema } from "./sanitizeSchema";

import type { PluggableList } from "unified";

export const remarkPlugins: PluggableList = [remarkGfm];

export const rehypePlugins: PluggableList = [
  [
    rehypeShiki,
    {
      themes: { light: "github-light", dark: "github-dark" },
      defaultColor: false, // emit both via CSS variables
    },
  ],
  rehypeSlug,
  [
    rehypeAutolinkHeadings,
    {
      behavior: "append",
      properties: {
        className: ["heading-anchor"],
        ariaLabel: "anchor link",
      },
      content: { type: "text", value: "#" },
    },
  ],
  [rehypeSanitize, sanitizeSchema],
];
