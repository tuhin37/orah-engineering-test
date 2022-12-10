# This client is used to generate roll data for all students
from random import seed
from random import randint
from random import choice
import requests
from datetime import datetime, timedelta
import sqlite3
from sqlite3 import Error


# create db connection
def create_connection(db_file):
    """ create a database connection to the SQLite database
        specified by the db_file
    :param db_file: database file
    :return: Connection object or None
    """
    conn = None
    try:
        conn = sqlite3.connect(db_file)
    except Error as e:
        print(e)
    return conn


def execute_sql_query(conn, sql_query):
    """
    Query all rows in the tasks table
    :param conn: the Connection object
    :return:
    """
    cur = conn.cursor()
    cur.execute(sql_query)
    # rows = cur.fetchall()
    # for row in rows:
    #     print(row)



def random_state_generator():
    # This function generates random state between "unmark" | "present" | "absent" | "late"
    roll_states=['unmark', 'present', 'absent', 'late']
    return choice(roll_states)

def clear_existing_data():
    database = r"../back-end/backend-test.db"
    # create a database connection
    conn = create_connection(database)
    with conn:
        execute_sql_query(conn, 'Delete FROM "roll";')
        execute_sql_query(conn, 'DELETE FROM SQLITE_SEQUENCE WHERE name="roll";')
        execute_sql_query(conn, 'Delete FROM "student_roll_state";')
        execute_sql_query(conn, 'DELETE FROM SQLITE_SEQUENCE WHERE name="student_roll_state";')           
    return   

# each role reprenet each day
def create_rools(days, subject): 
    # This function creates rolls (for say 4 weeks = 30 days)
    URL = 'http://localhost:4001/roll/create'

    today = datetime.today()
    for i in range(0,days): # generate date for last 60 days from now. 
        date = today - timedelta(days=i)
        data = {
            "name": subject,
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
    for student_id in range(1,16): # hard coded the value 16 here, because this is an internal script just for generating random data
        data = {
            'student_id': student_id, 
            'roll_id': roll_id,
            'state': random_state_generator()
        }
        x = requests.post(URL, json = data)
        print(f'inserted attandence for roll-id: {roll_id} and student-id: {student_id}')
        if(x.status_code != 200):
            return




if __name__ == "__main__":
    # This creates 30 days roll entry in the roll table. It assumes that only rolls are created for maths of class 5. e.g. 'maths-5'
    #  roll table will have data from 8th Nov to 7th Dec
    days = int(input("Enter the number of days (e.g. 60) for which you would like to create rolls: "))
    
    clear_existing_data()

    # create and insert roll events
    create_rools(days, 'math-5')
    

    # insert random student attendance for each record created in the 'roll' table
    for i in range(1, days+1):
        insert_student_attendence(i)
    
    print("successful")