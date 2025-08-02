import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Send, 
  Bot, 
  User, 
  Phone, 
  Mail, 
  Clock,
  MessageCircle,
  HelpCircle,
  FileText,
  Shield,
  Heart,
  Ambulance
} from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function Help() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm CareNav Assistant. I'm here to help you with your hospital onboarding process. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Chat request failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      const botMessage: Message = {
        id: Date.now().toString(),
        content: data.response || "I'm sorry, I couldn't process that request. Please try again or contact our support team.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    },
    onError: () => {
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "I'm experiencing technical difficulties. Please try again later or contact our support team directly.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(inputMessage);
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    {
      icon: FileText,
      title: "Onboarding Help",
      description: "Get help with the registration process",
      action: () => {
        const message = "I need help with the onboarding process. Can you guide me through the steps?";
        setInputMessage(message);
      }
    },
    {
      icon: Shield,
      title: "Document Upload",
      description: "Issues with uploading documents",
      action: () => {
        const message = "I'm having trouble uploading my documents. What file types are supported?";
        setInputMessage(message);
      }
    },
    {
      icon: Heart,
      title: "Medical Information",
      description: "Questions about medical history",
      action: () => {
        const message = "I have questions about what medical information I need to provide.";
        setInputMessage(message);
      }
    },
    {
      icon: Ambulance,
      title: "Emergency Process",
      description: "Emergency onboarding questions",
      action: () => {
        const message = "What is the difference between standard and emergency onboarding?";
        setInputMessage(message);
      }
    }
  ];

  const faqItems = [
    {
      question: "How long does the onboarding process take?",
      answer: "Standard onboarding takes 8-12 minutes, while emergency fast-track takes 3-5 minutes."
    },
    {
      question: "What documents do I need?",
      answer: "You'll need a valid ID, insurance card, and any relevant medical documents. Our AI can scan these automatically."
    },
    {
      question: "Is my information secure?",
      answer: "Yes, all your information is encrypted and protected according to HIPAA standards."
    },
    {
      question: "Can I complete onboarding on mobile?",
      answer: "Yes, our platform is fully responsive and works on all devices."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <Button variant="ghost">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Welcome
              </Button>
            </Link>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <HelpCircle className="h-4 w-4 text-white" />
              </div>
              <span className="font-medium">Help & Support</span>
            </div>
            
            <Badge variant="outline" className="text-green-600 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Support Online
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chat Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm h-[600px] flex flex-col">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center text-xl text-gray-900">
                  <Bot className="h-6 w-6 text-blue-600 mr-3" />
                  CareNav Assistant
                </CardTitle>
                <p className="text-gray-600">
                  Get instant help with your onboarding process
                </p>
              </CardHeader>
              
              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.sender === 'bot' && (
                          <Bot className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                        )}
                        {message.sender === 'user' && (
                          <User className="h-4 w-4 text-white mt-1 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${
                            message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {chatMutation.isPending && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-[80%]">
                      <div className="flex items-center space-x-2">
                        <Bot className="h-4 w-4 text-blue-600" />
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </CardContent>
              
              {/* Message Input */}
              <div className="border-t border-gray-100 p-4">
                <div className="flex space-x-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your question here..."
                    className="flex-1"
                    disabled={chatMutation.isPending}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || chatMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Quick Help</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full justify-start p-3 h-auto text-left"
                    onClick={action.action}
                  >
                    <action.icon className="h-4 w-4 mr-3 text-blue-600 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-900">{action.title}</div>
                      <div className="text-xs text-gray-500">{action.description}</div>
                    </div>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Contact Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">(555) 123-CARE</p>
                    <p className="text-sm text-gray-500">24/7 Support Line</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">support@carenav.com</p>
                    <p className="text-sm text-gray-500">Email Support</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Average response: 2 min</p>
                    <p className="text-sm text-gray-500">Live chat support</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Frequently Asked</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {faqItems.map((faq, index) => (
                  <div key={index} className="space-y-2">
                    <button
                      className="text-sm font-medium text-gray-900 text-left hover:text-blue-600 transition-colors"
                      onClick={() => setInputMessage(faq.question)}
                    >
                      {faq.question}
                    </button>
                    <p className="text-xs text-gray-500">{faq.answer}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}