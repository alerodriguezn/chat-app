import { Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center gap-4 h-full">
      <Zap color="yellow" className="w-10 h-10 animate-pulse" />
      <h1 className="text-2xl font-bold text-white">Welcome to the chat app</h1>
 
    </div>
  );
}
