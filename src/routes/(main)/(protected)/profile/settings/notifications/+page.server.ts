import { message, superValidate } from "sveltekit-superforms/server";
import type { PageServerLoad } from "../$types";
import { notificationsFormSchema } from "./notifications-form.svelte";
import { fail, type Actions } from "@sveltejs/kit";

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
        marketing_emails: userSettings?.notificationSettings?.marketNotifications || false,
        social_emails: userSettings?.notificationSettings?.socialNotifications || false
      },
      notificationsFormSchema
    )
  };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const formData = await request.formData();

    const form = await superValidate(formData, notificationsFormSchema);
    if (!form.valid) {
      return fail(400, {
        form
      });
    }

    // return message(form, "Settings updated successfully.");

    const notificationType = form.data.type;
    const marketNotifications = form.data.marketing_emails;
    const socialNotifications = form.data.social_emails;
    const fcmTokens = form.data.fcmToken ? [form.data.fcmToken] : [];

    try {
      const settings = await prisma.userSettings.upsert({
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
