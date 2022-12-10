import { getRepository } from "typeorm"
import { NextFunction, Request, Response } from "express"
import { Group } from "../entity/group.entity"
import { GroupStudent } from "../entity/group-student.entity"
import { CreateGroupInput, PostAnalysisUpdateGroupInput, UpdateGroupInput } from "../interface/group.interface"
import { CreateGroupStudentInput } from "../interface/group-student.interface"



import { getJSDocParameterTags } from "typescript"
import { start } from "repl"
import { stat } from "fs"
import { length } from "class-validator"

export class GroupController {
  private groupRepository = getRepository(Group)
  private groupStudentRepository = getRepository(GroupStudent)

  async allGroups(request: Request, response: Response, next: NextFunction) {
    try {
      return this.groupRepository.find()
    }
    catch (e) {
      return {status: 'error', msg: e}
    }
  }

  async createGroup(request: Request, response: Response, next: NextFunction) {
    // Task 1: 
    const { body: params } = request
    
    if( params.name === undefined || params.number_of_weeks === undefined || params.roll_states === undefined || params.incidents === undefined || params.ltmt === undefined) {
      return {status: 'error', msg: 'mandatory fields are name, number_of_weeks, roll_states, incidents and ltmt'}
    }

    if(!params.name.match( /^[a-zA-Z0-9._ \t-]{1,255}$/ )) {
      return {
        status: 'error',
        msg: `name can be between 1 and 255 characters and can include [a-z], [A-Z], [0-9], [.], [_], [-], [ ], [\t]`
      }
    }

    if(!String(params.number_of_weeks).match( /^[1-5]{1}[0-2]{1}$|[1-9]{1}$/ )) {
      return {
        status: 'error',
        msg: `number_of_weeks has to be between 1 and 52`
      }
    }

    if(!params.roll_states.match( /^(?:(?:late, absent|absent, late), unmark|absent, unmark, late|unmark, absent, late|(?:late, unmark|unmark, late), absent|absent, unmark|unmark(?:, (?:absent|late))?|late(?:, absent)?|absent(?:, late)?|late, unmark|present)$/ )) {
      return {
        status: 'error',
        msg: `roll_states should be comma seperated value between [present, absent, late, unmark] e.g. `
      }
    }

    if(!String(params.incidents).match( /^(?:36[0-5]|3[0-5][0-9]|[12][0-9][0-9]|[1-9][0-9]|[1-9])$/ )) {
      return {
        status: 'error',
        msg: `incidents has to be a number in the range 1-365`
      }
    }

    if(!params.ltmt.match( /^[<>]$/ )) {
      return {
        status: 'error',
        msg: `ltmt has to be either '>' (more-than) or '<' (less-than)`
      }
    }
    

    const createGroupInput: CreateGroupInput = {
      name: params.name,
      number_of_weeks: params.number_of_weeks,
      roll_states: params.roll_states,
      incidents: params.incidents,
      ltmt: params.ltmt,
      run_at: new Date(0),  // used as default value
      student_count: 0      // used as the default value
    }
    const group = new Group()
    group.prepareToCreate(createGroupInput)
    const createdGroupObject = await this.groupRepository.save(group)
    delete createdGroupObject['run_at'];
    delete createdGroupObject['student_count'];
    try {
      return {status: 'successful', msg: createdGroupObject}
    }
    catch (e) {
      return {status: 'error', msg: e}
    }
  }



  async updateGroup(request: Request, response: Response, next: NextFunction) {
    const { body: params } = request
    
    if(params.id === undefined) {
      return {
        status: 'error',
        msg: `id is a mandatory field`
      }
    }
    if(params.id !== undefined && !String(params.id).match( /^([1-9][0-9]{0,2}|1000)$/ )) {
      return {
        status: 'error',
        msg: `id can be between 1 and 1000`
      }
    }
    
    if(params.name !== undefined && !params.name.match( /^[a-zA-Z0-9._ \t-]{1,255}$/ )) {
      return {
        status: 'error',
        msg: `name can be between 1 and 255 characters and can include [a-z], [A-Z], [0-9], [.], [_], [-], [ ], [\t]`
      }
    }

    if(params.number_of_weeks !== undefined && !String(params.number_of_weeks).match( /^[1-5]{1}[0-2]{1}$|[1-9]{1}$/ )) {
      return {
        status: 'error',
        msg: `number_of_weeks has to be between 1 and 52`
      }
    }

    if(params.roll_states !== undefined && !params.roll_states.match( /^(?:(?:late, absent|absent, late), unmark|absent, unmark, late|unmark, absent, late|(?:late, unmark|unmark, late), absent|absent, unmark|unmark(?:, (?:absent|late))?|late(?:, absent)?|absent(?:, late)?|late, unmark|present)$/ )) {
      return {
        status: 'error',
        msg: `roll_states should be comma seperated value between [present, absent, late, unmark] e.g. `
      }
    }

    if(params.incidents !== undefined && !String(params.incidents).match( /^(?:36[0-5]|3[0-5][0-9]|[12][0-9][0-9]|[1-9][0-9]|[1-9])$/ )) {
      return {
        status: 'error',
        msg: `incidents has to be a number in the range 1-365`
      }
    }

    if(params.ltmt !== undefined && !params.ltmt.match( /^[<>]$/ )) {
      return {
        status: 'error',
        msg: `ltmt has to be either '>' (more-than) or '<' (less-than)`
      }
    }
    

    let groupObject = {}
    try {
      groupObject = await this.groupRepository.findOne(params.id)
    }
    catch (e) {
      return {status: 'error', 'msg': 'something went wrong!'}
    }
    
    if(groupObject === undefined) {
      return {status: 'error', 'msg': 'group not found'}
    }

    const updateGroupInput: UpdateGroupInput = {
      id: params.id,
      name: params.name,
      number_of_weeks: params.number_of_weeks,
      roll_states: params.roll_states,
      incidents: params.incidents,
      ltmt: params.ltmt
    }
    
    const group = new Group()
    group.prepareToUpdate(updateGroupInput)
    try {
      this.groupRepository.save(group)
      return {status: 'successful', msg: `group(id=${params.id}) is updated successfully`};
    }
    catch (e) {
      return {status: 'error', msg: 'something went wrong!'}
    }
    
    
    // .then((group) => {
    //   const updateGroupInput: UpdateGroupInput = {
    //     id: params.id,
    //     name: params.name,
    //     number_of_weeks: params.number_of_weeks,
    //     roll_states: params.roll_states,
    //     incidents: params.incidents,
    //     ltmt: params.ltmt
    //   }
    //   group.prepareToUpdate(updateGroupInput)
    //   res = this.groupRepository.save(group);
    // })
    // return res
  }


