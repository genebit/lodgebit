import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { supabaseAdmin } from "./supabase/admin";
import bcrypt from "bcryptjs";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authConfig: NextAuthConfig = {
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const { data: admin } = await supabaseAdmin
          .from("admins")
          .select("id, full_name, email, password_hash, role")
          .eq("email", email)
          .single();

        if (!admin) return null;
        const valid = await bcrypt.compare(password, admin.password_hash);
        if (!valid) return null;

        return {
          id: admin.id,
          name: admin.full_name,
          email: admin.email,
          role: admin.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      // For Google sign-in, only allow emails that exist in the admins table
      if (account?.provider === "google") {
        const email = profile?.email;
        if (!email) return false;
        const { data: admin } = await supabaseAdmin
          .from("admins")
          .select("id")
          .eq("email", email)
          .single();
        return !!admin;
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }
      // For Google sign-in, fetch the admin record to get id and role
      if (account?.provider === "google" && profile?.email) {
        const { data: admin } = await supabaseAdmin
          .from("admins")
          .select("id, role")
          .eq("email", profile.email)
          .single();
        if (admin) {
          token.id = admin.id;
          token.role = admin.role;
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  session: { strategy: "jwt" },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
