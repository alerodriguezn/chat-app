import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Github from "next-auth/providers/github"

import { prisma } from "@/lib/prisma"
 
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" }, 
  providers: [Github],
  callbacks: {
    jwt( {token, user} ){
      if(user){
        token.data = user
      }
      return token

    },
    session( { session, token, user } ){
      session.user = token.data as any;
      return session
    },


  },
})