  async removeGroup(request: Request, response: Response, next: NextFunction) {
    const { body: params } = request
    const groupToRemove = await this.groupRepository.findOne(params.id)
    if(groupToRemove === undefined) {
      return {status: 'error', msg: `group id '${params.id}' not found`}
    }
    await this.groupRepository.remove(groupToRemove)
    return {status: 'successful', msg: `group[id=${params.id}] deleted`}
  }

  async getGroupStudents(request: Request, response: Response, next: NextFunction) {
    // Task 1: 
    const { body: params } = request
    if(params.id === undefined) {
      return {status: 'error', msg: 'id is a mandatory field'}
    }

    if(params.id !== undefined && !String(params.id).match( /^([1-9][0-9]{0,2}|1000)$/ )) {
      return {
        status: 'error',
        msg: `id can be between 1 and 1000`
      }
    }

    const res = await this.groupRepository.query(`select first_name, last_name, id from student where id in (select student_id from group_student where group_id = ${params.id});`)
    const students = res.map(student => {
      return {
        id: student['id'], // Included the id, in case there are two or more students with the same name
        name: `${student['first_name']} ${student['last_name']}`
      }
    })
    // Return the list of Students that are in a Group
    return students
  }


  async runGroupFilters(request: Request, response: Response, next: NextFunction) {
    // Task 2:
    
    // 1. Clear out the groups (delete all the students from the groups)
    try {
      this.groupRepository.query('Delete from "group_student";')
      this.groupRepository.query('DELETE FROM SQLITE_SEQUENCE WHERE name="group_student";')
      this.groupRepository.query('UPDATE "group" SET student_count = 0;')
    }
    catch (e) {
      return {status: 'error', msg: 'something went wrong!'}
    }
    


    // 2. For each group, query the student rolls to see which students match the filter for the group
    // read all the filters first 
    
    const filters = await this.groupRepository.query('SELECT * FROM "group";')
    if(filters.length === 0) {
      return {status: 'error', msg: 'no groups found. create group first'}
    }

    filters.forEach(async filter => {
      // calculate the date brackets for each filter
      let date = new Date();
      const end_date = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`
      
      date.setDate(date.getDate() - filter['number_of_weeks']*7); // assuming school operates (including sports) 7 days a week
      const start_date = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`

      // prepare roll_status string. i.e. ['late', 'absent']
      const roll_states = filter['roll_states'].split(',')
      let roll_state_string= ''
      roll_states.forEach(state => {
        roll_state_string +=  `'${state.trim()}'`+', '
      })
      roll_state_string = roll_state_string.slice(0, -2)


      // prepare sql query string for the analysis
      const analysis_query_string = 
      `
      SELECT 
        student_id, count(student_id) as x  
      FROM 
        student_roll_state 
      WHERE 
        roll_id IN (SELECT id FROM roll WHERE completed_at BETWEEN '${start_date}' AND '${end_date}') 
      AND 
        state IN (${roll_state_string})  
      GROUP BY 
        student_id having x ${filter['ltmt']} ${filter['incidents']};
      `

      // run analysys on database
      let selected_students =  await this.groupRepository.query(analysis_query_string)
      
      // update the group(filter) records with number of students and run at values
      const postAnalysisUpdateGroupInput: PostAnalysisUpdateGroupInput = {
        id: filter['id'],
        run_at: new Date(),   // use current date
        student_count: selected_students.length      
      }
      const group = new Group()
      group.prepareToUpdatePostAnalysis(postAnalysisUpdateGroupInput)
      this.groupRepository.save(group)

      // 3. Add the list of students that match the filter to the group
      let groupStudentArray = [] 
      selected_students.forEach(student => {
        const createGroupStudentInput: CreateGroupStudentInput = {
          student_id: student['student_id'],
          group_id: filter['id'],
          incident_count: student['x']
        }
        const groupStudent = new GroupStudent()
        groupStudent.prepareToCreate(createGroupStudentInput)
        groupStudentArray.push(groupStudent)
      })
      // save all the groupsSudent objects to database
      this.groupStudentRepository.save(groupStudentArray)
    });  
    return {status: 'successful', msg: `analysis complete`}
  }
}
