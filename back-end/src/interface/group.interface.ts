export interface CreateGroupInput {
  name: string
  number_of_weeks: number
  roll_states: string
  incidents: number
  ltmt: string
  run_at: Date
  student_count: number
}


export interface UpdateGroupInput {
  id: number
  name: string
  number_of_weeks: number
  roll_states: string
  incidents: number
  ltmt: string
}

export interface PostAnalysisUpdateGroupInput {
  id: number
  run_at: Date
  student_count: number
}