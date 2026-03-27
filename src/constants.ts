export type MacroKey = 'cal' | 'fat' | 'pro' | 'carb'

export interface MacroTotals {
  cal: number
  fat: number
  pro: number
  carb: number
}

export const MACRO_TARGETS: Record<MacroKey, number> = {
  cal: 3100,
  fat: 275,
  pro: 135,
  carb: 20,
}

export const MACRO_META: { key: MacroKey; label: string; unit: string; shortUnit: string; targetLabel: string }[] = [
  { key: 'cal', label: 'Calories', unit: 'kcal', shortUnit: 'kcal', targetLabel: '3,100 target' },
  { key: 'fat', label: 'Fat', unit: 'grams', shortUnit: 'g', targetLabel: '275g target' },
  { key: 'pro', label: 'Protein', unit: 'grams', shortUnit: 'g', targetLabel: '135g target' },
  { key: 'carb', label: 'Net carbs', unit: 'grams', shortUnit: 'g', targetLabel: '20g limit' },
]

export const WIN_THRESHOLD = { min: 0.9, max: 1.1 }
export const CARB_WIN_THRESHOLD = { min: 0.9, max: 1.0 }

export const CAT_COLORS: Record<string, string> = {
  protein:    '#a07070',
  fat:        '#a08c5a',
  vegetable:  '#6a9a7a',
  fruit:      '#8a7098',
  spice:      '#a07850',
  cheese:     '#9a9060',
  supplement: '#6878a0',
  beverage:   '#5a8a8a',
}
