import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { Send } from "lucide-react";

interface Message {
  id: string;
  user_id: string;
  message: string;
  is_admin: boolean;
  created_at: string;
}

interface UserChat {
  userId: string;
  userEmail: string;
  messages: Message[];
  lastMessage: string;
  lastMessageTime: string;
}

const AdminChat = () => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [chats, setChats] = useState<UserChat[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAdminStatus();
  }, [navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchAllChats();
      subscribeToMessages();
    }
  }, [isAdmin]);

  useEffect(() => {
    scrollToBottom();
  }, [selectedUserId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const checkAdminStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", session.user.id)
      .single();

    if (!profile?.is_admin) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setIsAdmin(true);
  };

  const fetchAllChats = async () => {
    try {
      const { data: messages, error } = await supabase
        .from("chat_messages")
        .select("*, profiles(email)")
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Group messages by user
      const userChatsMap = new Map<string, UserChat>();

      messages?.forEach((msg: any) => {
        if (!userChatsMap.has(msg.user_id)) {
          userChatsMap.set(msg.user_id, {
            userId: msg.user_id,
            userEmail: msg.profiles?.email || "Unknown User",
            messages: [],
            lastMessage: msg.message,
            lastMessageTime: msg.created_at,
          });
        }

        const chat = userChatsMap.get(msg.user_id)!;
        chat.messages.push(msg);
        chat.lastMessage = msg.message;
        chat.lastMessageTime = msg.created_at;
      });

      setChats(Array.from(userChatsMap.values()));
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel("admin_chat_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        () => {
          fetchAllChats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUserId) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("chat_messages").insert({
        user_id: selectedUserId,
        message: newMessage,
        is_admin: true,
      });

      if (error) throw error;

      setNewMessage("");
      await fetchAllChats();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedChat = chats.find((c) => c.userId === selectedUserId);

  if (!isAdmin) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p>Checking permissions...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 pt-32 pb-16">
        <h1 className="text-3xl font-black mb-6">Admin Chat Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
          {/* Users List */}
          <Card className="md:col-span-1 overflow-hidden flex flex-col">
            <CardHeader>
              <CardTitle>Active Conversations</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-0">
              {chats.length === 0 ? (
                <p className="text-center text-muted-foreground p-4">No conversations yet</p>
              ) : (
                chats.map((chat) => (
                  <button
                    key={chat.userId}
                    onClick={() => setSelectedUserId(chat.userId)}
                    className={`w-full text-left p-4 border-b border-border hover:bg-secondary transition-colors ${
                      selectedUserId === chat.userId ? "bg-secondary" : ""
                    }`}
                  >
                    <div className="font-semibold">{chat.userEmail}</div>
                    <div className="text-sm text-muted-foreground truncate">
                      {chat.lastMessage}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(chat.lastMessageTime).toLocaleString()}
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          {/* Chat Messages */}
          <Card className="md:col-span-2 flex flex-col overflow-hidden">
            {selectedChat ? (
              <>
                <CardHeader>
                  <CardTitle>Chat with {selectedChat.userEmail}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                    {selectedChat.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.is_admin ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            message.is_admin
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-foreground"
                          }`}
                        >
                          <p className="text-sm">{message.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your reply..."
                      disabled={loading}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={loading || !newMessage.trim()}
                      className="bg-accent hover:bg-accent/90"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </form>
                </CardContent>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select a conversation to start chatting
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
