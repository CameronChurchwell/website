from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

#TODO change to load credentials from file
#TODO change to load username somehow

db_url = "postgresql://cameron:th3_sh4p3@localhost:5432/website" #You could try to access the database, but there's a firewall in the way

#Create Engine
engine = create_engine(db_url)

get_session = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

