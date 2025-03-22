"""Module handling tokens for the api"""

from datetime import datetime, timedelta

from flask import Blueprint, request, make_response, abort, Response, redirect, url_for

import jwt
from jwt.exceptions import ExpiredSignatureError

from db_setup import get_session
from models import UsersModel, UsersRefreshTokensModel

from get_secret import get_secret

###---Database-Setup---###
db_session = get_session()

token_api = Blueprint("token_api", __name__)

#Get JWT secret
secret = get_secret()


###---Routes/Functions---###

@token_api.route("/refresh_token_send/get_access_token/", methods=["GET"])
@token_api.route("/refresh_token_send/get_access_token/<path:referrer>", methods=["GET"])
def get_access_token(referrer=None):
    """Use refresh token to get access token and set to cookie. Redirect to home"""
    # response = make_response("True")
    referrer = '/' + (referrer or '')
    response = make_response(redirect(referrer))
    if "refresh_token" in request.cookies.keys():
        if validate_refresh_token(request.cookies["refresh_token"]):
            uid = jwt.decode(request.cookies["refresh_token"], secret, algorithms=["HS256"])["uid"]
            access_token, exp = make_access_token_and_expiration(uid)
            response.set_cookie("access_token",
                                value=access_token, 
                                httponly=True, path="/api/protected/", 
                                expires=exp, 
                                secure=True)
        else:
            #response = make_response("Bad Refresh Token")
            abort(401)
    else:
        #response = make_response("No Refresh Token")
        abort(401)
    return response

def make_access_token_and_expiration(uid):
    """Create access token with expiration and return both"""
    exp = datetime.utcnow() + timedelta(minutes=30)
    token = token = jwt.encode({"uid": uid, "exp": exp}, secret, algorithm="HS256")
    return token, exp

def make_refresh_token(email):
    """Helper function for the login api.\
        Create and return new token.\
            Save token to database for tracking."""
    uid = get_user_id(email)
    exp = datetime.utcnow() + timedelta(days=7)
    token = jwt.encode({"uid": uid, "exp": exp}, secret, algorithm="HS256")

    new_refresh_token_row = UsersRefreshTokensModel()
    new_refresh_token_row.email = email
    new_refresh_token_row.refresh_token = token
    db_session.add(new_refresh_token_row)
    db_session.commit()

    return token, exp

def validate_refresh_token(token):
    """Helper function for getting access tokens.\
    Check database for refresh token and validate it has not expired.\
    If it has, remove from db."""
    try:
        jwt.decode(token, secret, algorithms=["HS256"])
        print(str(token))
        potentially_existant_row = db_session.query(UsersRefreshTokensModel)\
                                             .filter(UsersRefreshTokensModel\
                                             .refresh_token == str(token)).one_or_none()
        if potentially_existant_row is None:
            return False
        print(potentially_existant_row.refresh_token)
        return True
    except ExpiredSignatureError:
        return False

def validate_access_token(token):
    """Helper function for all protected resources.\
        Validate token and check that it has not expired."""
    try:
        decoded = jwt.decode(token, secret, algorithms=["HS256"])
        print(decoded)
        return True
    except ExpiredSignatureError:
        print("token expired")
        return False

def get_user_id(email):
    """Helper function which returns UID from email,\
        probably should move to the UsersModel class?"""
    user = db_session.query(UsersModel).filter(UsersModel.email == email.lower()).one_or_none()
    if user is not None:
        return user.id
    else:
        return None


def require_auth(func):
    """Function decorator to require authentication on chosen routes"""
    def wrapper():

        cookies = request.cookies

        if ("access_token" not in cookies.keys()) or \
            (not validate_access_token(cookies["access_token"])):
            if request.method == 'POST':
                abort(401)
            #try to get a token via redirect
            referrer = request.path
            return redirect(url_for('token_api.get_access_token', referrer=referrer))
            #TODO distinguish between 401 for invalid token and 403 for valid token, wrong user

        return func()
    return wrapper

@token_api.route("/protected/user_logged_in/", methods=["GET"])
@require_auth
def user_logged_in():
    """Basic route to test if user is logged in"""
    return Response(status=200)
