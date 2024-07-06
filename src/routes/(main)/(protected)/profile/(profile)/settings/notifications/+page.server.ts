import { fail, type Actions } from "@sveltejs/kit";
import { message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "../$types";
import { notificationsFormSchema } from "./notifications-form.svelte";

export const load: PageServerLoad = async ({ locals }) => {
  const userSettings = await prisma.userSettings.findFirst({
    where: {
      user_id: locals.user!.id
    },
    include: {
      notificationSettings: true
    }
  });

  return {
    form: await superValidate(
      {
        type: userSettings?.notificationSettings?.notificationType || "NONE",
        marketing_notifications: userSettings?.notificationSettings?.marketNotifications || false,
        social_notifications: userSettings?.notificationSettings?.socialNotifications || false
      },
      zod(notificationsFormSchema)
    )
  };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const form = await superValidate(request, zod(notificationsFormSchema));
    if (!form.valid) {
      return fail(400, {
        form
      });
    }

    const notificationType = form.data.type;
    const marketNotifications = form.data.marketing_notifications;
    const socialNotifications = form.data.social_notifications;
    const fcmTokens = form.data.fcmToken ? [form.data.fcmToken] : [];

    try {
      await prisma.userSettings.upsert({
        where: {
          user_id: locals.user!.id
        },
        create: {
          user_id: locals.user!.id,
          id: locals.user!.id,
          notificationSettings: {
            create: {
              notificationType,
              marketNotifications,
              socialNotifications
            }
          }
        },
        update: {
          notificationSettings: {
            upsert: {
              create: {
                notificationType,
                marketNotifications,
                socialNotifications
              },
              update: {
                notificationType,
                marketNotifications,
                socialNotifications
              }
            }
          }
        }
      });
    } catch (e) {
      console.error(e);
      return message(form, "Something went wrong. Please try again.", {
        status: 500
      });
    }

    if (fcmTokens.length === 0) return { form };

    try {
      const notificationSettings = await prisma.notificationSettings.findFirst({
        where: {
          userSettings: {
            user_id: locals.user!.id
          }
        }
      });

      if (notificationSettings) {
        // Prevent duplicate tokens
        const tokens = new Set([...notificationSettings.fcmTokens, ...fcmTokens]);
        try {
          await prisma.notificationSettings.update({
            where: {
              id: notificationSettings.id
            },
            data: {
              fcmTokens: {
                set: Array.from(tokens)
              }
            }
          });
        } catch (e) {
          console.error(e);
          return message(form, "Something went wrong. Please try again.", {
            status: 500
          });
        }
      }

      return {
        form
      };
    } catch (e) {
      console.error(e);
      return message(form, "Something went wrong. Please try again.", {
        status: 500
      });
    }
  }
};
