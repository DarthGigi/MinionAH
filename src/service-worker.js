/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

const sw = /** @type {ServiceWorkerGlobalScope} */ (/** @type {unknown} */ (self));
// importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
// importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");
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
  console.log("Received background message ", payload);
  const notificationTitle = notification?.title ?? "MinionAH";
  const notificationOptions = /** @type {NotificationOptions} */ ({
    body: notification?.body ?? "New message from MinionAH",
    icon: notification?.icon ?? "https://minionah.com/assets/images/favicons/favicon.png",
    image: notification?.image ?? "https://minionah.com/assets/images/favicons/favicon.png"
  });

  sw.registration.showNotification(notificationTitle, notificationOptions);
});

sw.addEventListener("notificationclick", (event /** @type {NotificationEvent} */) => {
  const notification /** @type {Notification} */ = event.notification;
  const action /** @type {string} */ = event.action;

  if (action.startsWith("view-")) {
    const username = action.split("-")[1];
    sw.clients.openWindow(`https://minionah.com/${username}/chat`);
  } else {
    sw.clients.openWindow("https://minionah.com");
  }
  notification.close();
});

// A simple, no-op service worker that takes immediate control.
sw.addEventListener("install", () => {
  // Skip over the "waiting" lifecycle state, to ensure that our
  // new service worker is activated immediately, even if there's
  // another tab open controlled by our older service worker code.
  sw.skipWaiting();
});

sw.addEventListener("activate", () => {
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
