
import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';

interface ChatMessageProps {
  message: string;
  username: string;
  timestamp: string;
  isMine: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, username, timestamp, isMine }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-[80%] ${isMine ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
        <Avatar className="h-8 w-8">
          <AvatarFallback className={isMine ? 'bg-herd-purple text-white' : 'bg-gray-200 text-gray-700'}>
            {getInitials(username)}
          </AvatarFallback>
        </Avatar>
        <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
          <div className={`px-4 py-2 rounded-lg ${
            isMine 
              ? 'bg-herd-purple text-white rounded-tr-none' 
              : 'bg-gray-100 text-gray-800 rounded-tl-none'
          }`}>
            <p className="text-sm">{message}</p>
          </div>
          <div className="flex items-center mt-1 space-x-2">
            <span className="text-xs text-gray-500 font-medium">{username}</span>
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(timestamp), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
