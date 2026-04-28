-- 15 loads spanning Dry Van, Reefer, Flatbed, Step Deck across TX, CA, IL, GA, FL, OH, PA.
-- Pickup windows are relative to seed-run time so the data stays "fresh" without manual maintenance.
-- The notes field is intentionally loaded with negotiation hints (floors, ceilings, urgency) — the
-- HappyRobot agent reads these into the negotiation prompt to make counter-offers feel grounded.

insert into loads (load_id, origin, destination, pickup_datetime, delivery_datetime,
                   equipment_type, loadboard_rate, notes, weight, commodity_type,
                   num_of_pieces, miles, dimensions) values

('LD1001', 'Dallas, TX', 'Atlanta, GA',
  now() + interval '2 days', now() + interval '3 days',
  'Dry Van', 2400.00,
  'Hot load — broker authorized to $2650 ceiling. No detention pay. Driver-assist unload.',
  42000, 'Consumer electronics', 24, 781, 'Standard 53ft'),

('LD1002', 'Los Angeles, CA', 'Phoenix, AZ',
  now() + interval '1 day', now() + interval '2 days',
  'Reefer', 1850.00,
  'Temp 34F continuous. Drop-and-hook both ends. Floor: $1700. Repeat lane, weekly volume available.',
  38000, 'Produce', 18, 372, '53ft reefer'),

('LD1003', 'Chicago, IL', 'Columbus, OH',
  now() + interval '3 days', now() + interval '4 days',
  'Flatbed', 1450.00,
  'Tarps required (8ft). Ceiling $1600. Live load 0700-1500 only. Detention $50/hr after 2 free hours.',
  46500, 'Steel coils', 6, 354, '48ft flatbed'),

('LD1004', 'Miami, FL', 'Charlotte, NC',
  now() + interval '4 days', now() + interval '5 days',
  'Dry Van', 1750.00,
  'Floor $1600, ceiling $1900. FCFS pickup window 0600-1800. Lumper fee reimbursed with receipt.',
  35000, 'Consumer goods', 30, 720, '53ft dry van'),

('LD1005', 'Houston, TX', 'Memphis, TN',
  now() + interval '2 days', now() + interval '3 days',
  'Reefer', 1950.00,
  'Frozen, -10F. Pre-cool 1 hour before loading. Ceiling $2150. TWIC card required at origin.',
  40000, 'Frozen seafood', 22, 565, '53ft reefer'),

('LD1006', 'Pittsburgh, PA', 'Cleveland, OH',
  now() + interval '1 day', now() + interval '1 day' + interval '8 hours',
  'Dry Van', 850.00,
  'Short haul, same-day delivery. Floor $750. Hard cap $950. Backhaul opportunity from Cleveland.',
  18000, 'Auto parts', 12, 135, '53ft dry van'),

('LD1007', 'Long Beach, CA', 'Salt Lake City, UT',
  now() + interval '5 days', now() + interval '7 days',
  'Step Deck', 3200.00,
  'Oversize permit pre-pulled. Tarps + chains required. Ceiling $3500. Pilot car NOT needed.',
  44000, 'Industrial machinery', 2, 685, '48ft step deck, 10ft wide'),

('LD1008', 'Atlanta, GA', 'Boston, MA',
  now() + interval '3 days', now() + interval '5 days',
  'Reefer', 2800.00,
  'Multi-stop reefer (1 stop in NJ). Temp 38F. Ceiling $3050. Repeat shipper, gold-star carrier preferred.',
  41000, 'Pharmaceuticals', 14, 1080, '53ft reefer'),

('LD1009', 'Cleveland, OH', 'Dallas, TX',
  now() + interval '4 days', now() + interval '6 days',
  'Flatbed', 2350.00,
  'Coil rack provided. Tarps required. Floor $2150. Detention $75/hr after 2 free hours. No team needed.',
  47000, 'Steel rebar', 4, 1180, '48ft flatbed'),

('LD1010', 'Jacksonville, FL', 'Newark, NJ',
  now() + interval '6 days', now() + interval '8 days',
  'Dry Van', 2200.00,
  'Ceiling $2450. Sealed trailer required. Driver must have HAZMAT endorsement. PPE on dock.',
  39000, 'Industrial chemicals (non-haz)', 28, 940, '53ft dry van'),

('LD1011', 'Sacramento, CA', 'Seattle, WA',
  now() + interval '2 days', now() + interval '4 days',
  'Reefer', 1650.00,
  'Temp 36F. Ceiling $1850. Drop trailer at destination, 24hr return. Lumper $180 paid by broker.',
  36000, 'Wine', 600, 745, '53ft reefer'),

('LD1012', 'Philadelphia, PA', 'Chicago, IL',
  now() + interval '5 days', now() + interval '7 days',
  'Dry Van', 1550.00,
  'Floor $1400. Ceiling $1750. Appointment delivery — do not arrive early. TONU $150 if cancelled day-of.',
  32000, 'Retail apparel', 800, 760, '53ft dry van'),

('LD1013', 'San Antonio, TX', 'Denver, CO',
  now() + interval '7 days', now() + interval '9 days',
  'Step Deck', 2950.00,
  'Oversize 12ft wide. Permits + escort handled by broker. Ceiling $3300. Strong winds advisory in TX panhandle.',
  43000, 'Wind turbine blade section', 1, 945, '53ft step deck, 12ft wide'),

('LD1014', 'Tampa, FL', 'Houston, TX',
  now() + interval '4 days', now() + interval '6 days',
  'Flatbed', 2100.00,
  'Tarps + 10 chains. Floor $1900. Ceiling $2300. Driver-assist unload. Lumber stacked on bunks.',
  45000, 'Lumber', 8, 980, '48ft flatbed'),

('LD1015', 'Long Beach, CA', 'Newark, NJ',
  now() + interval '8 days', now() + interval '12 days',
  'Dry Van', 4500.00,
  'Coast-to-coast, team preferred but solo OK. Ceiling $4900. Sealed container transload. ELD must be current.',
  40000, 'Mixed retail goods', 1200, 2790, '53ft dry van');
