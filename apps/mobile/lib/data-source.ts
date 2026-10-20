// Expo inlines only EXPO_PUBLIC_* variables. Unset/unknown values fail closed to
// fixtures; nothing changes in deployed builds until explicitly configured.
export const DATA_SOURCE =
  process.env.EXPO_PUBLIC_DATA_SOURCE === "api" ? "api" : "fixtures";
