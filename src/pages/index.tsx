import HeroSection from "@/components/sections/HeroSection";
import ServicesSection from "@/components/sections/ServicesSection";
import MaterialLabSection from "@/components/sections/MaterialLabSection";
import SpacesSection from "@/components/sections/SpacesSection";
import CatalogSection from "@/components/sections/CatalogSection";
//import ContactSection from "@/components/sections/ContactSection";
import FooterSection from "@/components/sections/FooterSection";

const IMAGES = {
  hero: 'https://media.base44.com/images/public/69c17ab0315e906db529cbaf/5ab8b3a15_generated_f21e3e55.png',
  texture: 'https://media.base44.com/images/public/69c17ab0315e906db529cbaf/806a852e2_generated_7961075f.png',
  wallCladding: 'https://media.base44.com/images/public/69c17ab0315e906db529cbaf/7219abb30_generated_c7c0b4a0.png',
  deck: 'https://media.base44.com/images/public/69c17ab0315e906db529cbaf/fc7bd1af6_generated_345964df.png',
  restoration: 'https://media.base44.com/images/public/69c17ab0315e906db529cbaf/6a78b550c_generated_281d3b94.png',
  blinds: 'https://media.base44.com/images/public/69c17ab0315e906db529cbaf/0ebc9e79a_generated_56d5f617.png',
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
