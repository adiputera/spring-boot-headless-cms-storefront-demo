CREATE TABLE quote_of_the_day_components (
    id BIGINT PRIMARY KEY,
    title VARCHAR(255),
    quote VARCHAR(1000),
    CONSTRAINT fk_quote_of_the_day_components_base FOREIGN KEY (id) REFERENCES components(id) ON DELETE CASCADE
);
