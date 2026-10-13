-- QueAN uses a blue accent by default. Earlier builds shipped Axolotl's pink
-- default, so normalise it here for both fresh installs (the column default is
-- still applied first) and existing rows.
UPDATE settings SET accent_color = 'blue' WHERE accent_color = 'pink';
