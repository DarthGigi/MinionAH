export function formatNumber(num: number) {
  if (num != null) {
    let suffix = "";
    if (num >= 1000000) {
      num = num / 1000000;
      suffix = "m";
    } else if (num >= 1000) {
      num = num / 1000;
      suffix = "k";
    }
    if (suffix) {
      if (num % 1 === 0) {
        return num.toFixed(0) + suffix;
      } else {
        return num.toFixed(num < 10 ? 1 : 2) + suffix;
      }
    } else {
      return num.toString();
    }
  } else {
    return "N/A";
  }
}
