
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { aiAssistantService } from "@/services/aiAssistant.service";
// import { MessageCircle, Send, Bot, User, Minimize2, X } from "lucide-react";
// Utility for classnames
function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

// ...existing code...

const BOT_INTRO =
  "Hi! I'm SafishaHub Assistant. I can help you find the best, available, and nearby car wash services, and answer questions about SafishaHub. How can I assist you today?";

export interface ChatMessage {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  actions?: Array<{ label: string; to: string }>;
}

const AIChatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 0, sender: 'bot', text: BOT_INTRO },
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;
   const userMsg: ChatMessage={
    id: Date.now(),
    sender: 'user',
    text: input,
   };   
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');

    //use the service for bot response
    const botMsg = await aiAssistantService.chat(userMsg.text);
    setMessages((msgs)=>[...msgs, botMsg]);
  };

  const handleAction = (to: string) => {
    setOpen(false);
    navigate({ to });
  };

  return (
    <>
      {/* Floating button to open chatbot */}
      {!open && (
        <div
          style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999 }}
        >
          <Button
            variant="default"
            size="lg"
            className="rounded-full shadow-lg"
            onClick={() => setOpen(true)}
          >
            AI Assistant
          </Button>
        </div>
      )}

      {/* Chatbot widget */}
      {open && (
        <div
          style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 9999, width: '20rem', maxWidth: '90vw', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="bg-primary text-white flex flex-row items-center justify-between p-4">
              <CardTitle className="text-lg">SafishaHub Assistant</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-white"
                onClick={() => setOpen(false)}
                aria-label="Close chatbot"
              >
                ×
              </Button>
            </CardHeader>
            <div className="p-4 bg-background h-80 overflow-y-auto flex flex-col gap-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    'flex flex-col',
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  )}
                >
                  <div
                    className={cn(
                      'rounded-lg px-3 py-2 mb-1',
                      msg.sender === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-card text-card-foreground'
                    )}
                  >
                    {msg.text}
                  </div>
                  {msg.actions && (
                    <div className="flex gap-2 flex-wrap mt-1">
                      {msg.actions.map((action, idx) => (
                        <Button
                          key={idx}
                          variant="outline"
                          size="sm"
                          onClick={() => handleAction(action.to)}
                        >
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form
              className="flex items-center gap-2 p-4 border-t bg-card"
              onSubmit={handleSend}
            >
              <Input
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
                autoFocus
              />
              <Button type="submit" variant="default">
                Send
              </Button>
            </form>
          </Card>
        </div>
      )}
    </>
  );
};
export default AIChatbot;
