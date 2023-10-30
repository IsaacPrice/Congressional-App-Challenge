from flask import Flask, render_template, request, session, redirect, url_for, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import timezone, datetime
import os
 
# Configure the Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = 'jh1f4wey3asd4f8'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///site.db'
db = SQLAlchemy(app)

# This will hold relevant data to the user
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    first_name = db.Column(db.String(20), unique=False, nullable=False)
    last_name = db.Column(db.String(20), unique=False, nullable=False)
    password = db.Column(db.String(30), unique=False, nullable=False)
    workouts = db.relationship('Workout', backref='user', lazy=True)

class Workout(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    description = db.Column(db.String(200))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # <-- This is the new line
    exercises = db.relationship('Exercise', backref='workout', lazy=True)
    
class Exercise(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    workout_id = db.Column(db.Integer, db.ForeignKey('workout.id'), nullable=False)
    sets = db.relationship('Set', backref='exercise', lazy=True)

class Set(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    weight = db.Column(db.Integer, nullable=False)
    reps = db.Column(db.Integer, nullable=False)
    exercise_id = db.Column(db.Integer, db.ForeignKey('exercise.id'), nullable=False)

class Goal(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    type = db.Column(db.String(30), nullable=False)  # 'steps', 'exercise', 'weight'
    name = db.Column(db.String(20), nullable=True)
    description = db.Column(db.String(50), nullable=True)
    target = db.Column(db.Integer, nullable=False)  # target count/steps/weight
    current = db.Column(db.Integer, default=0)  # current count/steps/weight
    due_date = db.Column(db.DateTime, nullable=True)  # optional due date

    def __repr__(self):
        return f"Goal('{self.type}', '{self.target}')"

    def serialize(self):
        if self.type == "steps" or self.type == "exercise":
            return {
                'id'         : self.id,
                'user_id'    : self.user_id,
                'type'       : self.type,
                'name'       : self.name,
                'description': self.description,
                'current'    : self.current,
                'target'     : self.target
            }
        else:
            return {
                'id'         : self.id,
                'user_id'    : self.user_id,
                'type'       : self.type,
                'name'       : self.name,
                'description': self.description,
                'current'    : self.current,
                'target'     : self.target,
                'due'        : self.due_date
            }

# If they try to create an account, they need to have empty goals to avoid errors
def create_empty_goals(user_id: int):
    step_goal = Goal(user_id=user_id, type='steps', name='Steps', target=10000, description="Steps taken daily")
    exercise_goal = Goal(user_id=user_id, type='exercise', name='Exercises', target=4, description="Exercises done weekly")
    db.session.add(step_goal)
    db.session.add(exercise_goal)
    db.session.commit()


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=["GET", "POST"])
def login():
    if request.method == "POST":
        error = None
        username = request.form.get("username")
        password = request.form.get("password")

        # Ensures the username and password is there
        if not username or not password:
            error = "All fields need to be filled out."
        
        # Make sure the username and password are the correct length
        if len(username) > 20:
            error = "Username does not exist."
        elif len(password) > 30:
            error = "Password is incorrect."
        
        # Query the database for the user
        if error is None:
            user = db.session.query(User).filter_by(username=username).first()
            # Check the password before logging in
            if user:
                if user.password == password:
                    session['user_id'] = user.id # Means they are now logged in
                    return redirect(url_for("dashboard"))
                else:
                    error = "Password is incorrect."
            else:
                error = "Couldn't find user."

        flash(error, 'error')
        return redirect(url_for('login'))

    # If the user didn't post, we will return the login page
    else:
        return render_template('login.html')

@app.route('/register', methods=["GET", "POST"])
def register():
    error = None
    if request.method == "POST":
        username = request.form.get("username")
        first_name = request.form.get("first-name")
        last_name = request.form.get("last-name")
        password = request.form.get("password")
        retype = request.form.get("retype")

        # Check for any empty parts of the form
        if not username or not password or not retype or not first_name or not last_name:
            error = "All fields need filled out."
        
        # Verifies the password and retyped password are the same
        if password != retype:
            error = "Passwords need to be the same."

        # Makes sure the username and password aren't too long
        if len(username) > 20:
            error = "Username is too long (max 20 characters)."
        elif len(password) > 30:
            error = "Password is too long (max 30 characters)."
        elif len(first_name) > 20:
            error = "First name is too long (max 20 characters)."
        elif len(last_name) > 20:
            error = "Last name is too long (max 20 characters)."

        # Check the database if the username is already in use
        used_username = db.session.query(User.username).filter_by(username=username).first()
        if used_username is not None:
            error = "Username is already in use."

        # Checks the password is long enough
        if len(password) < 8:
            error = "Password is too short."

        # Sign in or give error
        if error is None:
            # This looks for the highest Id value
            max_id = db.session.query(User.id).order_by(User.id.desc()).first()
            if max_id == None:
                id = 0
            else:
                id = max_id[0] + 1
            new_user = User(id=id, username=username, password=password)
            db.session.add(new_user)
            db.session.commit()

            session['user_id'] = id
            create_empty_goals(id)
            return redirect(url_for('dashboard'))
        else:
            flash(error, 'error')
            return redirect(url_for('register'))
    
    # If the method isn't post, we will return the page
    else:
        return render_template('register.html')
        
@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    else:
        name = db.session.query(User.username).filter_by(id=session['user_id']).first()[0]
        return render_template("dashboard.html", name=name)

@app.route('/dash_info')
def dash_info():
    goals = Goal.query.filter_by(user_id=session['user_id']).all()
    goals_list = [goal.serialize() for goal in goals]
    return jsonify(goals=goals_list)

@app.route('/get_workouts', methods=['GET'])
def get_workouts():
    workouts = Workout.query.filter_by(user_id=session['user_id']).all()
    workout_list = []

    for workout in workouts:
        workout_data = {
            'id': workout.id,
            'name': workout.name,
            'description': workout.description,
            'exercises': []
        }

        for exercise in workout.exercises:  # Assuming an 'exercises' relationship in your Workout model
            exercise_data = {
                'name': exercise.name,
                'sets': []
            }

            for set in exercise.sets:  # Assuming a 'sets' relationship in your Exercise model
                set_data = {
                    'reps': set.reps,
                    'weight': set.weight
                }
                exercise_data['sets'].append(set_data)

            workout_data['exercises'].append(exercise_data)

        workout_list.append(workout_data)

    return jsonify({'workouts': workout_list})

@app.route('/add', methods=['GET', 'POST'])
def add():
    if request.method == 'POST':
        pass # Will be returning a workout through JSON
    else:
        return render_template('add.html')
    
@app.route('/add_goal', methods=["POST"])
def add_goal():
    data = request.json
    new_goal = Goal(user_id=session['user_id'], type=data['type'], name=data['name'], description=data['description'], target=data['value'], current=0)
    db.session.add(new_goal)
    db.session.commit()

    return jsonify({'redirect_url': url_for('dashboard')})

@app.route('/update_goal', methods=["GET", "POST"])
def update_goal():
    data = request.json
    print(data)

    goal = Goal.query.get(data['id'])
    goal.name = data['name']
    goal.description = data['description']
    goal.target = data['target']
    goal.current = data['current']

    # Commit the changes
    db.session.commit()

    return jsonify({'redirect_url': url_for('dashboard')})

@app.route('/add_workout', methods=["POST"])
def add_workout():
    data = request.json
    
    new_workout = Workout(name=data['name'], description=data['description'], user_id=session['user_id'])
    db.session.add(new_workout)
    db.session.commit()

    for exercise_data in data['exercises']:
        print(exercise_data)
        new_exercise = Exercise(name=exercise_data['name'], workout_id=new_workout.id)
        db.session.add(new_exercise)
        db.session.commit()

        for set_data in exercise_data['sets']:
            print(set_data)
            new_set = Set(weight=set_data['weight'], reps=set_data['reps'], exercise_id=new_exercise.id)
            db.session.add(new_set)
            
    db.session.commit()

    return jsonify({'redirect_url': url_for('dashboard')})

@app.route('/profile', methods=['GET', 'POST'])
def profile():
    if request.method == 'POST':
        pass # The only things that this would be posting is updates to the users profile, probably through JSON
    else:
        return render_template('profile.html')

# DEBUG ROUTES
@app.route('/clear')
def clear_session():
    session.clear()
    return redirect(url_for('index'))

@app.route('/view_data')
def view_data():
    # Query all data from the tables
    users = User.query.all()
    workouts = Workout.query.all()
    exercises = Exercise.query.all()  # Fetch all exercises
    sets = Set.query.all()  # Fetch all sets

    return render_template(
        'view_data.html', 
        users=users, 
        workouts=workouts,
        exercises=exercises,  # Pass the exercises to the template
        sets=sets  # Pass the sets to the template
    )

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)