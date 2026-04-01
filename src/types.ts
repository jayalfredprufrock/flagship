import type { ParseArgsConfig } from "node:util";
import type { FlagShorthandDefs } from "./constants";

export interface FlagContext {
  flags: Record<string, any>;
  name: string;
}

export type FlagParseFunc<Input, Output> =
  | ((input: Input, context: FlagContext) => Promise<Output>)
  | ((input: Input, context: FlagContext) => Output);

export type FlagDefault<Output> =
  | Output
  | ((context: FlagContext) => Output)
  | ((context: FlagContext) => Promise<Output>);
export type FlagValidate<Output> =
  | ((output: Output, context: FlagContext) => void)
  | ((output: Output, context: FlagContext) => Promise<void>);

export type FlagType = "string" | "boolean" | "number";
export type FlagShorthand = FlagType | `${FlagType}[]` | `${FlagType}*` | `${FlagType}[]*`;

export interface FlagDef<
  Input = any,
  Output = any,
  Type = "string" | "boolean",
  Multiple = boolean,
> {
  parse: FlagParseFunc<Input, Output>;
  type?: Type;
  multiple?: Multiple;
  required?: boolean;
  short?: string;
  default?: FlagDefault<NoInfer<Output>>;
  validate?: FlagValidate<NoInfer<Output>>;
}

export type FlagDefs<F> = {
  [K in keyof F]: F[K] extends FlagShorthand
    ? F[K]
    : F[K] extends FlagDef<any, infer Output, infer Type, infer Multiple>
      ? Type extends "boolean"
        ? Multiple extends true
          ? FlagDef<boolean[], Output, "boolean", true>
          : FlagDef<boolean, Output, "boolean", false>
        : Multiple extends true
          ? FlagDef<string[], Output, "string", true>
          : FlagDef<string, Output, "string", false>
      : never;
};

export type ParsedFlag<F> =
  F extends FlagDef<any, infer Output, any, any>
    ? F["required"] extends true
      ? Awaited<Output>
      : undefined extends F["default"]
        ? Awaited<Output> | undefined
        : Awaited<Output>
    : never;

export type ParsedFlags<F> = {
  [K in keyof F]: ParsedFlag<F[K] extends FlagShorthand ? FlagShorthandDefs[F[K]] : F[K]>;
};

export interface ParseOptions extends Omit<ParseArgsConfig, "options"> {}
