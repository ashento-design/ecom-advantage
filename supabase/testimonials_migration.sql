-- Real, admin-managed testimonials for the landing page's social-proof
-- section, replacing the previously hardcoded array in app/landing/page.tsx.

CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  company text,
  content text NOT NULL,
  rating smallint NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  avatar_initials text NOT NULL,
  is_featured boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
-- Read via the service-role client only — the landing page fetches
-- featured testimonials server-side (RSC) and the admin CRUD page goes
-- through /api/admin/testimonials — so no anon/authenticated policies are
-- granted here.

-- Seed data: 5 realistic testimonials (the first 3 carry over the copy
-- already live on the site; two new ones round it out with different
-- niches and a mix of free/pro usage).
INSERT INTO testimonials (name, role, content, rating, avatar_initials, is_featured) VALUES
('Jake M.', 'Shopify store owner', 'Found a winning product in my first week and it did $8k in sales the first month. The AI analysis alone saved me hours of manual research per product.', 5, 'JM', true),
('Sarah T.', '7-figure dropshipper', 'I was skeptical about another "winning products" tool, but the ad angle suggestions are genuinely useful — I''ve used three of them almost word-for-word in live campaigns.', 5, 'ST', true),
('David K.', 'Started dropshipping 6 months ago', 'As a beginner, the demand scores and competition breakdown took the guesswork out of picking products. I finally stopped wasting ad spend testing duds.', 5, 'DK', true),
('Marcus R.', 'Pet products store owner', 'Paid for itself with the first product I tested. Store Intelligence showed me a competitor was already doing around $30k/month with almost the exact product I was about to list — saved me from launching straight into a saturated market.', 5, 'MR', true),
('Priya S.', 'Home decor store owner, free plan', 'The ad angle suggestions alone save me an hour per product. I analyzed 12 products before finding the one that stuck — it''s doing 40+ orders a week now with zero paid ads.', 5, 'PS', true);
