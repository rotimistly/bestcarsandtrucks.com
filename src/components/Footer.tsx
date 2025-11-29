import { Car, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-24">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Car className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-black">
                BestCars<span className="text-primary">AndTruck</span>
              </span>
            </div>
            <p className="text-muted-foreground mb-6">
              Your trusted partner in finding the perfect vehicle. Quality, reliability, and service you can count on.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-lg bg-secondary hover:bg-primary transition-colors flex items-center justify-center">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-secondary hover:bg-primary transition-colors flex items-center justify-center">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-secondary hover:bg-primary transition-colors flex items-center justify-center">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-secondary hover:bg-primary transition-colors flex items-center justify-center">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Buy a Car</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Sell Your Car</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Finance Options</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Trade-In Value</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-lg mb-4">Support</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">FAQ</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Warranty</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Service Center</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li>Ohio, USA</li>
              <li className="pt-2">Email: bestcarsandtrucks4@gmail.com</li>
              <li className="pt-2 font-semibold text-primary">We Deliver Worldwide</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center text-muted-foreground">
          <p>&copy; 2024 BestCarsAndTruck.com. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
