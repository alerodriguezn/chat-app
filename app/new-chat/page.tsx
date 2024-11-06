import { ComboboxUsers } from "@/components/users/combobox-users";

import { getAllUsers } from "@/actions/get-all-users";
import { auth } from "@/auth.config";

export default async function NewChat() {

  const users = await getAllUsers();
  const session  = await auth();

  if (!session) {
    return null;
  }

  console.log(session.user.id);

  return (
    <div className="flex flex-col w-full  items-center">
        <h2 className="font-bold mb-2">Select the user</h2>
        <ComboboxUsers users={users} currentUser={session.user.id} />
      
    </div>
  );
}