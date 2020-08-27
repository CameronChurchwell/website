from flask import Flask, render_template, send_from_directory, abort, send_file
from flask_cors import CORS, cross_origin
from flaskext.markdown import Markdown
import os

from io import BytesIO

from db_setup import get_session, engine
from models import UsersModel, BlogPost, BlogPostResources

app = Flask(__name__, static_folder="../assets", template_folder="../templates")

CORS(app, origins="http://localhost:5050", supports_credentials=True)

md = Markdown(app, extensions=['fenced_code', 'codehilite'])

dart_dir = "../build/web/dart/"
#dart_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../build/web/dart')

###---Database-Setup---###
db_session = get_session()

#Import Blueprints
from api.login import login_api
from api.tokens import token_api
from api.upload import upload_api

#Register Blueprints
app.register_blueprint(login_api, url_prefix="/api")
app.register_blueprint(token_api, url_prefix="/api")
app.register_blueprint(upload_api, url_prefix="/api")

####---Routes---###

#Favicon
@app.route("/favicon.ico", methods=["GET"])
def favicon():
    return send_from_directory("../assets", "favicon.ico")

@app.route("/home.jpeg", methods=["GET"])
def homeimage():
    return send_from_directory("../assets", "home.jpeg")

#Home Page
@app.route("/", methods=["GET"])
@app.route("/home/", methods=["GET"])
def homepage():
    return render_template("homepage.html", test="bruh")

#Bio Page
@app.route("/bio/", methods=["GET"])
def biopage():
    return render_template("biopage.html")

#Link Page
@app.route("/links/", methods=["GET"])
def linkpage():
    return render_template("linkpage.html")

#Login Page
@app.route("/login/", methods=["GET"])
def loginpage():
    return render_template("loginpage.html")

@app.route("/logout/", methods=["GET"])
def logoutpage():
    return render_template("logoutpage.html")

@app.route("/blog/", methods=["GET"])
def blogpage():
    post_query = db_session.query(BlogPost)
    list_string = "\n"
    for post in post_query:
        title = post.title
        new_part = "## [" + title + "](" + "post/" + str(post.id) + "/)" + "\n"
        list_string += new_part
    return render_template("blogmainpage.html", post_list=list_string)

#Serve Dart Files
@app.route("/dart/<path:file_name>", methods=["GET"])
def dart_static(file_name):
    return send_from_directory(dart_dir, file_name)

#Serve Dart Packages
@app.route("/packages/<path:path>", methods=["GET"])
def dart_packages(path):
    return send_from_directory("../build/packages/", path)

@app.route("/test/markdown/", methods=["GET"])
def markdown_test():
    return render_template("markdowntest.html")

@app.route("/test/get/", methods=["GET"])
def get_test():
    print("hit get_test")
    return "True"

@app.route("/blog/upload/", methods=["GET"])
def upload_test():
    print("hit upload_test")
    return render_template("uploadpage.html")

@app.route("/blog/post/<int:pid>/", methods=["GET"])
def serve_post(pid):
    post_row = db_session.query(BlogPost).filter(BlogPost.id == pid).one_or_none()
    if post_row is None:
        abort(404)
    else:
        md_string = "\n" + post_row.markdown
        #print(render_template("blogpost.html", md_string=md_string))
        return render_template("blogpost.html", md_string=md_string)

@app.route("/blog/post/<int:pid>/resource/<int:rid>/", methods=["GET"])
def server_post_resource(pid, rid):
    content_row = db_session.query(BlogPostResources).filter(BlogPostResources.pid == pid).filter(BlogPostResources.rid == rid).one_or_none()
    if content_row is None:
        abort(404)
    else:
        data = content_row.data
        data_file_object = BytesIO(data)
        return send_file(
            data_file_object,
            attachment_filename="resource." + content_row.ext
        )


#@app.route("/db_hit", methods=["GET"])
#def db_hit():
#    print(db_session.query(UsersModel).one_or_none().email)


if __name__ == "__main__":
    app.run(debug=True)