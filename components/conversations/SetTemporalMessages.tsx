"use client";

import { setTemporalMessages } from "@/actions/set-temporal-messages";



interface SetTemporalMessagesProps {
  conversationId: string;
  hasTemporalMessages: boolean;
}

const SetTemporalMessages = ({ conversationId, hasTemporalMessages }: SetTemporalMessagesProps) => {


  return (
    <button onClick={() => setTemporalMessages(conversationId)}>
      {hasTemporalMessages
        ? "Deactivate Temporal Messages"
        : "Activate Temporal Messages"}
    </button>
  )
}

export default SetTemporalMessages
