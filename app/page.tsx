import MessageArea from "@/components/chat/message-area";
import { SendMessage } from "@/components/chat/send-message";

export default function Home() {
  return (
    <div className="flex flex-col justify-between gap-4">
      <MessageArea />
      <SendMessage />
    </div>
  );
}
