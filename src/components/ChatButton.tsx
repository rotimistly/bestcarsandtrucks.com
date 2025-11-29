import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const ChatButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate("/chat")}
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-accent hover:bg-accent/90 shadow-glow z-50"
      size="icon"
    >
      <MessageSquare className="h-6 w-6" />
    </Button>
  );
};

export default ChatButton;
