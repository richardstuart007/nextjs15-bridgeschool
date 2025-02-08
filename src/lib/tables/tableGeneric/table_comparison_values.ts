export type Comparison_operator =
  | '='
  | 'LIKE'
  | 'NOT LIKE'
  | '>'
  | '>='
  | '<'
  | '<='
  | 'IN'
  | 'NOT IN'

export const Comparison_values = [
  { optionLabel: 'Equal', optionValue: '=' },
  { optionLabel: 'Like', optionValue: 'LIKE' },
  { optionLabel: 'Greater Than', optionValue: '>' },
  { optionLabel: 'Greater Than or Equal', optionValue: '>=' },
  { optionLabel: 'Less Than', optionValue: '<' },
  { optionLabel: 'Less Than or Equal', optionValue: '<=' },
  { optionLabel: 'In', optionValue: 'IN' },
  { optionLabel: 'Not In', optionValue: 'NOT IN' }
]
