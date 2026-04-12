import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed...");

  // ─── Admin user ────────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@comercializadorarivera.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Rivera2024!";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  // Only create admin user if it doesn't already exist.
  // This prevents overwriting the password on every container restart.
  const existingAdmin = await db.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await db.user.create({ data: { email: adminEmail, passwordHash } });
    console.log(`✅ Admin created: ${adminEmail}`);
  } else {
    console.log(`✅ Admin already exists: ${adminEmail} (skipping)`);
  }

  // ─── Hero ──────────────────────────────────────────────────────────────────
  const heroCount = await db.heroContent.count();
  if (heroCount === 0) {
    await db.heroContent.create({
      data: {
        subtitle: "Soluciones integrales en acabados",
        titleLine1: "SUPERFICIES",
        titleLine2: "SIN LÍMITE",
        description: "Transformamos la base de sus espacios con el catálogo más completo en pisos, muros y acabados de alta gama.",
        imageUrl: "/images/5ab8b3a15_generated_f21e3e55.png",
      },
    });
    console.log("✅ Hero");
  }

  // ─── Services ─────────────────────────────────────────────────────────────
  const servicesCount = await db.service.count();
  if (servicesCount === 0) {
    await db.service.createMany({
      data: [
        { icon: "Layers", title: "PISOS Y RECUBRIMIENTOS", subtitle: "Venta e instalación profesional", desc: "Madera sólida, ingeniería, laminados, vinílicos SPC y deck sintético para interiores y exteriores.", order: 0 },
        { icon: "Wrench", title: "RESTAURACIÓN", subtitle: "Madera, granito, mármol y decks", desc: "Recuperamos la vida de sus superficies existentes. Pulido, lijado, barnizado y mantenimiento profesional.", order: 1 },
        { icon: "Palette", title: "DECORACIÓN", subtitle: "Persianas, follaje y tapices", desc: "Soluciones decorativas que aportan confort, privacidad y naturaleza a sus espacios.", order: 2 },
        { icon: "Columns3", title: "MOLDURAS Y ACABADOS", subtitle: "MDF y madera sólida", desc: "Fabricamos la moldura exacta que tu proyecto necesita. Personalización total en medidas y colores.", order: 3 },
        { icon: "Zap", title: "TECNOLOGÍA Y CONFORT", subtitle: "Repisas y puertos ocultos", desc: "Integramos tecnología en tu mobiliario: multicontactos empotrados, consolas traseras y más.", order: 4 },
      ],
    });
    console.log("✅ Services (5)");
  }

  // ─── Categories ───────────────────────────────────────────────────────────
  const categoriesCount = await db.category.count();
  if (categoriesCount === 0) {
    await db.category.createMany({
      data: [
        { name: "Pisos",    slug: "pisos",    icon: "Layers",   order: 0 },
        { name: "Paredes",  slug: "paredes",  icon: "Columns3", order: 1 },
        { name: "Ventanas", slug: "ventanas", icon: "Sun",      order: 2 },
      ],
    });
    console.log("✅ Categories (3)");
  }

  // ─── Materials ────────────────────────────────────────────────────────────
  const materialsCount = await db.material.count();
  if (materialsCount === 0) {
    await db.material.createMany({
      data: [
        { name: "MADERA DE INGENIERÍA", subtitle: "7 colecciones únicas", desc: "Piso natural pre-acabado con vetas y tonos irrepetibles. Colecciones: Loft Life, Bamboo, Les Terres, Vitare, Loft Mate, True Toro y Utopia.", spec: "APLICACIÓN: RESIDENCIAL", collections: JSON.stringify(["Loft Life", "Bamboo", "Les Terres", "Vitare", "Loft Mate", "True Toro", "Utopia"]), order: 0 },
        { name: "LAMINADOS", subtitle: "4 colecciones", desc: "Fibras de madera con resinas de alta resistencia. Ambiente cálido y moderno. Colecciones: Splash, Clásico, Select y Vintage.", spec: "ABRASIÓN: AC3–AC4", collections: JSON.stringify(["Splash", "Clásico", "Select", "Vintage"]), order: 1 },
        { name: "VINÍLICOS SPC", subtitle: "WPC · LVT · SPC", desc: "Recubrimiento de PVC de última generación. Bajo costo, alta resistencia a impactos y abrasión. Fácil instalación con sistema clic.", spec: "RESISTENCIA: AGUA", collections: JSON.stringify([]), order: 2 },
        { name: "DECK SINTÉTICO", subtitle: "Residencial y comercial", desc: "Compuesto de madera y plástico (WPC) para exteriores. Alta durabilidad, poco mantenimiento, diseño tipo tablón natural.", spec: "USO: EXTERIOR", collections: JSON.stringify([]), order: 3 },
        { name: "LAMBRINES", subtitle: "PVC y madera natural", desc: "Textura, volumen y confort acústico para el plano vertical. Madera auténtica o PVC de cero mantenimiento.", spec: "TIPO: VERTICAL", collections: JSON.stringify([]), order: 4 },
        { name: "MUROS FORRADOS", subtitle: "Continuidad visual", desc: "El mismo material del piso sube al muro. Integración total para espacios más amplios y cohesivos.", spec: "EFECTO: MONOLÍTICO", collections: JSON.stringify([]), order: 5 },
      ],
    });
    console.log("✅ Materials (6)");
  }

  // ─── Nav Items ────────────────────────────────────────────────────────────
  const navCount = await db.navItem.count();
  if (navCount === 0) {
    const navPisos    = await db.navItem.create({ data: { label: "Pisos",    href: "/categorias/pisos",    order: 0 } });
    const navParedes  = await db.navItem.create({ data: { label: "Paredes",  href: "/categorias/paredes",  order: 1 } });
    const navVentanas = await db.navItem.create({ data: { label: "Ventanas", href: "/categorias/ventanas", order: 2 } });
    await db.navItem.create({ data: { label: "Proyectos", href: "/#proyectos", order: 3 } });
    await db.navItem.create({ data: { label: "Contacto",  href: "/#contacto",  order: 4 } });

    await db.navItem.createMany({
      data: [
        { label: "Pisos Laminados",     href: "/materiales/laminados",      order: 0, parentId: navPisos.id },
        { label: "Pisos de Madera",     href: "/materiales/madera",         order: 1, parentId: navPisos.id },
        { label: "Pisos Vinílicos SPC", href: "/materiales/vinilicos-spc",  order: 2, parentId: navPisos.id },
        { label: "Deck Sintético",      href: "/materiales/deck-sintetico", order: 3, parentId: navPisos.id },
      ],
    });
    await db.navItem.createMany({
      data: [
        { label: "Lambrines",      href: "/materiales/lambrines",      order: 0, parentId: navParedes.id },
        { label: "Muros Forrados", href: "/materiales/muros-forrados",  order: 1, parentId: navParedes.id },
      ],
    });
    await db.navItem.createMany({
      data: [
        { label: "Persianas", href: "/materiales/persianas", order: 0, parentId: navVentanas.id },
      ],
    });
    console.log("✅ NavItems");
  }

  // ─── Page Sections ────────────────────────────────────────────────────────
  const sectionsCount = await db.pageSection.count();
  if (sectionsCount === 0) {
    await db.pageSection.createMany({
      data: [
        {
          type: "HERO",
          order: 0,
          visible: true,
          config: JSON.stringify({
            slides: [
              {
                titleLine1: "SUPERFICIES",
                titleLine2: "SIN LÍMITE",
                subtitle: "Soluciones integrales en acabados",
                description: "Transformamos la base de sus espacios con el catálogo más completo en pisos, muros y acabados de alta gama.",
                imageUrl: "/images/5ab8b3a15_generated_f21e3e55.png",
              },
              {
                titleLine1: "MUROS",
                titleLine2: "DE AUTOR",
                subtitle: "Revestimientos para interiores y exteriores",
                description: "Desde azulejo artesanal hasta WPC premium — materiales que hablan por sí solos.",
                imageUrl: "/images/7219abb30_generated_c7c0b4a0.png",
              },
              {
                titleLine1: "DECK",
                titleLine2: "Y TERRAZAS",
                subtitle: "Espacios exteriores con carácter",
                description: "Resistentes al clima, diseñados para durar y embellecerse con el tiempo.",
                imageUrl: "/images/fc7bd1af6_generated_345964df.png",
              },
            ],
            autoPlayMs: 5000,
          }),
        },
        { type: "VENTAS",   order: 1, visible: true,  config: "{}" },
        { type: "SHOWROOM", order: 2, visible: true,  config: "{}" },
        { type: "FEATURED", order: 3, visible: true,  config: "{}" },
        { type: "CTA",      order: 4, visible: true,  config: "{}" },
        { type: "SPACES",   order: 5, visible: true,  config: "{}" },
        { type: "CATALOG",  order: 6, visible: true,  config: "{}" },
        { type: "CONTACT",  order: 7, visible: true,  config: "{}" },
      ],
    });
    console.log("✅ PageSections (8)");
  }

  // ─── Space Projects ───────────────────────────────────────────────────────
  const spacesCount = await db.spaceProject.count();
  if (spacesCount === 0) {
    await db.spaceProject.createMany({
      data: [
        { title: "Pisos de Ingeniería", category: "Residencial", imageUrl: "/images/7219abb30_generated_c7c0b4a0.png", order: 0 },
        { title: "Deck Exterior", category: "Exterior", imageUrl: "/images/fc7bd1af6_generated_345964df.png", order: 1 },
        { title: "Restauración", category: "Comercial", imageUrl: "/images/6a78b550c_generated_281d3b94.png", order: 2 },
        { title: "Persianas y Cortinas", category: "Residencial", imageUrl: "/images/0ebc9e79a_generated_56d5f617.png", order: 3 },
      ],
    });
    console.log("✅ Space Projects (4)");
  }

  // ─── Catalog ──────────────────────────────────────────────────────────────
  const catalogCount = await db.catalogContent.count();
  if (catalogCount === 0) {
    await db.catalogContent.create({
      data: {
        title: "Catálogo completo",
        description: "Descarga nuestro catálogo con especificaciones técnicas, colecciones de pisos, colores y fichas de cada producto.",
        pdfUrl: "/CR%20CATALOGO.pdf",
        buttonText: "DESCARGAR CATÁLOGO PDF",
      },
    });
    console.log("✅ Catalog");
  }

  // ─── Contact Info ─────────────────────────────────────────────────────────
  const contactCount = await db.contactInfo.count();
  if (contactCount === 0) {
    await db.contactInfo.create({
      data: {
        whatsappPhone: "525629671869",
        phone1: "+52 56 29 67 18 69",
        phone2: "+52 55 79 16 78 44",
        email: "jorgeri_1990@hotmail.com",
        hoursText: "Lunes a Viernes\n9:00 AM — 10:00 PM",
        surfaceOptions: JSON.stringify([
          "Piso de Madera de Ingeniería",
          "Piso Laminado",
          "Piso Vinílico SPC",
          "Deck Sintético",
          "Lambrines / Muros",
          "Persianas / Cortinas",
          "Restauración / Pulido",
          "Molduras",
          "Otro",
        ]),
      },
    });
    console.log("✅ Contact Info");
  }

  // ─── Footer ───────────────────────────────────────────────────────────────
  const footerCount = await db.footerContent.count();
  if (footerCount === 0) {
    await db.footerContent.create({
      data: {
        tagline: "Soluciones integrales en acabados y decoración de interiores.",
        services: JSON.stringify([
          "Pisos y Recubrimientos",
          "Mantenimiento y Restauración",
          "Decoración y Complementos",
          "Molduras y Acabados",
          "Tecnología y Confort",
          "Persianas y Cortinas",
        ]),
      },
    });
    console.log("✅ Footer");
  }

  // ─── SEO Settings ─────────────────────────────────────────────────────────
  const seoCount = await db.seoSettings.count();
  if (seoCount === 0) {
    await db.seoSettings.create({
      data: {
        title: "Comercializadora Rivera | Pisos, Recubrimientos y Restauracion en CDMX",
        description: "Especialistas en pisos y acabados en CDMX: madera solida, madera de ingenieria, laminados, vinilicos SPC, deck sintetico, persianas, muros forrados, mantenimiento y restauracion profesional.",
        keywords: "pisos y recubrimientos, pisos de madera, madera de ingenieria, pisos laminados, pisos vinilicos spc, deck sintetico, lambrines, muros forrados, persianas y cortinas, mantenimiento de pisos, restauracion de pisos, pulido de madera, pulido de marmol y granito, molduras y acabados, instalacion de pisos en cdmx",
        ogImageUrl: "",
      },
    });
    console.log("✅ SEO Settings");
  }

  console.log("\n🎉 Seed completado.");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
