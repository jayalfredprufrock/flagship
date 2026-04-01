import { type ParseArgsOptionDescriptor, parseArgs } from "node:util";
import { flagShorthandDefs } from "./constants";
import type { FlagDef, FlagDefs, FlagShorthand, ParsedFlags, ParseOptions } from "./types";
import { camelToKebab } from "./util";

export const parseFlags = async <const F extends FlagDefs<F>>(
  flags: F,
  parseOptions?: ParseOptions,
): Promise<ParsedFlags<F>> => {
  const resolvedFlags: Record<string, FlagDef> = Object.fromEntries(
    Object.entries(flags as Record<string, FlagShorthand | FlagDef>).map(([name, def]) => {
      const resolvedDef = typeof def === "string" ? flagShorthandDefs[def] : def;
      return [name, resolvedDef];
    }),
  );

  const args = Object.fromEntries<ParseArgsOptionDescriptor>(
    Object.entries(resolvedFlags).flatMap(([name, def]) => {
      const opt: ParseArgsOptionDescriptor = {
        type: def.type ?? "string",
        multiple: def.multiple ?? false,
      };

      if (def.short) {
        opt.short = def.short;
      }

      return [
        [name, opt],
        [camelToKebab(name), opt],
      ];
    }),
  );

  const { values } = parseArgs({
    allowNegative: true,
    strict: true,
    ...parseOptions,
    options: args,
  });

  const parsedFlags: Record<string, any> = {};
  for (const [name, flag] of Object.entries(resolvedFlags)) {
    const context = { flags: { ...parsedFlags }, name };
    const inputValue = values[name] ?? values[camelToKebab(name)];
    if (inputValue === undefined) {
      parsedFlags[name] =
        typeof flag.default === "function" ? await flag.default(context) : flag.default;
      if (flag.required && parsedFlags[name] === undefined) {
        throw new Error(`Missing required flag '${name}'`);
      }
    } else {
      parsedFlags[name] = await flag.parse(inputValue as never, context);
    }

    await flag.validate?.(parsedFlags[name], context);
  }

  return parsedFlags as never;
};
