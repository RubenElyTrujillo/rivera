-- Migration: hide SPACES section, ensure FEATURED section exists
-- Spaces section is no longer shown on the home page (replaced by FeaturedProjectsSection).

-- Hide existing SPACES sections
UPDATE "PageSection" SET "visible" = false WHERE "type" = 'SPACES';

-- Add FEATURED section if it doesn't already exist
INSERT INTO "PageSection" ("type", "order", "visible", "config")
SELECT 'FEATURED', 3, true, '{}'
WHERE NOT EXISTS (
  SELECT 1 FROM "PageSection" WHERE "type" = 'FEATURED'
);
