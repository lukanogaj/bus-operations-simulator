ALTER TABLE replacement_assignments
ADD CONSTRAINT unique_absent_driver_per_day
UNIQUE (absent_driver_number, assignment_date);

ALTER TABLE replacement_assignments
ADD CONSTRAINT unique_duty_per_day
UNIQUE (duty_number, assignment_date);