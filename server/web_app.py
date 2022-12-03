"""Main file for website, contains endpoints"""

#Import Blueprints
from io import BytesIO
from api.login import login_api
from api.tokens import token_api
from api.upload import upload_api

from flask import Flask, render_template, send_from_directory, abort, send_file
from flask_cors import CORS
from flaskext.markdown import Markdown

from db_setup import get_session
from models import BlogPost, BlogPostResources

app = Flask(__name__, static_folder="../assets", template_folder="../templates")

CORS(app, origins="http://localhost:5050", supports_credentials=True)

md = Markdown(app, extensions=['fenced_code', 'codehilite'])

DART_DIR = "../build/web/dart/"
JS_DIR = "../buid/js/"
#dart_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../build/web/dart')

###---Database-Setup---###
db_session = get_session()


#Register Blueprints
app.register_blueprint(login_api, url_prefix="/api")
app.register_blueprint(token_api, url_prefix="/api")
app.register_blueprint(upload_api, url_prefix="/api")

####---Routes---###

root_assets = [
    "favicon.ico",
    "home.jpeg",
]

@app.route('/<any(' + str(root_assets)[1:-1] + '):asset>/', methods=["GET"])
def root_asset(asset):
    """Serve root assets to browser"""
    return send_from_directory("../assets/", asset)

root_pages = [
    "home",
    "bio",
    "links",
    "login",
    "logout",
    "test",
]

@app.route("/", methods=["GET"])
@app.route('/<any(' + str(root_pages)[1:-1] + '):page_prefix>/', methods=["GET"])
def root_page(page_prefix="home"):
    """Serve root page to browser based on url"""
    return render_template(page_prefix + "page.html.j2")

@app.route("/blog/", methods=["GET"])
def blogpage():
    """Serve root blog page"""
    post_query = db_session.query(BlogPost)
    list_string = "\n"
    for post in post_query:
        title = post.title
        new_part = "## [" + title + "](" + "post/" + str(post.id) + "/)" + "\n"
        list_string += new_part
    return render_template("blogmainpage.html", post_list=list_string)

@app.route("/dart/<path:file_name>", methods=["GET"])
def dart_static(file_name):
    """Serve Dart files"""
    return send_from_directory(DART_DIR, file_name)

@app.route("/packages/<path:path>", methods=["GET"])
def dart_packages(path):
    """Serve Dart packages"""
    return send_from_directory("../build/packages/", path)

@app.route("/js/<path:file_name>", methods=["GET"])
def js_static(file_name):
    """Serve Javascript files"""
    return send_from_directory(JS_DIR, file_name)


@app.route("/test/markdown/", methods=["GET"])
def markdown_test():
    return render_template("markdowntest.html")

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