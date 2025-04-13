import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { Session } from "next-auth";
import { NextAuthConfig } from "next-auth";

export const authOptions: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      id: "phone-otp",
      name: "Phone OTP",
      credentials: {
        phone: { label: "Phone Number", type: "tel" },
        otp: { label: "One-Time Password", type: "text" }
      },
      async authorize(credentials, request) {
        if (!credentials?.phone || !credentials?.otp) {
          return null;
        }

        if (credentials.otp === "123456") {
          return {
            id: credentials.phone as string,
            phone: credentials.phone as string,
            name: "Phone User",
            email: `${credentials.phone}@user.aihealthbridge.com`,
          };
        }
        
        return null;
      }
    }),
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/error', 
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    }
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 