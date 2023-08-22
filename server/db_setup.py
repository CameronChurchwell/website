from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pathlib import Path

secrets_path = Path('/run/secrets')
db_user_path = secrets_path / 'db_user'
db_password_path = secrets_path / 'db_password'

if not db_user_path.exists():
    raise FileNotFoundError(f'database user file {db_user_path} does not exist')
if not db_password_path.exists():
    raise FileNotFoundError(f'database password file {db_password_path} does not exist')

with open(db_user_path, 'r') as f:
    db_user = f.read()
with open(db_password_path, 'r') as f:
    db_password = f.read()

db_address = 'db'
db_port = 5432
db_path = 'website'

db_url = f'postgresql://{db_user}:{db_password}@{db_address}:{db_port}/{db_path}'

#Create Engine
engine = create_engine(db_url)

get_session = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

