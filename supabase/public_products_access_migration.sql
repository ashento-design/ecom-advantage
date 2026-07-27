-- Product detail pages are now public (no auth required to view a
-- product) — this is a defensive, idempotent verification/fix for that,
-- safe to run even if the anon SELECT policy already exists. The product
-- feed on the dashboard already reads `products` via the anon key today,
-- which is strong evidence this access already works, but there was no
-- tracked migration file establishing it, so this makes it explicit.

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view products" ON products;
CREATE POLICY "Public can view products"
ON products FOR SELECT
TO anon, authenticated
USING (true);

GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.products TO authenticated;
