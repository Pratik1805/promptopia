import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDB } from "@utils/database";
import user from "@models/user";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session }) {
      const sessionuser = await user.findOne({
        email: session.user.email,
      });

      session.user.id = sessionuser._id.toString();

      return session;
    },

    async signIn({ profile }) {
      try {
        await connectToDB();

        //check if a user already exists
        const userExists = await user.findOne({
          email: profile.email,
        });

        //if not create a new user
        if (!userExists) {
          await user.create({
            email: profile.email,
            username: profile.name.replace(" ", "").toLowerCase(),
            image: profile.picture,
          });
        }
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
  },
});

export { handler as GET, handler as POST };
