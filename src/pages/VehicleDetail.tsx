import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Gauge, Fuel, BadgeCheck, DollarSign, ShieldCheck, MessageCircle, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  seller_id: string | null;
}

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicle();
    checkUser();
  }, [id]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setCurrentUserId(session?.user?.id || null);
  };

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

  const handleDelete = async () => {
    if (!vehicle) return;
    
    const { error } = await supabase
      .from("vehicles")
      .delete()
      .eq("id", vehicle.id);

    if (error) {
      toast.error("Failed to delete vehicle");
    } else {
      toast.success("Vehicle deleted successfully");
      navigate("/my-listings");
    }
  };

  const isOwner = currentUserId && vehicle?.seller_id === currentUserId;

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
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/inventory")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inventory
          </Button>
          
          {isOwner && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/my-listings")}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          )}
        </div>

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

        {/* Payment Sidebar */}
        <Sheet open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <SheetContent className="overflow-y-auto w-full sm:max-w-lg">
            <SheetHeader>
              <SheetTitle className="text-2xl font-black flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-primary" />
                Payment Options
              </SheetTitle>
              <SheetDescription asChild>
                <div className="text-base pt-4 space-y-4">
                  {/* Full Payment */}
                  <div className="bg-card border border-border rounded-lg p-4">
                    <h3 className="font-bold text-foreground mb-1">Full Payment</h3>
                    <p className="text-3xl font-black text-primary mb-1">
                      ${vehicle?.price.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Pay in full and drive away — no monthly payments.
                    </p>
                  </div>

                  {/* Down Payment */}
                  <div className="bg-card border-2 border-primary rounded-lg p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-foreground">Down Payment</h3>
                      <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">POPULAR</span>
                    </div>
                    <p className="text-3xl font-black text-primary mb-1">$800</p>
                    <p className="text-sm text-muted-foreground">
                      Secure the vehicle with just $800 down. Remaining balance of ${((vehicle?.price || 0) - 800).toLocaleString()} paid through financing.
                    </p>
                  </div>

                  {/* Financing */}
                  <div className="bg-card border border-border rounded-lg p-4">
                    <h3 className="font-bold text-foreground mb-2">💰 Financing Available</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Down Payment</span>
                        <span className="font-bold text-foreground">$800</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Est. 36 months</span>
                        <span className="font-bold text-foreground">${Math.round(((vehicle?.price || 0) - 800) / 36).toLocaleString()}/mo</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Est. 48 months</span>
                        <span className="font-bold text-foreground">${Math.round(((vehicle?.price || 0) - 800) / 48).toLocaleString()}/mo</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Est. 60 months</span>
                        <span className="font-bold text-foreground">${Math.round(((vehicle?.price || 0) - 800) / 60).toLocaleString()}/mo</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">*Estimated payments. Final terms based on credit approval. Contact us for details.</p>
                  </div>

                  {/* Buy / Contact */}
                  <div className="bg-card border border-border rounded-lg p-4">
                    <h3 className="font-bold text-foreground mb-2">Ready to Buy?</h3>
                    <p className="text-sm mb-3">
                      Contact us directly via email for a secure and traceable payment process.
                    </p>
                    <a
                      href={`mailto:bestcarsandtrucks4@gmail.com?subject=Purchase Inquiry: ${vehicle?.title}&body=I am interested in purchasing ${vehicle?.title} (Price: $${vehicle?.price.toLocaleString()}).%0A%0APayment option: `}
                      className="block"
                    >
                      <Button className="w-full" size="lg">
                        <MessageCircle className="mr-2 h-5 w-5" />
                        Email: bestcarsandtrucks4@gmail.com
                      </Button>
                    </a>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-4">
                    <h3 className="font-bold text-foreground mb-2">Or Chat with Us</h3>
                    <p className="text-sm mb-3">
                      Reach us through live chat for quick assistance with payment or financing.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      size="lg"
                      onClick={() => {
                        setShowPaymentDialog(false);
                        navigate("/chat");
                      }}
                    >
                      <MessageCircle className="mr-2 h-5 w-5" />
                      Chat with Admin
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground text-center pt-2">
                    <ShieldCheck className="h-4 w-4 inline mr-1" />
                    Secure Payment • Financing Available • Worldwide Delivery
                  </div>
                </div>
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{vehicle?.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default VehicleDetail;
