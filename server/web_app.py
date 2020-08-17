from flask import Flask, render_template, send_from_directory
from flask_cors import CORS, cross_origin
import os

from db_setup import get_session, engine
from models import UsersModel

app = Flask(__name__, static_folder="../assets", template_folder="../templates")

CORS(app, origins="http://localhost:5050", supports_credentials=True)

dart_dir = "../build/web/dart/"
#dart_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../build/web/dart')

###---Database-Setup---###
db_session = get_session()

#Import Blueprints
from api.login import login_api
from api.tokens import token_api

#Register Blueprints
app.register_blueprint(login_api, url_prefix="/api")
app.register_blueprint(token_api, url_prefix="/api")

####---Routes---###

#Favicon
@app.route("/favicon.ico", methods=["GET"])
def favicon():
    return send_from_directory("../assets", "favicon.ico")

#Home Page
@app.route("/", methods=["GET"])
@app.route("/home/", methods=["GET"])
def homepage():
    return render_template("homepage.html", test="bruh")

#Bio Page
@app.route("/bio/", methods=["GET"])
def biopage():
    return render_template("biopage.html")

#Login Page
@app.route("/login/", methods=["GET"])
def loginpage():
    return render_template("loginpage.html")

@app.route("/logout/", methods=["GET"])
def logoutpage():
    return render_template("logoutpage.html")

@app.route("/blog/", methods=["GET"])
def blogpage():
    return render_template("blogmainpage.html")

#Serve Dart Files
@app.route("/dart/<path:file_name>", methods=["GET"])
def dart_static(file_name):
    return send_from_directory(dart_dir, file_name)

#Serve Dart Packages
@app.route("/packages/<path:path>", methods=["GET"])
def dart_packages(path):
    return send_from_directory("../build/packages/", path)

#@app.route("/db_hit", methods=["GET"])
#def db_hit():
#    print(db_session.query(UsersModel).one_or_none().email)


if __name__ == "__main__":
    app.run(debug=True)