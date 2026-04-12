import type { IPageSection, IPageData, ISpaceCategory, ISpaceProject } from "@/domain/types";
import type { ISiteConfig } from "@/repositories/siteConfig.repository";
import HeroSection from "@/components/sections/HeroSection";
import ServicesSection from "@/components/sections/ServicesSection";
import ProductsSection from "@/components/sections/ShowroomSection";
import FeaturedProjectsSection from "@/components/sections/FeaturedProjectsSection";
import CTASection from "@/components/sections/CTASection";
import SpacesSection from "@/components/sections/SpacesSection";
import CatalogSection from "@/components/sections/CatalogSection";
import ContactSection from "@/components/sections/ContactSection";

const TEXTURE_IMAGE = "/images/806a852e2_generated_7961075f.png";

export interface PageBuilderData {
  pageData: IPageData;
  siteConfig: ISiteConfig;
  spaceCategories: ISpaceCategory[];
  featuredProjects: ISpaceProject[];
  heroImageUrl: string;
}

interface PageBuilderProps {
  sections: IPageSection[];
  data: PageBuilderData;
}

/**
 * Renders the home page by mapping each PageSection record to
 * the appropriate section component in order.
 * Unknown section types are silently skipped.
 */
export default function PageBuilder({ sections, data }: PageBuilderProps) {
  const { pageData, siteConfig, spaceCategories, featuredProjects, heroImageUrl } = data;
  const { hero, services, materials, catalog, contact } = pageData;

  return (
    <>
      {sections.map((section) => {
        switch (section.type) {
          case "HERO":
            return (
              <HeroSection
                key={section.id}
                heroImage={heroImageUrl}
                content={hero}
              />
            );
          case "VENTAS":
            return <ServicesSection key={section.id} services={services} />;
          case "SHOWROOM":
            return siteConfig.showShowroom ? (
              <ProductsSection key={section.id} materials={materials} />
            ) : null;
          case "SPACES":
            return (
              <SpacesSection key={section.id} categories={spaceCategories} />
            );
          case "CATALOG":
            return (
              <CatalogSection
                key={section.id}
                textureImage={TEXTURE_IMAGE}
                content={catalog}
              />
            );
          case "CONTACT":
            return <ContactSection key={section.id} contact={contact} />;
          case "CTA":
            return (
              <CTASection
                key={section.id}
                whatsappPhone={contact.whatsappPhone}
              />
            );
          case "FEATURED":
            return (
              <FeaturedProjectsSection
                key={section.id}
                projects={featuredProjects}
                categories={spaceCategories}
              />
            );
          default:
            return null;
        }
      })}
    </>
  );
}
