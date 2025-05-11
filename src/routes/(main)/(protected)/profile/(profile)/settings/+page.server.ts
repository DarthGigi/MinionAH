import { verify, type Options } from "@node-rs/argon2";
import { fail, type Actions } from "@sveltejs/kit";
import { message, superValidate } from "sveltekit-superforms";
import { zod } from "sveltekit-superforms/adapters";
import type { PageServerLoad } from "../$types";
import { deleteAccountFormSchema } from "./delete-account-form.svelte";
import { profileFormSchema } from "./profile-form.svelte";

const hashOptions = {
  // recommended minimum parameters
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1
} satisfies Options;

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
    updateForm: await superValidate(
      {
        username: locals.user!.username,
        discord: discordAccount?.providerUsername,
        email: userSettings?.profileSettings?.email || "",
        bio: userSettings?.profileSettings?.bio || "",
        urls: userSettings?.profileSettings?.urls || []
      },
      zod(profileFormSchema)
    ),
    deleteForm: await superValidate(zod(deleteAccountFormSchema)),
    discordAccount
  };
};

export const actions: Actions = {
  updateProfile: async ({ request, locals }) => {
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
  },
  deleteAccount: async ({ request, locals }) => {
    const form = await superValidate(request, zod(deleteAccountFormSchema));

    if (!form.valid) return fail(400, { form });

    const key = await prisma.key.findFirst({
      where: {
        id: `username:${locals.user?.username.toLowerCase()}`
      }
    });

    if (!key) {
      return message(
        form,
        { title: "Failed to delete your account", description: "How did you get here?" },
        {
          status: 400
        }
      );
    }

    const formPassword = form.data.password;
    const savedPassword = key.hashed_password!;
    const validPassword = await verify(savedPassword, formPassword, hashOptions);

    if (!validPassword) {
      return message(
        form,
        { title: "Failed to delete your account", description: "The password you entered is incorrect. Please try again." },
        {
          status: 400
        }
      );
    }

    // Delete user account
    try {
      await prisma.user.delete({
        where: {
          id: locals.user!.id
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
