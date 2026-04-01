export const parseNumber = (value: string) => {
  const num = Number(value);
  if (Number.isNaN(num)) {
    throw new Error(`Invalid number '${value}'.`);
  }
  return num;
};

const camelRegex = /([a-z])([A-Z]+)/g;
export const camelToKebab = (str: string) => str.replace(camelRegex, "$1-$2").toLowerCase();
