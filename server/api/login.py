from flask import Blueprint, request, make_response, redirect, url_for, abort
from flask_bcrypt import Bcrypt
import ast
import json

from db_setup import get_session, engine
from models import UsersModel, UsersRefreshTokensModel

from api.tokens import make_refresh_token

###---Database-Setup---###
db_session = get_session()

login_api = Blueprint("login_api", __name__)
bcrypt = Bcrypt()

#Helper Functions
def byte_str_to_dict(byte_str):
    return ast.literal_eval(byte_str.decode('utf-8'))

###---Routes---###

@login_api.route("/login/", methods=["POST"]) 
def login_request(): #Email and Password validation and refresh token assignment
    data = byte_str_to_dict(request.get_data())
    userRow = db_session.query(UsersModel).filter(UsersModel.email == data["email"].lower()).one_or_none()

    return_payload = {}

    if userRow is not None: #Email fonud in db
        password_match = bcrypt.check_password_hash(userRow.password, (data["password"]))

        if password_match: #Password matches
            response = make_response("True")
            refresh_token = make_refresh_token(data["email"])
            response.set_cookie("refresh_token", refresh_token, httponly=True, path="/api/refresh_token_send/", expires=exp, secure=True)
            return response

        else: #Password did not match
            abort(401)

    else: #Email not found in db
        abort(401)

@login_api.route("/refresh_token_send/logout/", methods=["POST"]) #POST because revoking refresh token is not stateless
def logout_request():
    response = make_response("True")
    if "refresh_token" in request.cookies.keys(): #Remove refresh_token from database
        refresh_token = request.cookies["refresh_token"]
        db_session.query(UsersRefreshTokensModel).filter(UsersRefreshTokensModel.refresh_token == refresh_token).delete()
        db_session.commit()

    #Remove cookies
    response.delete_cookie("refresh_token", path="/api/refresh_token_send/")
    response.delete_cookie("access_token", path="/api/protected/")
    
    return response