import { motion } from "framer-motion";
import VehicleCard from "./VehicleCard";
import truck1 from "@/assets/truck-1.jpg";
import car1 from "@/assets/car-1.jpg";
import suv1 from "@/assets/suv-1.jpg";

const vehicles = [
  {
    image: truck1,
    title: "Ford F-150 Raptor",
    price: "$68,500",
    year: 2023,
    mileage: "12K mi",
    fuel: "Gas",
    condition: "Like New"
  },
  {
    image: car1,
    title: "Mercedes-Benz S-Class",
    price: "$95,000",
    year: 2023,
    mileage: "8K mi",
    fuel: "Hybrid",
    condition: "Certified"
  },
  {
    image: suv1,
    title: "Jeep Wrangler Rubicon",
    price: "$52,900",
    year: 2022,
    mileage: "25K mi",
    fuel: "Gas",
    condition: "Excellent"
  }
];

const FeaturedVehicles = () => {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((vehicle, index) => (
            <VehicleCard key={index} {...vehicle} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <button className="text-primary hover:text-primary/80 font-semibold text-lg transition-colors">
            View All Inventory →
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedVehicles;
