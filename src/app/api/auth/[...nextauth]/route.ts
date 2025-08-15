import NextAuth from "next-auth"
import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    {
      id: "workos",
      name: "WorkOS",
      type: "oauth",
      wellKnown: "https://api.workos.com/sso/oidc/.well-known/openid-configuration",
      authorization: {
        params: {
          scope: "openid profile email",
          connection: process.env.WORKOS_CONNECTION_ID,
        },
      },
      clientId: process.env.WORKOS_CLIENT_ID!,
      clientSecret: process.env.WORKOS_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        }
      },
    },
    // Optional credentials for testing
    CredentialsProvider({
      name: "credentials",
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const user = await prisma.user.findUnique({ where: { email: credentials?.email } })
        if (!user || !user.hashedPassword) return null
        const isValid = await bcrypt.compare(credentials!.password, user.hashedPassword)
        if (!isValid) return null
        return user
      }
    })
  ],
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string
      return session
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
