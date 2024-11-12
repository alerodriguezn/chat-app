import { auth } from "@/auth.config";
import { Zap } from "lucide-react";
import Link from "next/link";
export default async function Home() {

  const session = await auth();




  return (
    <div className="flex flex-col justify-center items-center gap-4 h-full">
      <Zap color="yellow" className="w-10 h-10 animate-pulse" />
      <h1 className="text-2xl font-bold text-white">Welcome to the chat app</h1>
      {
        session?.user ? (
          <p>You are logged in as {session.user.name}</p>
        ) : (
          <Link href="/api/auth/signin" className="text-white bg-green-600 rounded px-8 py-2">Sign in</Link>
        )
      }
 
    </div>
  );
}
