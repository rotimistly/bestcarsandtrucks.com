import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import VehicleCard from "@/components/VehicleCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";

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
}

const MAKES = [
  "Acura", "Audi", "BMW", "Chevrolet", "Dodge", "Ford", "GMC", "Honda",
  "Hyundai", "Jeep", "Kia", "Lexus", "Lucid", "Mazda", "Mercedes-Benz",
  "Nissan", "Porsche", "Ram", "Rivian", "Subaru", "Tesla", "Toyota",
  "Volkswagen", "Volvo"
];

const FUEL_TYPES = ["Gasoline", "Electric", "Hybrid"];

const Inventory = () => {
  const [searchParams] = useSearchParams();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [selectedMake, setSelectedMake] = useState<string>("all");
  const [selectedFuel, setSelectedFuel] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<number[]>([0, 200000]);

  const activeFilterCount = [
    selectedMake !== "all",
    selectedFuel !== "all",
    priceRange[0] > 0 || priceRange[1] < 200000,
  ].filter(Boolean).length;

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    filterAndSortVehicles();
  }, [searchQuery, sortBy, vehicles, selectedMake, selectedFuel, priceRange]);

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVehicles(data || []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortVehicles = () => {
    let filtered = [...vehicles];

    if (searchQuery) {
      filtered = filtered.filter(
        (v) =>
          v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.fuel_type.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedMake !== "all") {
      filtered = filtered.filter((v) => v.make === selectedMake);
    }

    if (selectedFuel !== "all") {
      filtered = filtered.filter((v) => v.fuel_type === selectedFuel);
    }

    filtered = filtered.filter(
      (v) => v.price >= priceRange[0] && v.price <= priceRange[1]
    );

    if (sortBy === "price-low") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === "year-new") {
      filtered.sort((a, b) => b.year - a.year);
    } else if (sortBy === "year-old") {
      filtered.sort((a, b) => a.year - b.year);
    }

    setFilteredVehicles(filtered);
  };

  const clearFilters = () => {
    setSelectedMake("all");
    setSelectedFuel("all");
    setPriceRange([0, 200000]);
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-black mb-4">
            Browse <span className="text-primary">Inventory</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Find your perfect vehicle from our extensive collection
          </p>

          {/* Search, Sort & Filter Toggle */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by make, model, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48 h-12">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="year-new">Year: Newest</SelectItem>
                <SelectItem value="year-old">Year: Oldest</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="h-12 gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="bg-accent text-accent-foreground ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="bg-card border border-border rounded-xl p-6 mb-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-foreground">Filters</h3>
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground gap-1">
                      <X className="h-3 w-3" />
                      Clear All
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Make Filter */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">Make</label>
                      <Select value={selectedMake} onValueChange={setSelectedMake}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="All Makes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Makes</SelectItem>
                          {MAKES.map((make) => (
                            <SelectItem key={make} value={make}>{make}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Fuel Type Filter */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">Fuel Type</label>
                      <Select value={selectedFuel} onValueChange={setSelectedFuel}>
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="All Fuel Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Fuel Types</SelectItem>
                          {FUEL_TYPES.map((fuel) => (
                            <SelectItem key={fuel} value={fuel}>{fuel}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Price Range Filter */}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Price Range: ${priceRange[0].toLocaleString()} — ${priceRange[1].toLocaleString()}
                      </label>
                      <Slider
                        min={0}
                        max={200000}
                        step={5000}
                        value={priceRange}
                        onValueChange={setPriceRange}
                        className="mt-3"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active Filters Badges */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedMake !== "all" && (
                <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setSelectedMake("all")}>
                  {selectedMake} <X className="h-3 w-3" />
                </Badge>
              )}
              {selectedFuel !== "all" && (
                <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setSelectedFuel("all")}>
                  {selectedFuel} <X className="h-3 w-3" />
                </Badge>
              )}
              {(priceRange[0] > 0 || priceRange[1] < 200000) && (
                <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setPriceRange([0, 200000])}>
                  ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()} <X className="h-3 w-3" />
                </Badge>
              )}
            </div>
          )}

          {/* Results count */}
          <p className="text-sm text-muted-foreground mb-6">
            {filteredVehicles.length} vehicle{filteredVehicles.length !== 1 ? "s" : ""} found
          </p>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading vehicles...</p>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No vehicles found matching your criteria.</p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredVehicles.map((vehicle, index) => (
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
        </motion.div>
      </div>
    </div>
  );
};

export default Inventory;
