export interface Column {
  id: string
  title: string
}

export const defaultColumns: Column[] = [
  { id: 'drafts', title: 'Drafts' },
  { id: 'presented', title: 'Presented' },
  { id: 'approved', title: 'Approved' }
] 