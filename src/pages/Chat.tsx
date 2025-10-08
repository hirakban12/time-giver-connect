import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Mic, StopCircle, Play, Pause } from "lucide-react";
import { toast } from "sonner";

const Chat = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      navigate("/auth");
      return;
    }
    const userData = JSON.parse(user);
    setCurrentUser(userData);

    if (userId) {
      const allUsers = JSON.parse(localStorage.getItem("allUsers") || "[]");
      const other = allUsers.find((u: any) => u.id === userId);
      setOtherUser(other);

      // Load messages
      const chatKey = [userData.id, userId].sort().join("-");
      const chatMessages = JSON.parse(localStorage.getItem(`chat-${chatKey}`) || "[]");
      setMessages(chatMessages);
    }
  }, [navigate, userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const saveMessages = (msgs: any[]) => {
    if (!currentUser || !userId) return;
    const chatKey = [currentUser.id, userId].sort().join("-");
    localStorage.setItem(`chat-${chatKey}`, JSON.stringify(msgs));
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      text: newMessage.trim(),
      type: "text",
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    saveMessages(updatedMessages);
    setNewMessage("");
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          const voiceMessage = {
            id: Date.now().toString(),
            senderId: currentUser.id,
            audioData: reader.result as string,
            type: "voice",
            timestamp: new Date().toISOString()
          };
          const updatedMessages = [...messages, voiceMessage];
          setMessages(updatedMessages);
          saveMessages(updatedMessages);
        };
        reader.readAsDataURL(blob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast.success("Recording started");
    } catch (error) {
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setMediaRecorder(null);
      toast.success("Voice message sent");
    }
  };

  const togglePlayAudio = (messageId: string, audioData: string) => {
    if (playingMessageId === messageId) {
      audioRef.current?.pause();
      setPlayingMessageId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioData);
      audio.onended = () => setPlayingMessageId(null);
      audio.play();
      audioRef.current = audio;
      setPlayingMessageId(messageId);
    }
  };

  if (!otherUser) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Card>
          <CardContent className="p-8">User not found</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero p-4">
      <div className="max-w-4xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => navigate("/users")}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <Avatar>
                <AvatarImage src={otherUser.photo} />
                <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <CardTitle>{otherUser.name}</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.senderId === currentUser.id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    msg.senderId === currentUser.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {msg.type === "text" ? (
                    <p>{msg.text}</p>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePlayAudio(msg.id, msg.audioData)}
                      className="text-inherit"
                    >
                      {playingMessageId === msg.id ? (
                        <Pause className="w-4 h-4 mr-2" />
                      ) : (
                        <Play className="w-4 h-4 mr-2" />
                      )}
                      Voice Message
                    </Button>
                  )}
                  <p className="text-xs opacity-70 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </CardContent>

          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type a message..."
                disabled={isRecording}
              />
              {isRecording ? (
                <Button onClick={stopRecording} variant="destructive">
                  <StopCircle className="w-4 h-4" />
                </Button>
              ) : (
                <>
                  <Button onClick={startRecording} variant="outline">
                    <Mic className="w-4 h-4" />
                  </Button>
                  <Button onClick={handleSendMessage}>
                    <Send className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Chat;
