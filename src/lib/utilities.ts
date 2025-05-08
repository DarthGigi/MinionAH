import type { Chat } from "$generated/prisma";
import { sanitize } from "@jill64/universal-sanitizer";
import { format } from "numerable";

export const formatNumber = (num: number | string): string => {
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
};

export const checkReadStatus = (chat: Chat, loggedInUserId: string | undefined) => {
  if (chat.user1_id === loggedInUserId) {
    return chat.user1Read;
  } else if (chat.user2_id === loggedInUserId) {
    return chat.user2Read;
  } else {
    throw new Error("Logged in user is not part of this chat");
  }
};

export const scrollToBottomAction = (node: HTMLElement, immediate = true) => {
  let stop: () => void;
  const destroy = () => {
    if (stop) {
      stop();
    }
  };
  const update = () => {
    destroy();
    function mutationCallback() {
      const { clientHeight, scrollHeight } = node;
      if (scrollHeight > clientHeight) {
        if (node.scrollTo) {
          node.scrollTo({
            behavior: "smooth",
            top: scrollHeight
          });
        } else {
          node.scrollTop = scrollHeight;
        }
      }
    }
    const mutationObserver = new MutationObserver(mutationCallback);
    mutationObserver.observe(node, { childList: true, subtree: false });
    if (immediate) mutationCallback();
    stop = () => {
      mutationObserver.disconnect();
    };
  };
  update();
  return {
    update,
    destroy
  };
};

export const sanitizeInput = (input: string): string => {
  const sanitizedInput = sanitize(input, {
    sanitizeHtml: {
      allowedTags: ["b", "i", "u", "s", "img"],
      allowedAttributes: {
        img: ["src"]
      },
      disallowedTagsMode: "discard",
      selfClosing: ["img"]
    }
  });
  return sanitizedInput;
};

export const requestNotificationPermission = (request: boolean = false) => {
  // Detect if it's running in a browser
  if (typeof window === "undefined") {
    return;
  }

  // Check if the browser supports notifications
  if (!("Notification" in window) || !Notification) {
    return;
  }

  if (request) {
    return Notification.requestPermission().then(async (permission) => {
      return permission;
    });
  }

  return Notification.permission;
};
