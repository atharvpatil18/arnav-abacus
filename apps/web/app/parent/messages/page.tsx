'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import Loading from '@/app/loading';
import { 
  MessageSquare,
  Send,
  Search,
  User,
  Clock,
  CheckCheck,
  MoreVertical
} from 'lucide-react';

interface Message {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  createdAt: string;
  read: boolean;
}

interface Conversation {
  id: number;
  user: {
    id: number;
    name: string;
    role: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
  };
  unreadCount: number;
  messages: Message[];
}

interface MessagesData {
  conversations: Conversation[];
}

export default function ParentMessagesPage() {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['messages', user?.id],
    queryFn: async (): Promise<MessagesData> => {
      // Mock data for demonstration
      return {
        conversations: [
          {
            id: 1,
            user: {
              id: 10,
              name: 'Ms. Sarah Johnson',
              role: 'Teacher'
            },
            lastMessage: {
              content: 'Your child is doing great in class!',
              createdAt: new Date().toISOString()
            },
            unreadCount: 2,
            messages: [
              {
                id: 1,
                content: 'Hello! How is my child performing?',
                senderId: user?.id || 0,
                receiverId: 10,
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                read: true
              },
              {
                id: 2,
                content: 'Your child is doing great in class! Very attentive and participative.',
                senderId: 10,
                receiverId: user?.id || 0,
                createdAt: new Date(Date.now() - 1800000).toISOString(),
                read: false
              },
              {
                id: 3,
                content: 'Keep up the good work at home!',
                senderId: 10,
                receiverId: user?.id || 0,
                createdAt: new Date().toISOString(),
                read: false
              }
            ]
          },
          {
            id: 2,
            user: {
              id: 20,
              name: 'Admin Office',
              role: 'Administrator'
            },
            lastMessage: {
              content: 'Thank you for your payment',
              createdAt: new Date(Date.now() - 86400000).toISOString()
            },
            unreadCount: 0,
            messages: []
          }
        ]
      };
    },
    enabled: !!user,
  });

  if (isLoading) return <Loading />;

  const conversations = data?.conversations || [];
  const currentConversation = selectedConversation
    ? conversations.find(c => c.id === selectedConversation)
    : null;

  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // TODO: Implement actual message sending
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Messages
        </h1>
        <p className="text-gray-600">Chat with teachers and administrators</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="overflow-y-auto max-h-[600px]">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No conversations found</p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`w-full p-4 border-b border-gray-200 hover:bg-purple-50 transition-all text-left ${
                      selectedConversation === conversation.id ? 'bg-purple-50 border-l-4 border-l-purple-600' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {conversation.user.name}
                          </h3>
                          {conversation.unreadCount > 0 && (
                            <span className="ml-2 px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mb-1">{conversation.user.role}</p>
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage.content}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(conversation.lastMessage.createdAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          {!currentConversation ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="w-12 h-12 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Conversation</h3>
                <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-[700px]">
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg">
                        {currentConversation.user.name}
                      </h3>
                      <p className="text-purple-100 text-sm">{currentConversation.user.role}</p>
                    </div>
                  </div>
                  <button 
                    className="p-2 hover:bg-purple-700 rounded-lg transition-all"
                    title="More options"
                    aria-label="More options"
                  >
                    <MoreVertical className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {currentConversation.messages.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  currentConversation.messages.map((message) => {
                    const isSent = message.senderId === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl p-4 ${
                            isSent
                              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                              : 'bg-white border border-gray-200'
                          }`}
                        >
                          <p className={isSent ? 'text-white' : 'text-gray-900'}>
                            {message.content}
                          </p>
                          <div
                            className={`flex items-center gap-1 mt-2 text-xs ${
                              isSent ? 'text-purple-100' : 'text-gray-500'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            {formatTime(message.createdAt)}
                            {isSent && message.read && (
                              <CheckCheck className="w-4 h-4 ml-1" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input */}
              <div className="p-6 border-t border-gray-200 bg-white">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
