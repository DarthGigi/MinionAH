import { format } from "numerable";

export function formatNumber(num: number | string): string {
  // if the number is a string, parse it to a number
  if (typeof num === "string") {
    num = parseFloat(num);
  }
  // get the second digit
  const secondDigit = num.toString().charAt(1);
  // get the third digit
  const thirdDigit = num.toString().charAt(2);
  let formatPattern: string;
  if (secondDigit === "0" && thirdDigit === "0") {
    formatPattern = "0a";
  } else if (secondDigit !== "0" && thirdDigit === "0") {
    formatPattern = "0.0a";
  } else {
    formatPattern = "0.00a";
  }
  // if number is in trillions, billions, millions, thousands, format it to 1 decimal place if the decimal is 0, otherwise format it to 0 decimal places
  if (num >= 1000000) {
    return format(num, formatPattern);
  } else {
    return format(num, "0a");
  }
}
