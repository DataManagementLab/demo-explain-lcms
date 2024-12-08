import subprocess
import os.path
from config import Settings
import psycopg2
from psycopg2 import sql
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT


def get_db_connection_string(settings: Settings, database_name: str = "postgres", sqlalchemy: bool = True):
    return f"postgresql{'+psycopg2' if sqlalchemy else ''}://{settings.db_user}:{settings.db_password}@{settings.db_host}:{settings.db_port}/{database_name}"


def is_db_exists(settings: Settings, database_name: str):
    test_conn = None
    try:
        test_conn = psycopg2.connect(get_db_connection_string(settings, database_name=database_name, sqlalchemy=False))
    except BaseException:
        return False
    finally:
        if test_conn is not None:
            test_conn.close()
    return True


def create_db(settings: Settings, database_name: str, backup_file: str | None = None):
    if not is_db_exists(settings, database_name):
        conn = psycopg2.connect(get_db_connection_string(settings, sqlalchemy=False))
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        cursor.execute(sql.SQL("CREATE DATABASE {}").format(sql.Identifier(database_name)))
        conn.close()
        print(f"Created database {database_name}")

        if backup_file is not None:
            restore_backup(settings, database_name, backup_file)


def restore_backup(settings: Settings, database_name: str, backup_file: str):
    if os.path.isfile(backup_file):
        process = subprocess.Popen(["pg_restore", f"--dbname={get_db_connection_string(settings, database_name, False)}", os.path.abspath(backup_file)])
        process.wait()

        print(f"Restored backup {backup_file} in {database_name}")
