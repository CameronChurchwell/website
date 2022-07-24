"""Module handling login for the api"""

import ast
from flask import Blueprint, request, make_response, abort
from flask_bcrypt import Bcrypt

from db_setup import get_session
from models import UsersModel, UsersRefreshTokensModel

from api.tokens import make_refresh_token

###---Database-Setup---###
db_session = get_session()

login_api = Blueprint("login_api", __name__)
bcrypt = Bcrypt()

#Helper Functions
def byte_str_to_dict(byte_str):
    """Convert string of bytes to dictionary using utf-8"""
    return ast.literal_eval(byte_str.decode('utf-8'))

###---Routes---###

@login_api.route("/login/", methods=["POST"]) 
def login_request():
    """Email and Password validation and refresh token assignment"""
    data = byte_str_to_dict(request.get_data())
    user_row = db_session.query(UsersModel)\
                         .filter(UsersModel.email == data["email"].lower())\
                         .one_or_none()

    if user_row is not None: #Email fonud in db
        password_match = bcrypt.check_password_hash(user_row.password, (data["password"]))

        if password_match: #Password matches
            response = make_response("True")
            refresh_token, exp = make_refresh_token(data["email"])
            response.set_cookie("refresh_token",
                                refresh_token,
                                httponly=True,
                                path="/api/refresh_token_send/",
                                expires=exp,
                                secure=True)
            response.set_cookie('test', 'test_string')
            return response

        else: #Password did not match
            abort(401)

    else: #Email not found in db
        abort(401)


#POST because revoking refresh token is not stateless
@login_api.route("/refresh_token_send/logout/", methods=["POST"])
def logout_request():
    """Request to logout from user. Remove refresh token"""
    response = make_response("True")
    if "refresh_token" in request.cookies.keys(): #Remove refresh_token from database
        refresh_token = request.cookies["refresh_token"]
        db_session.query(UsersRefreshTokensModel)\
                  .filter(UsersRefreshTokensModel.refresh_token == refresh_token).delete()
        db_session.commit()

    #Remove cookies
    response.delete_cookie("refresh_token", path="/api/refresh_token_send/")
    response.delete_cookie("access_token", path="/api/protected/")

    return response
