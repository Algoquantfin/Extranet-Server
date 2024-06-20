import pandas as pd
from pymongo import MongoClient
import os
import re
import logging

# MongoDB connection setup
client = MongoClient('mongodb+srv://growthsec:growthsec123@cluster0.thwyyfm.mongodb.net/')
db = client['OTR-PNC']

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
def insert_data(date_str, date_folder_path):
    # Sanitize the date_str to ensure it's a valid collection name
    collection_name = sanitize_collection_name(date_str)
    
    # Create collection named after the date (sanitized)
    collection = db[collection_name]

    # Get all CSV files in the date folder
    csv_files = [f for f in os.listdir(date_folder_path) if f.endswith('.csv')]

    # Insert data into MongoDB for each file
    for csv_file in csv_files:
        file_path = os.path.join(date_folder_path, csv_file)
        data = csv_to_dict(file_path)
        if data:
            try:
                # Insert data in batches of 1000 records
                collection.insert_many(data, ordered=False, bypass_document_validation=True)
                logger.info(f"Inserted {len(data)} records into collection '{collection_name}' from '{csv_file}'")
            except Exception as e:
                logger.error(f"Failed to insert data into collection '{collection_name}' from '{csv_file}': {str(e)}")

# Directory where the date-wise folders are located
data_directory = 'D:/project_python/FTP/working/Back_End/server/ftp/'

# Process each date folder
for date_folder in os.listdir(data_directory):
    date_folder_path = os.path.join(data_directory, date_folder)
    if os.path.isdir(date_folder_path) and re.match(r'\d{6}', date_folder):
        # Extract date from the folder name (assuming folder name is in format DDMMYY)
        date_str = date_folder

        # Insert data into MongoDB
        insert_data(date_str, date_folder_path)

print("Data insertion completed!")
