// Admin-editable storefront settings, persisted in the `Setting` table.
// Replaces the localStorage bridge in pathos-store.js but keeps the same
// shapes + defaults so the ported UI works unchanged. Objects are
// shallow-merged over defaults (new fields appear automatically), exactly
// like PathosStore.load().
import { prisma } from "./prisma";
import type {
  AnnouncementSetting,
  MenuItem,
  PopupSetting,
  SeasonSetting,
  StoreSettings,
} from "./types";

export const DEFAULT_MENU: MenuItem[] = [
  { id: "about", label: "About", type: "page", enabled: true, system: true },
  { id: "collections", label: "Collections", type: "collections", enabled: true, system: true },
  { id: "jewelry", label: "Jewelry & Accessories", type: "page", enabled: true, system: true },
];

// Links shown in the "Collections" hover mega-menu — admin-editable.
export const DEFAULT_COLLECTIONS: string[] = [
  "New In",
  "Aegean",
  "Gemstones",
  "Shells & Corals",
  "Hematite",
  "Minerals",
  "Talismans",
  "Bridal",
  "Archive",
];

export const DEFAULT_POPUP: PopupSetting = {
  enabled: true,
  heading: "The Summer Edit is here",
  message: "Enjoy 15% off your first order — handmade Aegean pieces, made to last.",
  code: "AEGEAN15",
  button: "Shop the offer",
  delay: 1.2,
  frequency: "session",
};

export const DEFAULT_ANNOUNCEMENT: AnnouncementSetting = {
  enabled: true,
  text: "FREE SHIPPING ACROSS GREECE & THE EU FOR ORDERS ABOVE 100€",
};

export const DEFAULT_SEASON: SeasonSetting = {
  key: "none",
  useGreeting: false,
  auto: false,
};

export const DEFAULT_SETTINGS: StoreSettings = {
  menu: DEFAULT_MENU,
  collections: DEFAULT_COLLECTIONS,
  popup: DEFAULT_POPUP,
  announcement: DEFAULT_ANNOUNCEMENT,
  season: DEFAULT_SEASON,
};

type SettingKey = keyof StoreSettings;

// Setting.value is stored as JSON text (portable across SQLite/Postgres).
function parseJson(raw: string | null | undefined): unknown {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function mergeDefault<K extends SettingKey>(key: K, value: unknown): StoreSettings[K] {
  const def = DEFAULT_SETTINGS[key];
  if (Array.isArray(def)) {
    return (Array.isArray(value) ? value : def) as StoreSettings[K];
  }
  if (value && typeof value === "object") {
    return { ...(def as object), ...(value as object) } as StoreSettings[K];
  }
  return def;
}

export async function getSetting<K extends SettingKey>(key: K): Promise<StoreSettings[K]> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return mergeDefault(key, parseJson(row?.value));
}

export async function getAllSettings(): Promise<StoreSettings> {
  const rows = await prisma.setting.findMany();
  const map = new Map(rows.map((r) => [r.key, parseJson(r.value)]));
  return {
    menu: mergeDefault("menu", map.get("menu")),
    collections: mergeDefault("collections", map.get("collections")),
    popup: mergeDefault("popup", map.get("popup")),
    announcement: mergeDefault("announcement", map.get("announcement")),
    season: mergeDefault("season", map.get("season")),
  };
}

export async function saveSetting<K extends SettingKey>(
  key: K,
  value: StoreSettings[K],
): Promise<void> {
  const json = JSON.stringify(value);
  await prisma.setting.upsert({
    where: { key },
    create: { key, value: json },
    update: { value: json },
  });
}
