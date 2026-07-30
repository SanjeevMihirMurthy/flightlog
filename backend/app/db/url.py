import os
from urllib.parse import quote_plus


def get_database_url() -> str:
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        return database_url

    db_user = os.getenv("DB_USER")
    db_password = quote_plus(os.getenv("DB_PASSWORD"))
    db_host = os.getenv("DB_HOST")
    db_port = os.getenv("DB_PORT")
    db_name = os.getenv("DB_NAME")

    return f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
