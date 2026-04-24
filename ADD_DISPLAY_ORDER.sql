-- Add display_order column to civilizations table
ALTER TABLE civilizations ADD COLUMN display_order INT DEFAULT 0;

-- Set initial display_order based on current order
SET @row_number = 0;
UPDATE civilizations 
SET display_order = (@row_number:=@row_number + 1)
ORDER BY start_year DESC;

-- Create index for faster ordering
CREATE INDEX idx_display_order ON civilizations(display_order);
