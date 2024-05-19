/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

const sw = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self));
import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

const firebase =
  getApps().length === 0
    ? initializeApp({
        apiKey: "AIzaSyAf_6kCvscIq1XioCJJh9aVTOHODzol8ps",
        authDomain: "minion-ah.firebaseapp.com",
        projectId: "minion-ah",
        storageBucket: "minion-ah.appspot.com",
        messagingSenderId: "495263698912",
        appId: "1:495263698912:web:fa28e5413869aa0ab2e585",
        measurementId: "G-F6JB6L9PDG"
      })
    : getApp();

const messaging = getMessaging(firebase);
onBackgroundMessage(messaging, async (/** @type {import("firebase/messaging").MessagePayload} */ payload) => {
  const notification = /** @type {import("firebase/messaging").NotificationPayload} */ (payload.notification);
  const notificationTitle = notification?.title ?? "MinionAH";
  const notificationOptions = /** @type {NotificationOptions} */ ({
    body: notification?.body ?? "New message from MinionAH",
    icon: notification?.icon ?? "https://minionah.com/favicon.png",
    image: notification?.image ?? "https://minionah.com/favicon.png"
  });

  if (navigator.setAppBadge) {
    if (payload.data.unreadCount && payload.data.unreadCount > 0) {
      if (!isNaN(Number(payload.data.unreadCount))) await navigator.setAppBadge(Number(payload.data.unreadCount));
    } else {
      await navigator.clearAppBadge();
    }
  }

  await sw.registration.showNotification(notificationTitle, notificationOptions);
});

// A simple, no-op service worker that takes immediate control.
sw.addEventListener("install", () => {
  console.log("Service worker installed.");
  // Skip over the "waiting" lifecycle state, to ensure that our
  // new service worker is activated immediately, even if there's
  // another tab open controlled by our older service worker code.
  sw.skipWaiting();
});

sw.addEventListener("activate", () => {
  console.log("Service worker activated.");
  // Optional: Get a list of all the current open windows/tabs under
  // our service worker's control, and force them to reload.
  // This can "unbreak" any open windows/tabs as soon as the new
  // service worker activates, rather than users having to manually reload.
  sw.clients.matchAll({ type: "window" }).then((windowClients) => {
    windowClients.forEach((windowClient) => {
      windowClient.navigate(windowClient.url);
    });
  });
});
