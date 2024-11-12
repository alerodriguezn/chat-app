import getAllMessagesByConversation from "@/actions/get-all-messages-by-conversation";
import { getConversationById } from "@/actions/get-conversation-by-id";
import { auth } from "@/auth.config";
import MessageArea from "@/components/chat/message-area";
import Image from "next/image";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

import SetTemporalMessages from "@/components/conversations/SetTemporalMessages";


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

  const {conversation, hasTemporalMessages} = await getConversationById(id);

  if (!conversation) {
    return null;
  }

  const otherUser = conversation.users.find(
    (user) => user.id !== session.user.id
  )!;


  return (
    <div className="">
      <div>
        <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-lg shadow">
          <div>
            <ContextMenu>
              <ContextMenuTrigger>
                <div className="flex items-center">
                  <Image
                    src={otherUser.image || ""}
                    alt="Other User Avatar"
                    className="w-10 h-10 rounded-full mr-4"
                    width={40}
                    height={40}
                  />
                  <span className="text-lg font-semibold">
                    {otherUser.name}
                  </span>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem>
                  <SetTemporalMessages conversationId={id} hasTemporalMessages={hasTemporalMessages} />
                  
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </div>
        </div>
      </div>
      <MessageArea
        initialMessages={allMessages}
        currentUserId={session.user.id}
        conversationId={id}
      />
    </div>
  );
}
