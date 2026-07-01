import type { IconType } from 'react-icons';
import {
  LuPaintbrush,
  LuZap,
  LuDroplet,
  LuHammer,
  LuBlocks,
  LuSparkles,
  LuWind,
  LuWrench,
  LuLeaf,
  LuLayers,
  LuSquare,
  LuBug,
  LuHouse,
  LuTruck,
  LuScissors,
  LuLightbulb,
  LuTrees,
  LuKey,
  LuPlug,
  LuThermometer,
  LuTag,
} from 'react-icons/lu';

/** Opções oferecidas no seletor (key salva no banco → iconKey). */
export const ICON_OPTIONS: { key: string; Icon: IconType }[] = [
  { key: 'paintbrush', Icon: LuPaintbrush },
  { key: 'zap', Icon: LuZap },
  { key: 'droplet', Icon: LuDroplet },
  { key: 'hammer', Icon: LuHammer },
  { key: 'blocks', Icon: LuBlocks },
  { key: 'sparkles', Icon: LuSparkles },
  { key: 'wind', Icon: LuWind },
  { key: 'wrench', Icon: LuWrench },
  { key: 'leaf', Icon: LuLeaf },
  { key: 'layers', Icon: LuLayers },
  { key: 'square', Icon: LuSquare },
  { key: 'bug', Icon: LuBug },
  { key: 'house', Icon: LuHouse },
  { key: 'truck', Icon: LuTruck },
  { key: 'scissors', Icon: LuScissors },
  { key: 'lightbulb', Icon: LuLightbulb },
  { key: 'trees', Icon: LuTrees },
  { key: 'key', Icon: LuKey },
  { key: 'plug', Icon: LuPlug },
  { key: 'thermometer', Icon: LuThermometer },
];

/** Compatibilidade com iconKeys antigos do seed. */
const ALIASES: Record<string, string> = {
  'paint-roller': 'paintbrush',
  bolt: 'zap',
  bricks: 'blocks',
  fence: 'square',
  home: 'house',
  wallet: 'key',
};

const BY_KEY = new Map(ICON_OPTIONS.map((o) => [o.key, o.Icon]));

export function iconFor(iconKey: string | null | undefined): IconType {
  if (!iconKey) return LuTag;
  return BY_KEY.get(iconKey) ?? BY_KEY.get(ALIASES[iconKey] ?? '') ?? LuTag;
}

export function CategoryIcon({ iconKey, size = 20 }: { iconKey: string | null; size?: number }) {
  const Icon = iconFor(iconKey);
  return <Icon size={size} />;
}
