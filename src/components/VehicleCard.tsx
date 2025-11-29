import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Gauge, Fuel } from "lucide-react";

interface VehicleCardProps {
  image: string;
  title: string;
  price: string;
  year: number;
  mileage: string;
  fuel: string;
  condition: string;
  index: number;
}

const VehicleCard = ({ image, title, price, year, mileage, fuel, condition, index }: VehicleCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="group overflow-hidden bg-card border-border hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
        <div className="relative overflow-hidden aspect-[4/3]">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground font-semibold">
            {condition}
          </Badge>
        </div>
        
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
            <div className="text-right">
              <div className="text-2xl font-black text-primary">{price}</div>
            </div>
          </div>

          <div className="flex gap-4 mb-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{year}</span>
            </div>
            <div className="flex items-center gap-1">
              <Gauge className="h-4 w-4" />
              <span>{mileage}</span>
            </div>
            <div className="flex items-center gap-1">
              <Fuel className="h-4 w-4" />
              <span>{fuel}</span>
            </div>
          </div>

          <Button className="w-full bg-secondary hover:bg-secondary/80 text-foreground font-semibold">
            View Details
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default VehicleCard;
