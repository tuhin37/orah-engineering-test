import { info } from "console"
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"
import { CreateGroupInput, UpdateGroupInput } from "../interface/group.interface"

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column()
  number_of_weeks: number

  @Column()
  roll_states: string

  @Column()
  incidents: number

  @Column()
  ltmt: string

  @Column({
    nullable: true,
  })
  run_at: Date

  @Column()
  student_count: number

  public prepareToCreate(input: CreateGroupInput) {
    this.name = input.name
    this.number_of_weeks = input.number_of_weeks
    this.roll_states = input.roll_states
    this.incidents = input.incidents
    this.ltmt = input.ltmt
    this.run_at = input.run_at
    this.student_count = input.student_count 
  }

  public prepareToUpdate(input: UpdateGroupInput) {
    this.id = input.id
    this.name = input.name
    this.number_of_weeks = input.number_of_weeks
    this.roll_states = input.roll_states
    this.incidents = input.incidents
    this.ltmt = input.ltmt
  }
}
