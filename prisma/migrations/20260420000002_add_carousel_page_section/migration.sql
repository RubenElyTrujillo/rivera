-- Insert CAROUSEL section (hidden by default, let admin enable it)
INSERT INTO "PageSection" ("type", "order", "visible", "config")
SELECT 'CAROUSEL', COALESCE((SELECT MAX("order") FROM "PageSection"), 0) + 1, false, '{}'
WHERE NOT EXISTS (SELECT 1 FROM "PageSection" WHERE "type" = 'CAROUSEL');
