import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Gauge, Fuel, BadgeCheck, DollarSign, ShieldCheck, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Vehicle {
  id: string;
  title: string;
  price: number;
  year: number;
  mileage: number;
  fuel_type: string;
  condition: string;
  images: string[];
  make: string;
  model: string;
  description: string;
}

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  useEffect(() => {
    fetchVehicle();
  }, [id]);

  const fetchVehicle = async () => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setVehicle(data);
    } catch (error) {
      console.error("Error fetching vehicle:", error);
      toast.error("Failed to load vehicle details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-32 pb-16">
          <p className="text-center text-muted-foreground">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-32 pb-16 text-center">
          <h1 className="text-4xl font-black mb-4">Vehicle Not Found</h1>
          <p className="text-muted-foreground mb-8">The vehicle you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/inventory")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inventory
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 pt-32 pb-16">
        <Button
          variant="ghost"
          onClick={() => navigate("/inventory")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Inventory
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-secondary">
              <img
                src={vehicle.images[selectedImage] || "/placeholder.svg"}
                alt={vehicle.title}
                className="w-full h-full object-cover"
              />
            </div>
            {vehicle.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {vehicle.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? "border-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${vehicle.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Vehicle Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-black mb-2">{vehicle.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-sm uppercase tracking-wide">
                  {vehicle.make} {vehicle.model}
                </span>
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <DollarSign className="h-8 w-8 text-primary" />
              <span className="text-5xl font-black text-primary">
                {vehicle.price.toLocaleString()}
              </span>
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Year</p>
                    <p className="text-lg font-bold">{vehicle.year}</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Gauge className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Mileage</p>
                    <p className="text-lg font-bold">{vehicle.mileage.toLocaleString()} mi</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Fuel className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fuel Type</p>
                    <p className="text-lg font-bold">{vehicle.fuel_type}</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <BadgeCheck className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Condition</p>
                    <p className="text-lg font-bold">{vehicle.condition}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-2xl font-black mb-4">Description</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {vehicle.description}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/chat")}
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Contact Us
              </Button>
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => setShowPaymentDialog(true)}
              >
                Buy Now
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-primary" />
                Secure Payment Process
              </DialogTitle>
              <DialogDescription className="text-base pt-4 space-y-4">
                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="font-bold text-foreground mb-2">Easy & Secure Payment</h3>
                  <p className="text-sm">
                    Make payment directly to admin for fast and secure transaction processing.
                  </p>
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="font-bold text-foreground mb-2">Accessible Refunds</h3>
                  <p className="text-sm">
                    If any delay occurs in delivery, we offer accessible refunds to ensure your satisfaction.
                  </p>
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="font-bold text-foreground mb-2">Contact Admin for Payment</h3>
                  <p className="text-sm mb-3">
                    Please chat with our admin team to complete your purchase securely.
                  </p>
                  <Button 
                    className="w-full"
                    onClick={() => {
                      setShowPaymentDialog(false);
                      navigate("/chat");
                    }}
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Chat with Admin
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground text-center pt-2">
                  <ShieldCheck className="h-4 w-4 inline mr-1" />
                  Fast & Secure Payment • Worldwide Delivery
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default VehicleDetail;
