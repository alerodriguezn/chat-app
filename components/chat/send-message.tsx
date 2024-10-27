import React from 'react'
import { Button } from '../ui/button'

export const SendMessage = () => {
  return (
    <div>
        <div className="flex items-center space-x-2 bg-zinc-800 rounded p-2">
            <input type="text" className="w-full p-2 border rounded" placeholder="Write a message...." />
            <Button className="bg-green-500 text-white px-4 py-2 rounded">Send</Button>
        </div>
    </div>
  )
}
