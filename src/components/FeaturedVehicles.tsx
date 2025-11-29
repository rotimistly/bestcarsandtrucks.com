import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import VehicleCard from "./VehicleCard";

interface Vehicle {
  id: string;
  title: string;
  price: number;
  year: number;
  mileage: number;
  fuel_type: string;
  condition: string;
  images: string[];
}

const FeaturedVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedVehicles();
  }, []);

  const fetchFeaturedVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-4">
            Featured <span className="text-primary">Vehicles</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Handpicked premium vehicles ready for their next adventure
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading vehicles...</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No vehicles listed yet. Be the first to list yours!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map((vehicle, index) => (
              <VehicleCard
                key={vehicle.id}
                id={vehicle.id}
                image={vehicle.images[0] || "/placeholder.svg"}
                title={vehicle.title}
                price={`$${vehicle.price.toLocaleString()}`}
                year={vehicle.year}
                mileage={`${vehicle.mileage.toLocaleString()} mi`}
                fuel={vehicle.fuel_type}
                condition={vehicle.condition}
                index={index}
              />
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <a href="/inventory" className="text-primary hover:text-primary/80 font-semibold text-lg transition-colors">
            View All Inventory →
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedVehicles;
