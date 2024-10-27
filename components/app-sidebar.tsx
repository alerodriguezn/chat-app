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

const users = [
  {
    name: "Alejandro Rodríguez",
    imgUrl: "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/e7/e73a52e4c9fbe66602c925e158989dbc79d75636_full.jpg",
  },
  {
    name: "Deivid Matute",
    imgUrl: "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/55/55f1f64ae3a2ab16243724d720cff4d8e470a3e3_full.jpg",
  },
  {
    name: "Marvin Angulo",
    imgUrl: "https://cdn.cloudflare.steamstatic.com/steamcommunity/public/images/avatars/00/00766f4adf772f4cbf7ca7625075c7a3c92cbef7_full.jpg",
  },
  {
    name: "Pablo Gabas",
    imgUrl: "https://i.pravatar.cc/300",
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {users.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton asChild>
                    <a href={"/"} className="mt-4">
                      <Avatar className="w-8 " >
                        <AvatarImage className="rounded-full" src={item.imgUrl} />
                        <AvatarFallback>IMG</AvatarFallback>
                      </Avatar>
                      <span className="font-bold">{item.name}</span>
                    </a>
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
