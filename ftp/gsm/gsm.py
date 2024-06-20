import pandas as pd
from pymongo import MongoClient
import os
import re
import logging

# MongoDB connection setup
client = MongoClient('mongodb+srv://growthsec:growthsec123@cluster0.thwyyfm.mongodb.net/')
db = client['GSM']

# Logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Function to read CSV and convert to dictionary
def csv_to_dict(csv_file):
    try:
        df = pd.read_csv(csv_file)
        return df.to_dict(orient='records')
    except FileNotFoundError:
        logger.error(f"File not found: {csv_file}")
        return []

# Function to sanitize collection names for MongoDB
def sanitize_collection_name(name):
    # Replace invalid characters with underscores
    return re.sub(r'[$]', '_', name)

# Function to insert data into MongoDB
def insert_data(collection_name, csv_files_path):
    # Create collection named after the file name (sanitized)
    collection = db[collection_name]

    # Insert data into MongoDB for each file
    for csv_file in csv_files_path:
        data = csv_to_dict(csv_file)
        if data:
            try:
                # Insert data in batches of 1000 records
                collection.insert_many(data, ordered=False, bypass_document_validation=True)
                logger.info(f"Inserted {len(data)} records into collection '{collection_name}' from '{csv_file}'")
            except Exception as e:
                logger.error(f"Failed to insert data into collection '{collection_name}' from '{csv_file}': {str(e)}")

# Directory where the date-wise folders are located
data_directory = 'D:/project_python/FTP/working/Back_End/server/ftp/gsm'

# Process each CSV file in the 'gsm' directory
for root, dirs, files in os.walk(data_directory):
    for file in files:
        if file.endswith('.csv'):
            csv_file_path = os.path.join(root, file)
            # Use the file name as the collection name (without extension)
            collection_name = os.path.splitext(file)[0]
            # Sanitize collection name for MongoDB
            collection_name = sanitize_collection_name(collection_name)
            # Insert data into MongoDB
            insert_data(collection_name, [csv_file_path])

print("Data insertion completed!")
