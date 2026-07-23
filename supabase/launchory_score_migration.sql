-- The Launchory Score formula needs a per-product save count, which
-- doesn't exist yet (saved_products only tracks per-user rows). Add a
-- denormalized counter on products, kept in sync via triggers since
-- save/unsave happens directly from the client (own-row RLS on
-- saved_products), not through a service-role API route like views is.

ALTER TABLE products ADD COLUMN IF NOT EXISTS saves_count integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION update_product_saves_count()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE products SET saves_count = saves_count + 1 WHERE id = NEW.product_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE products SET saves_count = GREATEST(saves_count - 1, 0) WHERE id = OLD.product_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_saved_products_insert ON saved_products;
CREATE TRIGGER trg_saved_products_insert
AFTER INSERT ON saved_products
FOR EACH ROW EXECUTE FUNCTION update_product_saves_count();

DROP TRIGGER IF EXISTS trg_saved_products_delete ON saved_products;
CREATE TRIGGER trg_saved_products_delete
AFTER DELETE ON saved_products
FOR EACH ROW EXECUTE FUNCTION update_product_saves_count();

-- Backfill counts for any saves that already exist.
UPDATE products p
SET saves_count = (SELECT COUNT(*) FROM saved_products sp WHERE sp.product_id = p.id);
