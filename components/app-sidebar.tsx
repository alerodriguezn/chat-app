import { getUsersWithConversations } from "@/actions/get-users-with-conversations";
import { auth } from "@/auth.config";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarImage, AvatarFallback } from "@radix-ui/react-avatar";
import Link from "next/link";

export async function AppSidebar() {
  const session = await auth();

  if (!session) {
    return null;
  }

  const conversations = await getUsersWithConversations(session.user.id);

  if (!conversations) {
    return null;
  }

  // get all users
  const users = conversations.conversations.map((conversation) => {
    const otherUsers = conversation.users.filter(
      (user) => user.name !== session.user.name
    );

    return {
      name: otherUsers[0].name,
      image: otherUsers[0].image,
      conversations: [{ id: conversation.id }],
    };
  });

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-md">Chats</SidebarGroupLabel>
          {/* Create New Conversation Link */}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    href={"/new-chat"}
                    className="mt-4 bg-sky-600 rounded hover:bg-sky-800"
                  >
                    <span className="font-bold">Create New Conversation</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>

          <SidebarGroupContent>
            <SidebarMenu>
              {users.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={`/chat/${item.conversations[0].id}`}
                      className="mt-4"
                    >
                      <Avatar className="w-8 ">
                        <AvatarImage
                          className="rounded-full"
                          src={item.image ? item.image : ""}
                        />
                        <AvatarFallback>IMG</AvatarFallback>
                      </Avatar>
                      <span className="font-bold">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
