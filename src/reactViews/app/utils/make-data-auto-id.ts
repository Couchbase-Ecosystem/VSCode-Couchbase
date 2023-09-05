export default function makeDataAutoId(...args: (string | undefined)[]) {
  return function addExtraPostfix(...args2: string[]) {
    return args[0] ? [...args, ...args2].join('-') : undefined;
  };
}
