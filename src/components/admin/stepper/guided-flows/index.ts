import { GuidedFlowStep } from "@/hooks/admin/useGuidedFlow";

export interface GuidedFlowConfig {
  id: string;
  label: string;
  description: string;
  steps: GuidedFlowStep[];
  saveEndpoint?: string;
  saveMethod?: "POST" | "PUT";
}

export const guidedFlows: GuidedFlowConfig[] = [
  {
    id: "agregar-producto",
    label: "Agregar Producto",
    description: "Crear un nuevo producto en el catálogo",
    steps: [
      { label: "Información básica", description: "Nombre, SKU y categoría" },
      { label: "Detalles", description: "Descripción y especificaciones" },
      { label: "Imágenes", description: "Fotos del producto" },
      { label: "Documentos", description: "Hojas técnicas y certificados" },
      { label: "Revisar", description: "Verificar toda la información" },
      { label: "Publicar", description: "Confirmar y guardar" },
    ],
    saveEndpoint: "/api/productos",
    saveMethod: "POST",
  },
  {
    id: "agregar-proyecto",
    label: "Agregar Proyecto",
    description: "Registrar un nuevo proyecto",
    steps: [
      { label: "Información básica", description: "Nombre y ubicación" },
      { label: "Detalles", description: "Descripción del proyecto" },
      { label: "Imágenes", description: "Fotos del proyecto" },
      { label: "Documentos", description: "Planos y documentos" },
      { label: "Revisar", description: "Verificar toda la información" },
      { label: "Publicar", description: "Confirmar y guardar" },
    ],
    saveEndpoint: "/api/proyectos",
    saveMethod: "POST",
  },
  {
    id: "actualizar-hero",
    label: "Actualizar Hero",
    description: "Modificar el carrusel principal",
    steps: [
      { label: "Seleccionar slide", description: "Elegir cuál modificar" },
      { label: "Editar contenido", description: "Texto y enlace" },
      { label: "Cambiar imagen", description: "Nueva fotografía" },
      { label: "Revisar", description: "Verificar cambios" },
      { label: "Guardar", description: "Aplicar modificaciones" },
    ],
    saveEndpoint: "/api/content/hero",
    saveMethod: "PUT",
  },
];

export function getGuidedFlow(id: string): GuidedFlowConfig | undefined {
  return guidedFlows.find((flow) => flow.id === id);
}
