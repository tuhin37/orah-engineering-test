# This client is used to generate roll data for all students
from random import seed
from random import randint
from random import choice
import requests
from datetime import datetime, timedelta



def random_state_generator():
    # This function generates random state between "unmark" | "present" | "absent" | "late"
    roll_states=['unmark', 'present', 'absent', 'late']
    return choice(roll_states)

# each role reprenet each day
def create_rools(): 
    # This function creates rolls (for say 4 weeks = 30 days)
    URL = 'http://localhost:4001/roll/create'

    today = datetime.today()
    for i in range(0,30): # generate date for last 30 days
        date = today - timedelta(days=i)
        data = {
            "name": "math-5",
            "completed_at": f'{date.month}-{date.day}-{date.year}'
        }
        x = requests.post(URL, json = data)
        print(f'created roll for date {date}')
        if(x.status_code != 200):
            print('error')
            return
    print("rolls created successfully")
    return 


def insert_student_attendence(roll_id):
    # this fuction inserts all student's attandance for a specific roll 
    URL = "http://localhost:4001/roll/add-student-roll-state"
    for student_id in range(1,16):
        data = {
            'roll_id': roll_id, 
            'student_id': student_id, 
            'state': random_state_generator()
        }
        x = requests.post(URL, json = data)
        print(f'inserted attandence for roll-id: {roll_id} and student-id: {student_id}')
        if(x.status_code != 200):
            return




if __name__ == "__main__":
    # This creates 30 days roll entry in the roll table. It assumes that only rolls are created for maths of class 5. e.g. 'maths-5'
    #  roll table will have data from 8th Nov to 7th Dec
    # create_rools()
    

    # insert random student attendance for each record created in the 'roll' table
    for i in range(1, 31):
        insert_student_attendence(i)
    