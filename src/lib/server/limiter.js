// import { nanoid } from "nanoid";
// import TTLCache from "@isaacs/ttlcache";
// ///// Plugins /////////////////////////////////////////////////////////////////
// class IPRateLimiter {
//   rate;
//   constructor(rate) {
//     this.rate = rate;
//   }
//   async hash(event) {
//     return event.getClientAddress();
//   }
// }
// class IPUserAgentRateLimiter {
//   rate;
//   constructor(rate) {
//     this.rate = rate;
//   }
//   async hash(event) {
//     const ua = event.request.headers.get("user-agent");
//     if (!ua) return false;
//     return event.getClientAddress() + ua;
//   }
// }
// class CookieRateLimiter {
//   rate;
//   cookieOptions;
//   secret;
//   requirePreflight;
//   cookieId;
//   hashFunction;
//   constructor(options) {
//     this.cookieId = options.name;
//     this.secret = options.secret;
//     this.rate = options.rate;
//     this.requirePreflight = options.preflight;
//     this.hashFunction = options.hashFunction ?? defaultHashFunction;
//     this.cookieOptions = {
//       path: "/",
//       httpOnly: true,
//       maxAge: 60 * 60 * 24 * 7,
//       sameSite: "strict",
//       ...options.serializeOptions
//     };
//   }
//   async hash(event) {
//     const currentId = await this.userIdFromCookie(event.cookies.get(this.cookieId), event);
//     return currentId ? currentId : false;
//   }
//   async preflight(event) {
//     const data = event.cookies.get(this.cookieId);
//     if (data) {
//       const userId = await this.userIdFromCookie(data, event);
//       if (userId) return userId;
//     }
//     const userId = nanoid();
//     event.cookies.set(this.cookieId, userId + ";" + (await this.hashFunction(this.secret + userId)), this.cookieOptions);
//     return userId;
//   }
//   async userIdFromCookie(cookie, event) {
//     const empty = () => {
//       return this.requirePreflight ? null : this.preflight(event);
//     };
//     if (!cookie) return empty();
//     const [userId, secretHash] = cookie.split(";");
//     if (!userId || !secretHash) return empty();
//     if ((await this.hashFunction(this.secret + userId)) != secretHash) {
//       return empty();
//     }
//     return userId;
//   }
// }
// let defaultHashFunction;
// if (globalThis?.crypto?.subtle) {
//   defaultHashFunction = _subtleSha256;
// }
// async function _subtleSha256(str) {
//   const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
//   return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
// }
// export class RateLimiter {
//   store;
//   plugins;
//   onLimited;
//   hashFunction;
//   cookieLimiter;
//   static TTLTime(unit) {
//     if (unit == "ms") return 1;
//     if (unit == "s") return 1000;
//     if (unit == "m") return 60 * 1000;
//     if (unit == "h") return 60 * 60 * 1000;
//     if (unit == "15s") return 15 * 1000;
//     if (unit == "30s") return 30 * 1000;
//     if (unit == "15m") return 15 * 60 * 1000;
//     if (unit == "30m") return 30 * 60 * 1000;
//     if (unit == "2h") return 2 * 60 * 60 * 1000;
//     if (unit == "6h") return 6 * 60 * 60 * 1000;
//     if (unit == "12h") return 12 * 60 * 60 * 1000;
//     if (unit == "d") return 24 * 60 * 60 * 1000;
//     throw new Error("Invalid unit for TTLTime: " + unit);
//   }
//   /**
//    * Check if a request event is rate limited.
//    * @param {RequestEvent} event
//    * @returns {Promise<boolean>} true if request is limited, false otherwise
//    */
//   async isLimited(event) {
//     return (await this._isLimited(event)).limited;
//   }
//   /**
//    * Clear all rate limits.
//    */
//   async clear() {
//     return await this.store.clear();
//   }
//   /**
//    * Check if a request event is rate limited.
//    * @param {RequestEvent} event
//    * @returns {Promise<boolean>} true if request is limited, false otherwise
//    */
//   async _isLimited(event) {
//     let indeterminate = false;
//     for (const plugin of this.plugins) {
//       const id = await plugin.hash(event);
//       if (id === false) {
//         if (this.onLimited) {
//           const status = await this.onLimited(event, "rejected");
//           if (status === true) return { limited: false, hash: null, unit: plugin.rate[1] };
//         }
//         return { limited: true, hash: null, unit: plugin.rate[1] };
//       } else if (id === true) {
//         return { limited: false, hash: null, unit: plugin.rate[1] };
//       } else if (id === null) {
//         indeterminate = true;
//         continue;
//       } else {
//         indeterminate = false;
//       }
//       if (!id) {
//         throw new Error("Empty hash returned from rate limiter " + plugin.constructor.name);
//       }
//       const hash = await this.hashFunction(id);
//       const rate = await this.store.add(hash, plugin.rate[1]);
//       if (rate > plugin.rate[0]) {
//         if (this.onLimited) {
//           const status = await this.onLimited(event, "rate");
//           if (status === true) return { limited: false, hash, unit: plugin.rate[1] };
//         }
//         return { limited: true, hash, unit: plugin.rate[1] };
//       }
//     }
//     return {
//       limited: indeterminate,
//       hash: null,
//       unit: this.plugins[this.plugins.length - 1].rate[1]
//     };
//   }
//   constructor(options = {}) {
//     this.plugins = [...(options.plugins ?? [])];
//     this.onLimited = options.onLimited;
//     this.hashFunction = options.hashFunction ?? defaultHashFunction;
//     if (!this.hashFunction) {
//       throw new Error("No RateLimiter hash function found. Please set one with the hashFunction option.");
//     }
//     if (options.rates?.IP) this.plugins.push(new IPRateLimiter(options.rates.IP));
//     if (options.rates?.IPUA) this.plugins.push(new IPUserAgentRateLimiter(options.rates.IPUA));
//     if (options.rates?.cookie) {
//       this.plugins.push(
//         (this.cookieLimiter = new CookieRateLimiter({
//           hashFunction: this.hashFunction,
//           ...options.rates.cookie
//         }))
//       );
//     }
//     if (!this.plugins.length) {
//       throw new Error("No plugins set for RateLimiter!");
//     }
//     // Sort plugins by rate, if early cancelling
//     this.plugins.sort((a, b) => {
//       const diff = RateLimiter.TTLTime(a.rate[1]) - RateLimiter.TTLTime(b.rate[1]);
//       return diff == 0 ? a.rate[0] - b.rate[0] : diff;
//     });
//     const maxTTL = this.plugins.reduce((acc, plugin) => {
//       const time = RateLimiter.TTLTime(plugin.rate[1]);
//       return Math.max(time, acc);
//     }, 0);
//     this.store = options.store ?? new TTLStore(maxTTL, options.maxItems);
//   }
// }
// export class RetryAfterRateLimiter extends RateLimiter {
//   retryAfter;
//   constructor(options = {}, retryAfterStore) {
//     super(options);
//     this.retryAfter = retryAfterStore ?? new RetryAfterStore();
//   }
//   static toSeconds(rateMs) {
//     return Math.max(0, Math.floor(rateMs / 1000));
//   }
//   static unitToSeconds(unit) {
//     return RetryAfterRateLimiter.toSeconds(RateLimiter.TTLTime(unit));
//   }
//   /**
//    * Clear all rate limits.
//    */
//   async clear() {
//     await this.retryAfter.clear();
//     return await super.clear();
//   }
//   /**
//    * Check if a request event is rate limited.
//    * @param {RequestEvent} event
//    * @returns {Promise<limited: boolean, retryAfter: number>} Rate limit status for the event.
//    */
//   async check(event) {
//     const result = await this._isLimited(event);
//     if (!result.limited) return { limited: false, retryAfter: 0 };
//     if (result.hash === null) {
//       return {
//         limited: true,
//         retryAfter: RetryAfterRateLimiter.unitToSeconds(result.unit)
//       };
//     }
//     const retryAfter = RetryAfterRateLimiter.toSeconds((await this.retryAfter.add(result.hash, result.unit)) - Date.now());
//     return { limited: true, retryAfter };
//   }
// }
// ///// Stores ///////////////////////////////////////////////////////////////////
// class TTLStore {
//   cache;
//   constructor(maxTTL, maxItems = Infinity) {
//     this.cache = new TTLCache({
//       ttl: maxTTL,
//       max: maxItems,
//       noUpdateTTL: true
//     });
//   }
//   async clear() {
//     return this.cache.clear();
//   }
//   async add(hash, unit) {
//     const currentRate = this.cache.get(hash) ?? 0;
//     return this.set(hash, currentRate + 1, unit);
//   }
//   set(hash, rate, unit) {
//     this.cache.set(hash, rate, { ttl: RateLimiter.TTLTime(unit) });
//     return rate;
//   }
// }
// class RetryAfterStore {
//   cache;
//   constructor(maxItems = Infinity) {
//     this.cache = new TTLCache({
//       max: maxItems,
//       noUpdateTTL: true
//     });
//   }
//   async clear() {
//     return this.cache.clear();
//   }
//   async add(hash, unit) {
//     const currentRate = this.cache.get(hash);
//     if (currentRate) return this.cache.get(hash) ?? 0;
//     const ttl = RateLimiter.TTLTime(unit);
//     const retryAfter = Date.now() + ttl;
//     this.cache.set(hash, retryAfter, { ttl });
//     return retryAfter;
//   }
// }
