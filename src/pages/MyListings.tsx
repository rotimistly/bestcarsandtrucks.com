import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Pencil, Trash2, Car, X, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  make: string | null;
  model: string | null;
  year: number | null;
  price: number;
  mileage: number | null;
  fuel_type: string | null;
  condition: string | null;
  description: string | null;
  images: string[] | null;
  status: string | null;
  created_at: string | null;
}

const MyListings = () => {
  const [user, setUser] = useState<any>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deleteVehicle, setDeleteVehicle] = useState<Vehicle | null>(null);
  const [editForm, setEditForm] = useState<Partial<Vehicle>>({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      navigate("/auth");
      return;
    }
    setUser(session.user);
    fetchMyVehicles(session.user.id);
  };

  const fetchMyVehicles = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("vehicles")
      .select("*")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch your listings",
        variant: "destructive",
      });
    } else {
      setVehicles(data || []);
    }
    setLoading(false);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setEditForm({
      title: vehicle.title,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      price: vehicle.price,
      mileage: vehicle.mileage,
      fuel_type: vehicle.fuel_type,
      condition: vehicle.condition,
      description: vehicle.description,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingVehicle) return;
    setSaving(true);

    const { error } = await supabase
      .from("vehicles")
      .update({
        title: editForm.title,
        make: editForm.make,
        model: editForm.model,
        year: editForm.year,
        price: editForm.price,
        mileage: editForm.mileage,
        fuel_type: editForm.fuel_type,
        condition: editForm.condition,
        description: editForm.description,
      })
      .eq("id", editingVehicle.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update vehicle",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Vehicle updated successfully",
      });
      setEditingVehicle(null);
      if (user) fetchMyVehicles(user.id);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteVehicle) return;

    const { error } = await supabase
      .from("vehicles")
      .delete()
      .eq("id", deleteVehicle.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete vehicle",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Deleted",
        description: "Vehicle has been removed from your listings",
      });
      setDeleteVehicle(null);
      if (user) fetchMyVehicles(user.id);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-black mb-2">My Listings</h1>
            <p className="text-muted-foreground mb-8">
              Manage the vehicles you've uploaded for sale
            </p>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading your listings...</p>
              </div>
            ) : vehicles.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Car className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't uploaded any vehicles for sale
                  </p>
                  <Button onClick={() => navigate("/sell")}>
                    Sell Your First Car
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {vehicles.map((vehicle) => (
                  <Card key={vehicle.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-48 h-48 bg-muted">
                          {vehicle.images && vehicle.images[0] ? (
                            <img
                              src={vehicle.images[0]}
                              alt={vehicle.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Car className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 p-6">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div>
                              <h3 className="text-xl font-bold mb-1">{vehicle.title}</h3>
                              <p className="text-2xl font-black text-primary mb-2">
                                ${vehicle.price.toLocaleString()}
                              </p>
                              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                {vehicle.year && <span>{vehicle.year}</span>}
                                {vehicle.make && <span>• {vehicle.make}</span>}
                                {vehicle.model && <span>• {vehicle.model}</span>}
                                {vehicle.mileage && (
                                  <span>• {vehicle.mileage.toLocaleString()} miles</span>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                Status: <span className="capitalize">{vehicle.status || "active"}</span>
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(vehicle)}
                              >
                                <Pencil className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setDeleteVehicle(vehicle)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />

      {/* Edit Dialog */}
      <Dialog open={!!editingVehicle} onOpenChange={() => setEditingVehicle(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
            <DialogDescription>
              Update the details of your vehicle listing
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Title</label>
              <Input
                value={editForm.title || ""}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                placeholder="Vehicle title"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Make</label>
                <Input
                  value={editForm.make || ""}
                  onChange={(e) => setEditForm({ ...editForm, make: e.target.value })}
                  placeholder="e.g., Toyota"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Model</label>
                <Input
                  value={editForm.model || ""}
                  onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                  placeholder="e.g., Camry"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Year</label>
                <Input
                  type="number"
                  value={editForm.year || ""}
                  onChange={(e) => setEditForm({ ...editForm, year: parseInt(e.target.value) || null })}
                  placeholder="e.g., 2020"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Price ($)</label>
                <Input
                  type="number"
                  value={editForm.price || ""}
                  onChange={(e) => setEditForm({ ...editForm, price: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 25000"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Mileage</label>
                <Input
                  type="number"
                  value={editForm.mileage || ""}
                  onChange={(e) => setEditForm({ ...editForm, mileage: parseInt(e.target.value) || null })}
                  placeholder="e.g., 50000"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Fuel Type</label>
                <Input
                  value={editForm.fuel_type || ""}
                  onChange={(e) => setEditForm({ ...editForm, fuel_type: e.target.value })}
                  placeholder="e.g., Gasoline"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Condition</label>
              <Input
                value={editForm.condition || ""}
                onChange={(e) => setEditForm({ ...editForm, condition: e.target.value })}
                placeholder="e.g., Excellent"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Textarea
                value={editForm.description || ""}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Describe your vehicle..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditingVehicle(null)}>
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={saving}>
                <Check className="h-4 w-4 mr-1" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteVehicle} onOpenChange={() => setDeleteVehicle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteVehicle?.title}"? This action cannot be undone.
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
  );
};

export default MyListings;
