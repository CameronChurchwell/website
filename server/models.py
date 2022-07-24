"""Module containing models for interacting with the database"""

from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.dialects.postgresql import BYTEA
from db_setup import Base


class UsersModel(Base):
    """Model for users"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True)
    password = Column(String)

class UsersRefreshTokensModel(Base):
    """Model for refresh tokens belonging to users"""
    __tablename__ = "users_refresh_tokens"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String)
    refresh_token = Column(String)

class BlogPost(Base):
    """Model for blog posts"""
    __tablename__ = "blog_posts"

    id = Column(Integer, primary_key=True, index=True)
    uid = Column(Integer)
    title = Column(String)
    markdown = Column(String)
    posted = Column(DateTime)

class BlogPostResources(Base):
    """Model for additional resources associated with blog posts"""
    __tablename__ = "blog_post_resources"

    id = Column(Integer, primary_key=True, index=True)
    pid = Column(Integer)
    rid = Column(Integer)
    data = Column(BYTEA)
    ext = Column(String)
