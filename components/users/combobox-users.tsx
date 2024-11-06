"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { createConversation } from "@/actions/create-conversation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Props {
  users: {
    name: string | null;
    id: string;
    image: string | null;
    email: string | null;
    emailVerified: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }[]
  currentUser: string;
}

export function ComboboxUsers({ users, currentUser }: Props) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [currentUserId, setCurrentUserId] = React.useState("");

  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[600px] justify-between"
          >
            {value
              ? users.find((user) => user.id === value)?.name
              : "Select an user..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[600px] p-0">
          <Command>
            <CommandInput placeholder="Search users..." />
            <CommandList>
              <CommandEmpty>No Users found.</CommandEmpty>
              <CommandGroup>
                {users.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={user.name ? user.id : ""}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue);
                      setCurrentUserId(currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === user.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <Image
                      src={user.image || "/avatar.png"}
                      alt="avatar"
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                    {user.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Button 
        className="w-[600px] mt-4 bg-green-500 rounded-[4px] text-white font-bold text-md"
        onClick={async () => {
          const conversation = await createConversation(currentUser, currentUserId)
          if (conversation){
            router.replace(`/chat/${conversation.id}`)
          }
        }}
        >
        Start Chat
      </Button>
    </div>
  );
}
