import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedVehicles from "@/components/FeaturedVehicles";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <FeaturedVehicles />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
