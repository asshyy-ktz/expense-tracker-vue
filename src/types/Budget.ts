export interface Budget {
  id: string
  category: string
  /** Monthly limit for this category. */
  limit: number
  /** yyyy-mm the budget applies to. */
  month: string
  createdAt: number
}
