import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Clock } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      toast.error("Please enter both name and phone number");
      return;
    }

    // Create user profile in localStorage
    const userId = Date.now().toString();
    const user = {
      id: userId,
      name: name.trim(),
      phone: phone.trim(),
      photo: "",
      createdAt: new Date().toISOString()
    };

    // Store current user
    localStorage.setItem("currentUser", JSON.stringify(user));

    // Add to users list
    const users = JSON.parse(localStorage.getItem("allUsers") || "[]");
    users.push(user);
    localStorage.setItem("allUsers", JSON.stringify(users));

    toast.success(`Welcome, ${name}!`);
    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-soft">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-warm flex items-center justify-center shadow-glow">
              <Clock className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">TimeBank</CardTitle>
            <CardDescription className="text-base mt-2">
              Join our community of time donors
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Continue
            </Button>
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground mb-2">Don't have an account?</p>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/register")}
              >
                Register
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
