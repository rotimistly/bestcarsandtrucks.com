import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedVehicles from "@/components/FeaturedVehicles";
import Footer from "@/components/Footer";
import ChatButton from "@/components/ChatButton";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <FeaturedVehicles />
      </main>
      <Footer />
      <ChatButton />
    </div>
  );
};

export default Index;
