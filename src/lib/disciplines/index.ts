import type { DisciplineConfig } from './types';
import cs from './cs';
import math from './math';
import physics from './physics';
import biology from './biology';
import chemistry from './chemistry';
import history from './history';
import literature from './literature';
import economics from './economics';
import nursing from './nursing';
import education from './education';

export type { DisciplineConfig, SuggestionTypeConfig } from './types';

export const DISCIPLINES: Record<string, DisciplineConfig> = {
  cs,
  math,
  physics,
  biology,
  chemistry,
  history,
  literature,
  economics,
  nursing,
  education,
};

export const DISCIPLINE_LIST: DisciplineConfig[] = Object.values(DISCIPLINES);

export const DEFAULT_DISCIPLINE_ID = 'cs';

export function getDiscipline(id?: string | null): DisciplineConfig {
  if (id && DISCIPLINES[id]) return DISCIPLINES[id];
  return DISCIPLINES[DEFAULT_DISCIPLINE_ID];
}
