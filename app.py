from flask import Flask, request, render_template, redirect, url_for, flash

app = Flask(__name__)
app.config['SECRET_KEY'] = 'mysecretkey'



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

        # Check for any empty parts of the form
        if not username or not password or not retype:
            flash('All fields are required!', 'error')
            return redirect(url_for('index'))

        if len(password) < 8:
            error = "Password is too short."
        else:
            return render_template("dashboard.html")
        
@app.route('/dashboard', methods=["GET", "POST"])
def dashboard():
    pass


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)