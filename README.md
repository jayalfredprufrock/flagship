<div align="center">
  <img src="./flagship-logo.png" alt="Flagship" width="400" />

[![npm version](https://img.shields.io/npm/v/@jayalfredprufrock/flagship)](https://www.npmjs.com/package/@jayalfredprufrock/flagship)
[![license](https://img.shields.io/npm/l/@jayalfredprufrock/flagship)](./LICENSE)
[![gzip size](https://img.shields.io/bundlephobia/minzip/@jayalfredprufrock/flagship)](https://bundlephobia.com/package/@jayalfredprufrock/flagship)

</div>

---

Type-safe CLI flag parsing built on Node's built-in `util.parseArgs`. Fully infers output types from flag definitions, supports custom parsing and validation (sync or async), and has zero runtime dependencies.

## Installation

```sh
npm install @jayalfredprufrock/flagship
```

## Usage

### Shorthands

For common cases, use a shorthand string instead of a full flag definition:

```ts
import { parseFlags } from "@jayalfredprufrock/flagship";

const flags = await parseFlags({
  name: "string*", // string  (required)
  env: "string", // string | undefined
  port: "number", // number | undefined
  verbose: "boolean", // boolean | undefined
  tags: "string[]", // string[] | undefined
});
```

The `*` suffix marks a flag as required. The `[]` suffix accepts multiple values (flag can be repeated). Both can be combined: `'number[]*'`.

### Full example

```ts
import { parseFlags } from "@jayalfredprufrock/flagship";

const flags = await parseFlags(
  {
    env: {
      parse: (value) => value as "development" | "production" | "test",
      required: true,
      validate: (value) => {
        if (!["development", "production", "test"].includes(value)) {
          throw new Error(`Invalid --env: ${value}`);
        }
      },
    },
    port: {
      parse: (value) => parseInt(value, 10),
      default: (ctx) => (ctx.flags.env === "production" ? 80 : 3000),
    },
    verbose: {
      type: "boolean",
      parse: Boolean,
      short: "v",
    },
    outputDir: {
      parse: async (value) => resolveOutputDir(value),
      default: "./dist",
    },
  },
  { allowPositionals: true },
);

// flags.env       → 'development' | 'production' | 'test'
// flags.port      → number
// flags.verbose   → boolean | undefined
// flags.outputDir → string
```

## API

### `parseFlags(flags, options?)`

```ts
parseFlags<F>(flags: F, options?: ParseOptions): Promise<ParsedFlags<F>>
```

Parses `process.argv` (or a custom `args` array) and returns a fully-typed object of resolved flag values. Flags are processed in definition order; each flag's `default` and `validate` callbacks receive the flags resolved so far via `context.flags`.

camelCase flag names are automatically aliased to kebab-case — `outputDir` is accepted as both `--outputDir` and `--output-dir`.

`strict` mode and `allowNegative` (for `--no-<flag>` booleans) are enabled by default.

---

### `FlagDef`

```ts
interface FlagDef<Input, Output> {
  parse: (input: Input, context: FlagContext) => Output | Promise<Output>;
  type?: "string" | "boolean"; // default: 'string'
  multiple?: boolean; // accept repeated flag values
  required?: boolean; // throw if not provided and no default resolves
  short?: string; // single-char alias, e.g. 'v' → -v
  default?: Output | ((context: FlagContext) => Output | Promise<Output>);
  validate?: (output: Output, context: FlagContext) => void | Promise<void>;
}
```

`Input` is inferred automatically:

- `string` when `type` is `'string'` (default)
- `boolean` when `type` is `'boolean'`
- `string[]` / `boolean[]` when `multiple: true`

`Output` is inferred from the return type of `parse`.

Throw from `validate` to signal an invalid value. Throwing from `parse` is also fine for parse-time errors.

---

### `FlagContext`

```ts
interface FlagContext {
  name: string; // name of the flag being processed
  flags: Record<string, any>; // flags fully resolved so far (definition order)
}
```

Passed as the second argument to `parse` and `validate`, and as the sole argument to `default` when it is a function. Useful for computing derived defaults or cross-field validation.

---

### `ParseOptions`

All fields from Node.js [`ParseArgsConfig`](https://nodejs.org/api/util.html#utilparseargsconfig) except `options`:

| Option             | Default                 | Description                                  |
| ------------------ | ----------------------- | -------------------------------------------- |
| `args`             | `process.argv.slice(2)` | Override the argv to parse (useful in tests) |
| `allowPositionals` | `false`                 | Allow positional arguments                   |
| `allowNegative`    | `true`                  | Allow `--no-<flag>` negation syntax          |
| `strict`           | `true`                  | Throw on unknown flags                       |
| `tokens`           | `false`                 | Include token metadata in parse output       |

---

### Shorthands

Shorthand strings expand to a predefined `FlagDef`. The `*` suffix sets `required: true`; the `[]` suffix sets `multiple: true`.

| Shorthand      | Output type              |
| -------------- | ------------------------ |
| `'string'`     | `string \| undefined`    |
| `'string*'`    | `string`                 |
| `'string[]'`   | `string[] \| undefined`  |
| `'string[]*'`  | `string[]`               |
| `'boolean'`    | `boolean \| undefined`   |
| `'boolean*'`   | `boolean`                |
| `'boolean[]'`  | `boolean[] \| undefined` |
| `'boolean[]*'` | `boolean[]`              |
| `'number'`     | `number \| undefined`    |
| `'number*'`    | `number`                 |
| `'number[]'`   | `number[] \| undefined`  |
| `'number[]*'`  | `number[]`               |

Number shorthands parse the raw string value and throw if it is not a valid number.

---

### Utilities

**`parseNumber(value: string): number`** — Parses a string to a number; throws on `NaN`. Used internally by number shorthands, but exported for use in custom `FlagDef.parse` functions.

**`camelToKebab(str: string): string`** — Converts a camelCase string to kebab-case. Used internally to alias flag names.

## License

[MIT](./LICENSE)
