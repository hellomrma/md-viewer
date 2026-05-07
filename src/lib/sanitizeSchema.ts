import { defaultSchema, type Options as Schema } from "rehype-sanitize";

const merge = <T,>(base: T[] | undefined, extra: T[]): T[] =>
  Array.from(new Set([...(base ?? []), ...extra]));

export const sanitizeSchema: Schema = {
  ...defaultSchema,
  clobberPrefix: "",
  attributes: {
    ...defaultSchema.attributes,
    code: merge(defaultSchema.attributes?.code as string[] | undefined, ["className", "class"]),
    pre: merge(defaultSchema.attributes?.pre as string[] | undefined, [
      "className",
      "class",
      "style",
      "tabIndex",
      "dataLanguage",
    ]),
    span: merge(defaultSchema.attributes?.span as string[] | undefined, [
      "className",
      "class",
      "style",
    ]),
    div: merge(defaultSchema.attributes?.div as string[] | undefined, ["className", "class"]),
    h1: merge(defaultSchema.attributes?.h1 as string[] | undefined, ["id"]),
    h2: merge(defaultSchema.attributes?.h2 as string[] | undefined, ["id"]),
    h3: merge(defaultSchema.attributes?.h3 as string[] | undefined, ["id"]),
    h4: merge(defaultSchema.attributes?.h4 as string[] | undefined, ["id"]),
    h5: merge(defaultSchema.attributes?.h5 as string[] | undefined, ["id"]),
    h6: merge(defaultSchema.attributes?.h6 as string[] | undefined, ["id"]),
    a: merge(defaultSchema.attributes?.a as string[] | undefined, [
      "href",
      "ariaLabel",
      "ariaHidden",
      "className",
    ]),
    input: merge(defaultSchema.attributes?.input as string[] | undefined, [
      "type",
      "checked",
      "disabled",
    ]),
  },
};
