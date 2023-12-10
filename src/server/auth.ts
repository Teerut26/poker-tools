import { GetServerSidePropsContext } from "next";
import { getServerSession, NextAuthOptions, DefaultSession, DefaultUser } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { env } from "@/env.mjs";
import { UserInterface } from "@/interfaces/UserInterface";
import { pb, pbAuth } from "@/utils/pocketbase";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: DefaultUser & {
      pocketbaseid: string;
    };
  }
  interface User extends DefaultUser {
    id: string;
    pocketbaseid: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    pocketbaseid: string;
  }
}

export const authOptions: NextAuthOptions = {
  callbacks: {
    session: ({ session, token }) => {
      session.user.id = token.id;
      session.user.pocketbaseid = token.pocketbaseid;

      return session;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.pocketbaseid = user.pocketbaseid;
      }

      return token;
    },
  },

  pages: {
    signIn: "/sign-in",
  },
  providers: [
    GoogleProvider({
      name: "Google Sign In",
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      async profile(profile, tokens) {
        let pocketbaseid = "";
        try {
          const pocketbase = await pbAuth(pb);
          const useExit = await pb.collection("user").getList<UserInterface>(1, 2, {
            filter: `googleid="${profile.sub}" `,
          });

          if (useExit.items.length === 0) {
            const result = await pocketbase.collection("user").create<UserInterface>({
              name: profile.name,
              money: 10000,
              googleid: profile.sub,
            });
            pocketbaseid = result.id;
          } else {
            // const result = await pocketbase.collection("user").update<UserInterface>(useExit.items[0]?.id!, {
            //   name: profile.name,
            // });
            // pocketbaseid = result.id;
            pocketbaseid = useExit.items[0]?.id!;
          }
        } catch (error) {
          console.error("Error signing in:", error);
        }

        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          pocketbaseid: pocketbaseid,
        };
      },
    }),
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: GetServerSidePropsContext) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
