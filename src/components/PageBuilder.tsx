import type { IPageSection, IPageData, ISpaceCategory, ISpaceProject } from "@/domain/types";
import HeroSection from "@/components/sections/HeroSection";
import ServicesSection from "@/components/sections/ServicesSection";
import ProductsSection from "@/components/sections/ShowroomSection";
import FeaturedProjectsSection from "@/components/sections/FeaturedProjectsSection";
import CTASection from "@/components/sections/CTASection";
import SpacesSection from "@/components/sections/SpacesSection";
import CatalogSection from "@/components/sections/CatalogSection";
import ContactSection from "@/components/sections/ContactSection";

export interface PageBuilderData {
  pageData: IPageData;
  showShowroom: boolean;
  spaceCategories: ISpaceCategory[];
  featuredProjects: ISpaceProject[];
  heroImageUrl: string;
  textureImageUrl: string;
}

interface PageBuilderProps {
  sections: IPageSection[];
  data: PageBuilderData;
}

/**
 * Maps each IPageSection record (from DB) to its corresponding
 * section component and renders them in order.
 * Unknown or unrecognised section types are silently skipped.
 */
export default function PageBuilder({ sections, data }: PageBuilderProps) {
  const { pageData, showShowroom, spaceCategories, featuredProjects, heroImageUrl, textureImageUrl } = data;
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
            // Showroom visibility is also controlled by showShowroom from siteConfig,
            // independently of the section's `visible` flag in the DB.
            return showShowroom ? (
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
                textureImage={textureImageUrl}
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
