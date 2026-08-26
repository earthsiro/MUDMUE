import type { WWBoss, WWCharacter } from "../types/wwDraft";

/**
 * Sample pools for trying out the draft flow end to end.
 *
 * Portraits are generated placeholders (inline SVG data-URIs) — no game art is
 * bundled and nothing is fetched over the network. Swap `imageUrl` per entry in
 * the Pool screen, or import a real pool from `.xlsx`, whenever you want the
 * actual portraits.
 */

/** [base, shade] per element, used for the placeholder gradient */
const ELEMENT_COLORS: Record<string, [string, string]> = {
    Aero: ["#5fe3b0", "#1f8f6a"],
    Electro: ["#b48bff", "#6b3fc4"],
    Fusion: ["#ff8a5c", "#c4442a"],
    Glacio: ["#6fc9ff", "#2a7bb8"],
    Havoc: ["#e56aa5", "#9c2a5e"],
    Spectro: ["#ffd86b", "#c99a1e"],
};

const BOSS_COLORS: [string, string] = ["#8e8ea8", "#3a3a52"];

const initialsOf = (name: string) =>
    name
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join("");

/** Circular-friendly gradient tile with the name's initials — kept tiny so localStorage stays small. */
const placeholderArt = (name: string, [base, shade]: [string, string]) => {
    const svg =
        `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">` +
        `<defs><linearGradient id="g" x1="0" y1="0" x2="0.4" y2="1">` +
        `<stop offset="0%" stop-color="${base}"/><stop offset="100%" stop-color="${shade}"/>` +
        `</linearGradient></defs>` +
        `<rect width="96" height="96" fill="url(#g)"/>` +
        `<text x="48" y="61" text-anchor="middle" font-family="Noto Sans, sans-serif" font-size="34" ` +
        `font-weight="700" fill="#14141f" fill-opacity="0.75">${initialsOf(name)}</text>` +
        `</svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

type CharacterSeed = [name: string, element: string, weaponType: string, rarity: number];

/** 40 entries — comfortably above the 28 the ban/pick tables consume. */
const CHARACTER_SEEDS: CharacterSeed[] = [
    ["Rover", "Spectro", "Sword", 5],
    ["Jiyan", "Aero", "Broadblade", 5],
    ["Yinlin", "Electro", "Rectifier", 5],
    ["Jinhsi", "Spectro", "Broadblade", 5],
    ["Changli", "Fusion", "Sword", 5],
    ["Zhezhi", "Glacio", "Rectifier", 5],
    ["Xiangli Yao", "Electro", "Gauntlets", 5],
    ["Camellya", "Havoc", "Sword", 5],
    ["Carlotta", "Glacio", "Pistols", 5],
    ["Roccia", "Havoc", "Gauntlets", 5],
    ["Phoebe", "Spectro", "Rectifier", 5],
    ["Brant", "Fusion", "Sword", 5],
    ["Cantarella", "Havoc", "Rectifier", 5],
    ["Zani", "Spectro", "Gauntlets", 5],
    ["Ciaccona", "Aero", "Pistols", 5],
    ["Cartethyia", "Aero", "Sword", 5],
    ["Lupa", "Fusion", "Broadblade", 5],
    ["Phrolova", "Havoc", "Rectifier", 5],
    ["Augusta", "Electro", "Broadblade", 5],
    ["Iuno", "Aero", "Rectifier", 5],
    ["Calcharo", "Electro", "Broadblade", 5],
    ["Encore", "Fusion", "Rectifier", 5],
    ["Verina", "Spectro", "Rectifier", 5],
    ["Lingyang", "Glacio", "Gauntlets", 5],
    ["Jianxin", "Aero", "Gauntlets", 5],
    ["Yangyang", "Aero", "Sword", 4],
    ["Chixia", "Fusion", "Pistols", 4],
    ["Baizhi", "Glacio", "Rectifier", 4],
    ["Sanhua", "Glacio", "Sword", 4],
    ["Yuanwu", "Electro", "Gauntlets", 4],
    ["Danjin", "Havoc", "Sword", 4],
    ["Taoqi", "Havoc", "Broadblade", 4],
    ["Mortefi", "Fusion", "Pistols", 4],
    ["Aalto", "Aero", "Pistols", 4],
    ["Youhu", "Glacio", "Gauntlets", 4],
    ["Lumi", "Electro", "Broadblade", 4],
    ["Anko", "Fusion", "Rectifier", 4],
    ["Galbrena", "Fusion", "Broadblade", 5],
    ["Qiuyuan", "Aero", "Sword", 4],
    ["Chisa", "Glacio", "Broadblade", 5],
];

const BOSS_SEEDS = [
    "Crownless",
    "Mourning Aix",
    "Feilian Beringal",
    "Lampylumen Myriad",
    "Mech Abomination",
    "Tempest Mephis",
    "Impermanence Heron",
    "Thundering Mephis",
    "Bell-Borne Geochelone",
    "Inferno Rider",
    "Dreamless",
    "Fallacy of No Return",
];

const slugify = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const buildMockCharacters = (): WWCharacter[] =>
    CHARACTER_SEEDS.map(([name, element, weaponType, rarity]) => ({
        id: `char_${slugify(name)}`,
        name,
        imageUrl: placeholderArt(name, ELEMENT_COLORS[element] ?? BOSS_COLORS),
        element,
        weaponType,
        rarity,
    }));

export const buildMockBosses = (): WWBoss[] =>
    BOSS_SEEDS.map((name) => ({
        id: `boss_${slugify(name)}`,
        name,
        imageUrl: placeholderArt(name, BOSS_COLORS),
    }));
