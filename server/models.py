from sqlalchemy import Column, Integer, String
from db_setup import Base


class UsersModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True)
    password = Column(String)

class UsersRefreshTokensModel(Base):
    __tablename__ = "users_refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String)
    refresh_token = Column(String)
    
