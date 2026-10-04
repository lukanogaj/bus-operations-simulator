CREATE TABLE planned_absences (
    id SERIAL PRIMARY KEY,
    driver_number INTEGER NOT NULL REFERENCES drivers(employee_number),
    absence_type TEXT NOT NULL CHECK (absence_type IN ('HOLIDAY', 'TRAINING')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (end_date >= start_date)
);
