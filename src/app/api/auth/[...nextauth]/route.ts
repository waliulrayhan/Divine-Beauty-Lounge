import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            throw new Error("User not found");
          }

          // Compare the plain text password directly
          if (credentials.password !== user.password) {
            throw new Error("Invalid password");
          }

          // If password matches, return the user object
          return { id: user.id, email: user.email, role: user.role };
        } catch (error) {
          console.error("Authorization error:", (error as Error).message);
          throw new Error((error as Error).message || "Authentication failed");
        }
      },
    }),
  ],
  pages: {
    signIn: "/login", // Redirect to your login page on failed sign-in
  },
  session: {
    strategy: "jwt", // This is where the type error occurred; 'jwt' is the correct value
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
