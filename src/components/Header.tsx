import { motion } from "framer-motion";
import { Car, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Car className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-black">
              BestCars<span className="text-primary">AndTruck</span>
            </span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">
              Buy
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">
              Sell
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">
              Finance
            </a>
            <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">
              About
            </a>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="hidden md:inline-flex">
              Sign In
            </Button>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Sell Your Car
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
