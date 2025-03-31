export interface Column {
  id: string
  title: string
}

export const defaultColumns: Column[] = [
  { id: 'drafts', title: 'Drafts' },
  { id: 'presented', title: 'Presented to customer' },
  { id: 'waiting', title: 'Waiting for decision' },
  { id: 'approved', title: 'Approved' }
] 