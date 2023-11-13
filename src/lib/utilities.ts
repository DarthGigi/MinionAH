import { format } from "numerable";

export function formatNumber(num: number | string): string {
  // if the number is a string, parse it to a number
  if (typeof num === "string") {
    num = parseInt(num);
  }

  // check the last digits, if the last 2 or 3 digits are 0, don't format
  const lastDigits = num % 1000;
  if (lastDigits === 0 || lastDigits === 0o0 || lastDigits === 0o00) {
    return format(num, "0a");
  }
  // if there are only 1, 2 or 3 digits, don't format
  else if (num < 1000) {
    return format(num, "0a");
  } else return format(num, "0.00a");
}
