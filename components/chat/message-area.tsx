

import React from 'react'
import { ScrollArea } from '../ui/scroll-area'

const messages = [

    {
        user : 'Alejandro Rodríguez',
        message : 'Hola, ¿cómo estás?',
        time : '10:00 AM'
    },
    {
        user : 'Deivid Matute',
        message : 'Hola, ¿cómo estás?',
        time : '10:00 AM'
    },
    {
        user : 'Marvin Angulo',
        message : 'Hola, ¿cómo estás?',
        time : '10:00 AM'
    },
    {
        user : 'Pablo Gabas',
        message : 'Hola, ¿cómo estás?',
        time : '10:00 AM'
    },
    {
        user : 'Alejandro Rodríguez',
        message : 'Hola, ¿cómo estás?',
        time : '10:00 AM'
    },
    {
        user : 'Deivid Matute',
        message : 'Hola, ¿cómo estás?',
        time : '10:00 AM'
    },
    {
        user : 'Marvin Angulo',
        message : 'Hola, ¿cómo estás?',
        time : '10:00 AM'
    },
    {
        user : 'Pablo Gabas',
        message : 'Hola, ¿cómo estás?',
        time : '10:00 AM'
    },
    {
        user : 'Alejandro Rodríguez',
        message : 'Hola, ¿cómo estás?',
        time : '10:00 AM'
    },
    {
        user : 'Alejandro Rodríguez',
        message : 'Hola, ¿cómo estás?',
        time : '10:00 AM'
    },
    {
        user : 'Deivid Matute',
        message : 'Hola, ¿cómo estás?',
        time : '10:00 AM'
    },
    {
        user : 'Marvin Angulo',
        message : 'Hola, ¿cómo estás?',
        time : '10:00 AM'
    },
    {
        user : 'Pablo Gabas',
        message : 'Hola, ¿cómo estás?',
        time : '10:00 AM'
    },
    {
        user : 'Alejandro Rodríguez',
        message : 'Hola, ¿cómo estás?',
        time : '10:00 AM'
    },
    {
        user : 'Deivid Matute',
        message : 'Hola, ¿cómo estás?',
        time : '10:00 AM'
    },
    {
        user : 'Marvin Angulo',
        message : 'Hola, ¿cómo estás?',
        time : '10:00 AM'
    },
    {
        user : 'Pablo Gabas',
        message : 'Hola, ¿cómo estás?',
        time : '10:00 AM'
    },
    {
        user : 'Alejandro Rodríguez',
        message : 'Hola, ¿cómo estás?',
        time : '10:00 AM'
    },

    

]

const MessageArea = () => {
  return (
    <ScrollArea className="w-full h-[850px] rounded-md border">
      <div className="p-4">
        {messages.map((message, index) => (
          <div key={index} className="flex items-center space-x-2 bg-zinc-800 mt-4 rounded p-2">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <div>
              <div className="font-bold">{message.user}</div>
              <div className="text-sm">{message.message}</div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

export default MessageArea
