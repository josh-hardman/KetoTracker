export interface Food {
  id: number
  name: string
  unit: string
  fat: number
  protein: number
  net_carbs: number
  calories: number
  category: string | null
  therapeutic_tier: number | null
  therapeutic_note: string | null
  therapeutic_tags: string[] | null
}

export interface DailyLog {
  date: string
  servings: number
  logged_at: string | null
  created_at: string | null
  foods: Food
}
