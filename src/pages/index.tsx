import HeroSection from "@/components/sections/HeroSection";
import ServicesSection from "@/components/sections/ServicesSection";
import MaterialLabSection from "@/components/sections/MaterialLabSection";
import SpacesSection from "@/components/sections/SpacesSection";
import CatalogSection from "@/components/sections/CatalogSection";
import FooterSection from "@/components/sections/FooterSection";

const IMAGES = {
  hero: '/images/5ab8b3a15_generated_f21e3e55.png',
  texture: '/images/806a852e2_generated_7961075f.png',
  wallCladding: '/images/7219abb30_generated_c7c0b4a0.png',
  deck: '/images/fc7bd1af6_generated_345964df.png',
  restoration: '/images/6a78b550c_generated_281d3b94.png',
  blinds: '/images/0ebc9e79a_generated_56d5f617.png',
};

export default function Home() {
  return (
    <>
      <HeroSection heroImage={IMAGES.hero} />
      <ServicesSection />
      <MaterialLabSection textureImage={IMAGES.texture} />
      <SpacesSection images={IMAGES} />
      <CatalogSection textureImage={IMAGES.texture} />
      
      <FooterSection />
    </>
  );
}
