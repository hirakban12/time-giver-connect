import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Clock, Upload } from "lucide-react";
import { z } from "zod";
import AvailabilityScheduler from "@/components/AvailabilityScheduler";

const profileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  email: z.string().email("Invalid email address"),
});

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"admin" | "executive">("admin");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [availability, setAvailability] = useState<Array<{ day: string; startTime: string; endTime: string }>>([]);

  useEffect(() => {
    checkAuthAndProfile();
  }, []);

  const checkAuthAndProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    setEmail(user.email || "");

    // Check if profile already exists
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profile) {
      toast.info("You already have a profile");
      navigate("/");
    }
  };

  const uploadFile = async (file: File, bucket: string, userId: string): Promise<string> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${Math.random()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input
      profileSchema.parse({ fullName, phone, email });

      if (!photoFile) {
        toast.error("Please upload a profile photo");
        return;
      }

      if (!idCardFile) {
        toast.error("Please upload an ID card");
        return;
      }

      if (role === "executive" && availability.length === 0) {
        toast.error("Please add at least one availability slot");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload files
      const photoUrl = await uploadFile(photoFile, "profile-photos", user.id);
      const idCardUrl = await uploadFile(idCardFile, "id-cards", user.id);

      // Create profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          full_name: fullName,
          phone,
          email,
          photo_url: photoUrl,
          id_card_url: idCardUrl,
          role,
        });

      if (profileError) throw profileError;

      // If executive, add availability
      if (role === "executive" && availability.length > 0) {
        const availabilityData = availability.map((slot) => ({
          user_id: user.id,
          day_of_week: slot.day,
          start_time: slot.startTime,
          end_time: slot.endTime,
        }));

        const { error: availError } = await supabase
          .from("executive_availability")
          .insert(availabilityData);

        if (availError) throw availError;
      }

      toast.success("Registration completed successfully!");
      navigate("/");
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(error.message || "Failed to complete registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero py-12 px-4">
      <Card className="max-w-2xl mx-auto shadow-soft">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-warm flex items-center justify-center shadow-glow">
              <Clock className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">Complete Your Registration</CardTitle>
            <CardDescription className="text-base mt-2">
              Tell us more about yourself
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label>Select Your Role</Label>
              <RadioGroup value={role} onValueChange={(value) => setRole(value as "admin" | "executive")}>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="admin" id="admin" />
                  <Label htmlFor="admin" className="flex-1 cursor-pointer">
                    Admin - Manage the TimeBank platform
                  </Label>
                </div>
                <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="executive" id="executive" />
                  <Label htmlFor="executive" className="flex-1 cursor-pointer">
                    Executive - Donate your time and skills
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1234567890"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Profile Photo</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  className="flex-1"
                  required
                />
                <Upload className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="idCard">ID Card</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="idCard"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setIdCardFile(e.target.files?.[0] || null)}
                  className="flex-1"
                  required
                />
                <Upload className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>

            {role === "executive" && (
              <AvailabilityScheduler 
                availability={availability} 
                onAvailabilityChange={setAvailability} 
              />
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Registering..." : "Complete Registration"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
