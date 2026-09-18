import os
from dotenv import load_dotenv

# Loading environment variables from a .env file into the program's environment
load_dotenv()


# Retrieves the database URL from an environment variable for security.
# Falls back to a local SQLite file so the app runs with zero configuration
# (useful for quick deploys/demos; swap in a real DATABASE_URL for production).
class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./ticketMasterDb.sqlite3")


# Creating an instance of Settings to access configuration variables
settings = Settings()
