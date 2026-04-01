import type { FlagDef, FlagShorthand } from "./types";
import { parseNumber } from "./util";

export const flagShorthandDefs = {
  string: { parse: String },
  "string*": { parse: String, required: true },
  "string[]": { parse: (input: string[]) => input.map(String), multiple: true },
  "string[]*": { parse: (input: string[]) => input.map(String), multiple: true, required: true },
  boolean: { parse: Boolean, type: "boolean" },
  "boolean*": { parse: Boolean, type: "boolean", required: true },
  "boolean[]": { parse: (input: boolean[]) => input.map(Boolean), multiple: true },
  "boolean[]*": { parse: (input: boolean[]) => input.map(Boolean), multiple: true, required: true },
  number: { parse: parseNumber },
  "number*": { parse: parseNumber, required: true },
  "number[]": { parse: (input: string[]) => input.map(parseNumber), multiple: true },
  "number[]*": {
    parse: (input: string[]) => input.map(parseNumber),
    multiple: true,
    required: true,
  },
} satisfies Record<FlagShorthand, FlagDef>;

export type FlagShorthandDefs = typeof flagShorthandDefs;
