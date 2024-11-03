import { ComboboxUsers } from "@/components/users/combobox-users";
import { Button } from "@/components/ui/button";

export default function NewChat() {
  return (
    <div className="flex flex-col w-full  items-center">
        <h2 className="font-bold mb-2">Select the user</h2>
        <ComboboxUsers />
        <Button className="w-[600px] mt-4 bg-green-500 rounded-[4px] text-white font-bold text-md">
            Start Chat
        </Button>
        
    
    </div>
  );
}