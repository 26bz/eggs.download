import type { EggListItem } from './egg';

export interface UseEggSearchOptions {
  maxResults?: number;
  suggestions?: string[];
}

export type IndexedEgg = EggListItem & {
  nameLower: string;
  slugLower: string;
  categoryLower: string;
  repoLower: string;
};
