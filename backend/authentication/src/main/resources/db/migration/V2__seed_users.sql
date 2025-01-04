-- Hasło dla wszystkich użytkowników: haslo123
INSERT INTO users (name, email, password, created_at, updated_at)
VALUES 
    ('Jan Kowalski', 'jan.kowalski@example.com', '$2a$10$A3akwAuOIVi60LZ8WYcjo./EkzPqQNT/hjR5ndQBOkvrw5ey23Wcy', NOW(), NOW()),
    ('Jan Kowalski1', 'jan.kowalski1@example.com', '$2a$10$1k50s0rZAgjNFkgbQEqfMuGkZVRdYJHlCgCDjUpUWwsbcT0DC4Owa', NOW(), NOW()),
    ('Jan Kowalski2', 'jan.kowalski2@example.com', '$2a$10$VdkURr7kLVjloi7kMEVhJ.JRWd5xzAWumDfljPe/9BcaLzH87fFi6', NOW(), NOW());
