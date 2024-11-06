import  getAllMessagesByConversation  from "@/actions/get-all-messages-by-conversation";
import { auth } from "@/auth.config";
import MessageArea from "@/components/chat/message-area";


interface Props {
  params: {
    id: string;
  };
}

export default async function ChatPage({ params }: Props) {
  const { id } = params;

  const session = await auth();

    if (!session) {
        return null;
    }

  const allMessages = await getAllMessagesByConversation(id);

  return (
    <div className="">
      <MessageArea initialMessages={allMessages} currentUserId={session.user.id} conversationId={id} />
    </div>
  );
}
