from flask import Blueprint, request, make_response, redirect, abort, Response, url_for
from flask_bcrypt import Bcrypt

from atomicwrites import atomic_write

import jwt
from jwt.exceptions import ExpiredSignatureError

import ast
import json
import secrets
from datetime import datetime, timedelta

from db_setup import get_session, engine
from models import UsersModel, UsersRefreshTokensModel

from get_secret import get_secret

###---Database-Setup---###
db_session = get_session()

token_api = Blueprint("token_api", __name__)

#Get JWT secret
secret = get_secret()


###---Routes/Functions---###

@token_api.route("/refresh_token_send/get_access_token/", methods=["GET"])
def get_access_token(): #Use refresh token to get access token and set to cookie. Redirect to home
    response = make_response("True")
    if "refresh_token" in request.cookies.keys():
        if validate_refresh_token(request.cookies["refresh_token"]):
            uid = jwt.decode(request.cookies["refresh_token"], secret, algorithms=["HS256"])["uid"]
            access_token, exp = make_access_token_and_expiration(uid)
            response.set_cookie("access_token", value=access_token, httponly=True, path="/api/protected/") #TODO add expires=exp, secure=True
        else:
            #response = make_response("Bad Refresh Token")
            abort(401)
    else:
        #response = make_response("No Refresh Token")
        abort(401)
    return response

def make_access_token_and_expiration(uid):
    exp = datetime.utcnow() + timedelta(minutes=30)
    token = token = jwt.encode({"uid": uid, "exp": exp}, secret, algorithm="HS256")
    return (token, exp)

def make_refresh_token(email): #Helper function for the login api. Create and return new token. Save token to database for tracking.
    uid = get_user_id(email)
    exp = datetime.utcnow() + timedelta(days=7)
    token = jwt.encode({"uid": uid, "exp": exp}, secret, algorithm="HS256")
    
    new_refresh_token_row = UsersRefreshTokensModel()
    new_refresh_token_row.email = email
    new_refresh_token_row.refresh_token = str(token, "utf-8")
    db_session.add(new_refresh_token_row)
    db_session.commit()

    return token
    

def revoke_refresh_token(token):
    ...#Helper function for logging out. Revoke specific token (delete from database).

def revoke_all_refresh_tokens(email):
    ...#Revoke all tokens associated with user (delete from database).

def validate_refresh_token(token): #Helper function for getting access tokens. Check database for refresh token and validate it has not expired. If it has, remove from db.
    try:
        decoded = jwt.decode(token, secret, algorithms=["HS256"])
        print(str(token))
        potentially_existant_row = db_session.query(UsersRefreshTokensModel).filter(UsersRefreshTokensModel.refresh_token == str(token)).one_or_none()
        if potentially_existant_row is None:
            return False
        print(potentially_existant_row.refresh_token)
        return True
    except ExpiredSignatureError:
        return False

def validate_access_token(token): #Helper function for all protected resources. Validate token and check that it has not expired.
    try:
        decoded = jwt.decode(token, secret, algorithms=["HS256"])
        print(decoded)
        return True
    except ExpiredSignatureError:
        print("token expired")
        return False

def get_user_id(email): #Helper function which returns UID from email, probably should move to the UsersModel class?
    user = db_session.query(UsersModel).filter(UsersModel.email == email.lower()).one_or_none()
    if user is not None:
        return user.id
    else:
        return None

def require_auth(func):
    def wrapper():
        cookies = request.cookies
        
        if "access_token" not in cookies.keys():
            abort(401)

        if not validate_access_token(cookies["access_token"]):
            abort(401)
            #TODO distinguish between 401 for invalid token and 403 for valid token, wrong user
        
        return func()
    return wrapper

@token_api.route("/refresh_token_send/delete_refresh_token", methods=["POST"])
def delete_refresh_token():
    print("delete refresh token")
    #response = make_response(redirect(url_for("delete_access_token")))
    #delete from database
    #delete cookie
    #return response
    return "True"

@token_api.route("/protected/delete_access_token", methods=["GET"])
def delete_access_token():
    response = make_response("True")
    print("delete access token")
    return "True"

@token_api.route("/protected/user_logged_in/", methods=["GET"])
@require_auth
def user_logged_in():
    return Response(status=200)
    


        