# Guided Flows Specification

## Purpose

Guided flows are step-by-step wizards that simplify complex multi-field admin tasks. They MUST reduce the cognitive load for non-technical users by presenting one logical step at a time, with clear progress indicators and inline validation.

## Requirements

### Requirement: Guided flow for adding products

The "Agregar Producto" guided flow MUST consist of the following steps:
1. **Basic Info**: Name, SKU, category selection, subcategory selection
2. **Details**: Description, measurements, materials, colors
3. **Images**: Main image upload with crop/resize, gallery upload
4. **Documents**: Optional PDF technical sheet upload
5. **Review**: Summary of all entered data with edit shortcuts
6. **Publish**: Confirm and save

The flow MUST be completable in ≤5 clicks from dashboard to saved product.

### Requirement: Guided flow for adding projects

The "Agregar Proyecto" guided flow MUST consist of:
1. **Basic Info**: Project name, client name (optional), date
2. **Categories**: Select products/categories used in project
3. **Gallery**: Upload project photos (min 3, max 20)
4. **Cover Image**: Select or designate cover from gallery
5. **Review**: Preview how it will appear on site
6. **Publish**: Confirm and save

The flow MUST be completable in ≤7 clicks from dashboard to live project.

### Requirement: Guided flow for updating hero section

The "Actualizar Hero" guided flow MUST consist of:
1. **Select Slide**: Choose which hero slide to edit (1-3)
2. **Image**: Upload/replace background image
3. **Content**: Headline, subheadline, CTA text, CTA link
4. **Preview**: See how it looks on mobile and desktop
5. **Publish**: Save changes

This flow MUST be completable in ≤4 clicks from dashboard to saved hero.

### Requirement: Guided flows provide inline validation

Each step MUST:
- Validate required fields before allowing "Next" progression
- Show inline error messages below invalid fields
- Preserve all entered data if user clicks "Back"
- Auto-save draft progress to localStorage to prevent data loss

### Requirement: Guided flows show clear progress

Each guided flow MUST display:
- Current step number and total steps (e.g., "Paso 2 de 5")
- Step labels in a visible progress indicator
- Estimated time remaining (e.g., "~2 minutos")

### Requirement: Guided flows are escapable

Each guided flow MUST provide:
- A visible "Guardar y salir" button that preserves progress
- Confirmation dialog if user tries to leave with unsaved changes
- Clear "Cancelar" option that warns about data loss

## Stepper UI Components

### Requirement: Stepper UI follows consistent pattern

All guided flows MUST use a shared `GuidedFlowStepper` component with:
- Horizontal step indicator at top
- "Anterior" and "Siguiente" navigation buttons
- "Guardar" button on final step
- Consistent styling across all flows

### Requirement: Progressive disclosure for advanced options

Within each step, advanced options (e.g., "Mostrar opciones avanzadas") MUST:
- Be collapsed by default to reduce visual noise
- Expand inline when clicked
- Remember expansion state during the flow session

## Scenarios

### Scenario: User completes product creation flow

- GIVEN a user clicks "Agregar Producto" from dashboard
- WHEN they complete all 6 steps without errors
- THEN they see a success confirmation
- AND the new product appears in the productos list
- AND they are redirected to the producto detail page

### Scenario: User abandons flow with unsaved data

- GIVEN a user is on step 3 of the product flow
- WHEN they click browser back button or "Cancelar"
- THEN they see a dialog: "¿Salir? Perderás los cambios no guardados."
- AND they can choose "Salir de todos modos" or "Seguir editando"

### Scenario: User corrects validation error

- GIVEN a user is on step 1 and tries to click "Siguiente" without entering a name
- WHEN the name field is empty
- THEN they see a red error: "El nombre del producto es requerido"
- AND the field is highlighted in red
- AND they can fix it and continue

### Scenario: User returns to fix a completed flow

- GIVEN a user completed the product flow and saved
- WHEN they realize they made a mistake
- THEN they can go to Productos, find their product, and click "Editar"
- AND they enter an edit mode (not the full guided flow)
- AND they can fix specific fields and save

### Scenario: User uploads images in product flow

- GIVEN a user is on step 3 (Images) of the product flow
- WHEN they drag images to the upload zone
- THEN they see upload progress indicators
- AND images appear as thumbnails when complete
- AND they can click an image to set it as main image

---

## Metrics

| Flow | Target Clicks | Max Steps |
|------|--------------|-----------|
| Add Product | ≤5 | 6 |
| Add Project | ≤7 | 6 |
| Update Hero | ≤4 | 5 |

## Component Inventory

| Component | Purpose |
|-----------|---------|
| `GuidedFlowStepper` | Horizontal step navigation |
| `GuidedFlowStep` | Wrapper for each step's content |
| `FlowNavigation` | Previous/Next/Save buttons |
| `FlowProgress` | Step X of Y indicator |
| `FlowValidation` | Inline field validation |
| `FlowDraftSave` | localStorage persistence |
| `FlowEscapeDialog` | Confirm abandon flow |
| `ImageUploader` | Drag-drop with progress |
| `GallerySorter` | Drag to reorder gallery |
