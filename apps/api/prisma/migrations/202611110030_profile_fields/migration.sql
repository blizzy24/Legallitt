-- D-15: client profile fields drawn on Edit Profile (profile-2). Additive; old images ignore it.
CREATE TABLE client_profiles (
  user_id       uuid PRIMARY KEY REFERENCES users(id) ON DELETE NO ACTION ON UPDATE NO ACTION,
  date_of_birth date,
  gender        text CHECK (gender IN ('female','male','other','prefer_not_to_say')),
  city          text,
  state         text,
  country       text,
  updated_at    timestamptz(6) NOT NULL DEFAULT now()
);
