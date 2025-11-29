import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Car, Menu, X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (userId: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", userId)
      .single();
    
    setIsAdmin(profile?.is_admin || false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Car className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-black">
              BestCars<span className="text-primary">AndTruck</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/inventory" className="text-foreground hover:text-primary transition-colors font-medium">
              Buy
            </Link>
            <Link to="/sell" className="text-foreground hover:text-primary transition-colors font-medium">
              Sell
            </Link>
            <Link to="/chat" className="text-foreground hover:text-primary transition-colors font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Support
            </Link>
            {isAdmin && (
              <Link to="/admin/upload-vehicle" className="text-foreground hover:text-primary transition-colors font-medium">
                Admin Upload
              </Link>
            )}
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="hidden md:inline-flex"
                >
                  Sign Out
                </Button>
                <Button
                  onClick={() => navigate("/sell")}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  Sell Your Car
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/auth")}
                  className="hidden md:inline-flex"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => navigate("/auth")}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  Get Started
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="md:hidden border-t border-border py-4"
          >
            <nav className="flex flex-col gap-4">
              <Link
                to="/inventory"
                className="text-foreground hover:text-primary transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Buy
              </Link>
              <Link
                to="/sell"
                className="text-foreground hover:text-primary transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sell
              </Link>
              <Link
                to="/chat"
                className="text-foreground hover:text-primary transition-colors font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Support
              </Link>
              {isAdmin && (
                <Link
                  to="/admin/upload-vehicle"
                  className="text-foreground hover:text-primary transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Upload
                </Link>
              )}
              {user ? (
                <Button
                  variant="ghost"
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  Sign Out
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => {
                    navigate("/auth");
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  Sign In
                </Button>
              )}
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Header;
