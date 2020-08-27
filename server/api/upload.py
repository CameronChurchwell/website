from flask import Blueprint, request, Response

import jwt

from datetime import datetime

from zipfile import ZipFile
import re
import io

from db_setup import get_session, engine
from models import BlogPost, BlogPostResources

from api.tokens import require_auth

from get_secret import get_secret

upload_api = Blueprint("upload_api", __name__)

db_session = get_session()

@upload_api.route("/protected/blog/upload/", methods=["POST"])
@require_auth
def blog_upload():
    if 'zip_file' in request.form.keys():
        file_data = bytearray([int(i) for i in request.form['zip_file'].strip('][').split(', ') ])
        binary_file_object = io.BytesIO(file_data)

        with ZipFile(binary_file_object) as archive:

            #Get File Names
            file_names = []
            files = []
            folder_paths = []
            for name in archive.namelist():
                if name[:9] == "__MACOSX/": #Ignore MacOS metadata files created during compression
                    continue
                if '.' in name: #Is file
                    file_names.append(name)
                    files.append(archive.read(name))
                else: #Is Folder
                    folder_paths.append(name)

            #Find md file
            md_file_name = None
            for file_name in file_names:
                if file_name[-3:] == ".md":
                    md_file_name = file_name
            if md_file_name is None:
                return False

            #Calculate the paths relative to the markdown file
            paths_from_md = []
            if "/" in md_file_name:
                md_path = "".join(md_file_name.split("/")[:-1]) + "/"
                for i in range(0, len(file_names)):
                    if file_names[i][:len(md_path)] == md_path:
                        paths_from_md.append(file_names[i][len(md_path):])
                    else:
                        paths_from_md.append("../" + file_names[i])

            #Calculate max recursive depth based on number of folders
            max_recursive_depth = 0
            for folder_path in folder_paths:
                path_list = folder_path.split("/")[:-1]
                if len(path_list) > max_recursive_depth:
                    max_recursive_depth = len(path_list)

            #Regex setup stuff
            import re

            slash = r"[/\\]+"
            prefix = r"!\[([^(\]\()]*)\]\("
            postfix = r"\)"
            no_change = r"(\." + slash + ")*"

            def buildExitRegex(max_depth):
                if max_depth == 0:
                    return r"[^\"*/:<>?\\|.]+" + slash + no_change + r".." + slash + no_change
                elif max_depth > 0:
                    return r"[^\"*/:<>?\\|.]+" + slash + no_change + "(" + buildExitRegex(max_depth - 1) + ")*" + no_change + r".." + slash + no_change

            def buildPathRegexR(comps, file_name, max_depth):
                exitR = no_change + r"(" + buildExitRegex(max_depth) + r")*"
                r = prefix + exitR
                
                #add logic
                for c in comps:
                    r += c
                    r += slash
                    r += exitR
                r += exitR + file_name
                
                r += postfix
                return r

            #Helper function gets components of path and file name
            def get_comps_and_name(file_name):
                comps = file_name.split("/")[:-1]
                name = file_name.split("/")[-1]
                return comps, name

            #Decode contents of md file
            md_string = archive.read(md_file_name).decode('utf-8')

            #Remove comments
            r = r"<!--[^(\-\->)]*?-->\s*"
            md_string = re.sub(r, "", md_string)

            #Find leading header
            r = r'^#\s*([^\n#]+)\n'
            title_search = re.search(r, md_string)
            if title_search is None:
                title_string = "Placeholder Title"
            else:
                rr = r"[\u0000-\u001F\u007F-\u009F]"
                title_string = title_search.groups()[0]
                title_string = re.sub(rr, r"", title_string) #Remove control characters


            #Get UID from cookie
            assert "access_token" in request.cookies.keys()
            access_token = request.cookies["access_token"]
            decoded = jwt.decode(access_token, get_secret(), algorithms=["HS256"])
            uid_value = decoded["uid"]
            
            #Create new empty row for the post
            post_row = BlogPost()
            db_session.add(post_row)
            db_session.flush()

            #Read from zip, modify paths, and save to db
            for i in range(0, len(paths_from_md)):
                if file_names[i] == md_file_name:
                    continue
                comps, name = get_comps_and_name(paths_from_md[i])
                r = buildPathRegexR(comps, name, max_recursive_depth)
                md_string = re.sub(r, r"![\1](resource/" + str(i) + r"/)", md_string)
                
                #Add file contents to database
                resource_row = BlogPostResources()
                resource_row.pid = post_row.id
                resource_row.rid = i
                resource_row.data = archive.read(file_names[i])
                resource_row.ext = file_names[i].split(".")[-1]

                db_session.add(resource_row)

            #Add md file contents to database
            post_row.uid = uid_value
            post_row.title = title_string
            post_row.markdown = md_string
            post_row.posted = datetime.utcnow()

            db_session.commit()

        return "True"
    return "False"