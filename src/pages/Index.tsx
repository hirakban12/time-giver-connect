import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Users, Heart, LogOut, User } from "lucide-react";
import heroImage from "@/assets/hero-timebank.jpg";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        loadProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      await loadProfile(session.user.id);
    }
    setLoading(false);
  };

  const loadProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    
    setProfile(data);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Clock className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-warm flex items-center justify-center shadow-glow">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold">TimeBank</span>
          </div>
          
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {profile && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{profile.full_name}</span>
                    <span className="text-muted-foreground">({profile.role})</span>
                  </div>
                )}
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate("/auth")}>
                Get Started
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="People helping each other in a timebank community" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background" />
        </div>
        
        <div className="relative container mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
            Your Time is <span className="bg-gradient-warm bg-clip-text text-transparent">Valuable</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-in">
            Join our community where people donate their time to help others. 
            Every hour matters, every skill counts.
          </p>
          {!user && (
            <Button size="lg" onClick={() => navigate("/auth")} className="shadow-glow animate-fade-in">
              Join TimeBank Today
            </Button>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">How TimeBank Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="shadow-soft hover:shadow-glow transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-gradient-warm flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Donate Your Time</CardTitle>
              <CardDescription>
                Share your skills and expertise with the community. Every hour you give creates value.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-soft hover:shadow-glow transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-gradient-trust flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Connect & Help</CardTitle>
              <CardDescription>
                Find people who need your skills or discover volunteers who can help you.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="shadow-soft hover:shadow-glow transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 rounded-full bg-gradient-warm flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Build Community</CardTitle>
              <CardDescription>
                Strengthen bonds by helping each other. Time is the currency, community is the reward.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="container mx-auto px-4 py-16">
          <Card className="bg-gradient-warm text-white shadow-glow">
            <CardHeader className="text-center space-y-4 py-12">
              <CardTitle className="text-4xl">Ready to Make a Difference?</CardTitle>
              <CardDescription className="text-white/90 text-lg">
                Join as an admin to manage the platform or as an executive to donate your time.
              </CardDescription>
              <Button size="lg" variant="secondary" onClick={() => navigate("/auth")} className="mt-4">
                Get Started Now
              </Button>
            </CardHeader>
          </Card>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-card border-t mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2025 TimeBank. Building community through shared time.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
