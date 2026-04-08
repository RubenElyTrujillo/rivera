/**
 * @deprecated Importa directamente desde los módulos específicos.
 * Este archivo existe solo para compatibilidad durante la migración.
 *
 * Rutas actuales:
 *   useAdminAuth → @/hooks/admin/useAdminAuth
 *   useToast     → @/hooks/admin/useToast
 *   Field        → @/components/admin/forms/Field
 *   AdminInput   → @/components/admin/forms/AdminInput
 *   AdminTextarea → @/components/admin/forms/AdminTextarea
 *   FormCard     → @/components/admin/ui/FormCard
 *   PageHeader   → @/components/admin/ui/PageHeader
 *   SaveButton   → @/components/admin/ui/SaveButton
 *   AdminPageSkeleton / AdminDashboardSkeleton → @/components/admin/ui/AdminSkeletons
 */
export { useAdminAuth } from "@/hooks/admin/useAdminAuth";
export { useToast } from "@/hooks/admin/useToast";
export { Field } from "@/components/admin/forms/Field";
export { AdminInput } from "@/components/admin/forms/AdminInput";
export { AdminTextarea } from "@/components/admin/forms/AdminTextarea";
export { FormCard } from "@/components/admin/ui/FormCard";
export { PageHeader } from "@/components/admin/ui/PageHeader";
export { SaveButton } from "@/components/admin/ui/SaveButton";
export { AdminPageSkeleton, AdminDashboardSkeleton } from "@/components/admin/ui/AdminSkeletons";
