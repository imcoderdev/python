import os
from modules.database.sq_dict import SQLiteDict

sqDictPath = "data/config/sqDict.db"

# Ensure the directory exists
os.makedirs(os.path.dirname(sqDictPath), exist_ok=True)

# Initialize the SQLiteDict
sqDict = SQLiteDict(sqDictPath)
