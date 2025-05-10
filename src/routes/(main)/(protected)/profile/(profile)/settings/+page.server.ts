import { fail, type Actions } from "@sveltejs/kit";
import { message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "../$types";
import { profileFormSchema } from "./profile-form.svelte";

export const load: PageServerLoad = async ({ locals }) => {
  const [userSettings, discordAccount] = await Promise.all([
    prisma.userSettings.findFirst({
      where: {
        user_id: locals.user!.id
      },
      include: {
        profileSettings: true
      }
    }),
    prisma.userOAuthProvider.findFirst({
      where: {
        userId: locals.user!.id,
        provider: "discord"
      },
      select: {
        id: true,
        providerUsername: true,
        userId: true,
        syncedAt: true
      }
    })
  ]);

  return {
    form: await superValidate(
      {
        username: locals.user!.username,
        discord: discordAccount?.providerUsername,
        email: userSettings?.profileSettings?.email || "",
        bio: userSettings?.profileSettings?.bio || "",
        urls: userSettings?.profileSettings?.urls || []
      },
      zod(profileFormSchema)
    ),
    discordAccount
  };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const form = await superValidate(request, zod(profileFormSchema));
    if (!form.valid) {
      return fail(400, {
        form
      });
    }

    const email = form.data.email;
    const bio = form.data.bio;
    const urls = form.data.urls;

    // Update user profile
    try {
      await prisma.userSettings.upsert({
        where: {
          user_id: locals.user!.id
        },
        create: {
          user_id: locals.user!.id,
          id: locals.user!.id,
          profileSettings: {
            create: {
              email,
              bio,
              urls
            }
          }
        },
        update: {
          profileSettings: {
            upsert: {
              create: {
                email,
                bio,
                urls
              },
              update: {
                email,
                bio,
                urls
              }
            }
          }
        }
      });
      return { form };
    } catch (e) {
      console.error(e);
      return message(form, "Something went wrong. Please try again.", {
        status: 500
      });
    }
  }
};
