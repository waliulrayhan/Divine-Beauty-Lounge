import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Check if the credentials match the super admin
        if (
          credentials?.username === process.env.SUPER_ADMIN_USERNAME &&
          credentials?.password === process.env.SUPER_ADMIN_PASSWORD
        ) {
          return { id: "1", name: "Super Admin" };
        }
        return null;
      },
    }),
  ],
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
