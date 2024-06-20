import pandas as pd
from pymongo import MongoClient
import os
import re
import logging

# MongoDB connection setup
client = MongoClient('mongodb+srv://growthsec:growthsec123@cluster0.thwyyfm.mongodb.net/')
pnc_db = client['PNC']

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
def insert_data(collection_name, csv_file):
    # Sanitize the collection name to ensure it's valid
    collection_name = sanitize_collection_name(collection_name)

    # Check if the collection exists
    collection_exists = collection_name in pnc_db.list_collection_names()

    # Drop the collection if it already exists
    if collection_exists:
        pnc_db[collection_name].drop()
        logger.info(f"Dropped existing collection '{collection_name}'")

    # Create collection named after the date (sanitized)
    collection = pnc_db[collection_name]

    # Insert data
    data = csv_to_dict(csv_file)
    if data:
        try:
            # Insert data in batches of 1000 records
            collection.insert_many(data, ordered=False, bypass_document_validation=True)
            logger.info(f"Inserted {len(data)} records into collection '{collection_name}' from '{csv_file}'")
            return collection_exists  # Return True if the collection was replaced
        except Exception as e:
            logger.error(f"Failed to insert data into collection '{collection_name}' from '{csv_file}': {str(e)}")
            return False
    return False

# Function to log replaced collections
def log_replaced_collections(replaced_collections):
    if replaced_collections:
        logger.info(f"Replaced {len(replaced_collections)} collections:")
        for collection in replaced_collections:
            logger.info(f"Replaced collection: {collection}")
    else:
        logger.info("No collections were replaced.")

# Directory where the date-wise folders are located
data_directory = 'D:/project_python/FTP/working/Back_End/server/ftp/'

# List to keep track of replaced collections
replaced_collections = []

# Process each date folder
for date_folder in os.listdir(data_directory):
    date_folder_path = os.path.join(data_directory, date_folder)
    if os.path.isdir(date_folder_path):
        # Process each file in the folder
        for file in os.listdir(date_folder_path):
            file_path = os.path.join(date_folder_path, file)
            
            # Handle PNC files
            if file.startswith('PNC_OPT_90234') and file.endswith('.csv'):
                date_match = re.search(r'PNC_OPT_90234_(\d{8})', file)
                if date_match:
                    collection_name = date_folder  # Using the folder name as the collection name
                    if insert_data(collection_name, file_path):
                        replaced_collections.append(collection_name)

# Log the replaced collections
log_replaced_collections(replaced_collections)

print("Data insertion completed!")
