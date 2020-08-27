from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.dialects.postgresql import BYTEA
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

class BlogPost(Base):
    __tablename__ = "blog_posts"

    id = Column(Integer, primary_key=True, index=True)
    uid = Column(Integer)
    title = Column(String)
    markdown = Column(String)
    posted = Column(DateTime)

class BlogPostResources(Base):
    __tablename__ = "blog_post_resources"

    id = Column(Integer, primary_key=True, index=True)
    pid = Column(Integer)
    rid = Column(Integer)
    data = Column(BYTEA)
    ext = Column(String)


    
