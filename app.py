from flask import Flask, render_template, request, redirect, url_for
from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField
from wtforms.validators import DataRequired, Email, Length

app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecretkey'

class registration(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=8, max=24)])
    password = StringField('Password', validators=[DataRequired(), Length(min=8, max=24)])
    retype = StringField('Retype Password', validators=[DataRequired(), Length(min=8, max=24)])
    submit = SubmitField('Submit')


# TODO: Create the database, and the load it upon the file running


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/register', methods=["GET", "POST"])
def register():
    error = None
    if request.method == "GET":
        return render_template('register.html')
    
    else:
        username = request.form.get("username")
        password = request.form.get("password")
        retype = request.form.get("retype")

        # TODO: Do more checks about the inputs, and then add it to the database.

        if len(password) < 8:
            error = "Password is too short."
        else:
            return render_template("dashboard.html")
        
@app.route('/dashboard', methods=["GET", "POST"])
def dashboard():
    pass


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)