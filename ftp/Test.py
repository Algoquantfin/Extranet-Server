import os
import gzip
import requests
import pandas as pd
from datetime import datetime, timedelta
import pandas_market_calendars as mcal

# Constants
LOGIN_URL = "https://www.connect2nse.com/extranet-api/login/2.0"
CONTENT_URL = "https://www.connect2nse.com/extranet-api/common/content/2.0"
DOWNLOAD_URL = "https://www.connect2nse.com/extranet-api/common/file/download/2.0"
MEMBER_DOWNLOAD_URL = (
    "https://www.connect2nse.com/extranet-api/member/file/download/2.0"
)

LOGIN_DATA = {
    "memberCode": "90234",
    "loginId": "RMS",
    "password": "u9IXDPo1Fj/sFlvOk2OYhg==",
}

# Authenticate and get the token
req_post = requests.post(LOGIN_URL, json=LOGIN_DATA)
token = req_post.json().get("token")
if not token:
    raise ValueError("Failed to retrieve token")

headers = {"Authorization": "Bearer " + token}

# Trading calendar and current date
calendar = mcal.get_calendar("NSE")
current_date = datetime.today()

# Check if today is a trading day
is_trading_day = (
    calendar.valid_days(start_date=current_date, end_date=current_date).size > 0
)


def get_latest_file_name(segment, folder_path):
    response = requests.get(
        CONTENT_URL,
        headers=headers,
        params={"segment": segment, "folderPath": folder_path},
    )
    response.raise_for_status()
    return response.json()["data"][-1]["name"]


def download_file(segment, folder_path, filename, local_path):
    response = requests.get(
        DOWNLOAD_URL,
        headers=headers,
        params={"segment": segment, "folderPath": folder_path, "filename": filename},
    )
    response.raise_for_status()
    with open(local_path, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)
    print(f"{filename} downloaded")


def span_function(date):
    fo_file_name = get_latest_file_name("FO", "/Parameter")
    cd_file_name = get_latest_file_name("CD", "/Parameter")

    file_in_folder = set(os.listdir(folder_path))

    if cd_file_name not in file_in_folder:
        download_file("CD", "/Parameter", cd_file_name, f"{folder_path}/{cd_file_name}")
    else:
        print(f"{cd_file_name} already downloaded")

    if fo_file_name not in file_in_folder:
        download_file("FO", "/Parameter", fo_file_name, f"{folder_path}/{fo_file_name}")
    else:
        print(f"{fo_file_name} already downloaded")


def file_downloader(date):
    schedule = calendar.schedule(
        start_date=current_date - timedelta(10), end_date=current_date
    )
    schedule.sort_values(by="market_open", inplace=True, ascending=False)

    last_trading_day = next(
        key.date().strftime("%d%m%Y")
        for key, value in schedule.iterrows()
        if current_date.strftime("%d%m%Y") > key.date().strftime("%d%m%Y")
    )

    file_name_dict = {
        "fao_ottr": [
            "FO",
            "/Investigation/Dnld/",
            f"FAO_ORDER_TO_TRADE_RATIO_{last_trading_day}_90234.csv",
        ],
        "pnc": ["FO", "/Surveillance/Dnld/", f"PNC_OPT_90234_{last_trading_day}.csv"],
    }

    for key, value in file_name_dict.items():
        segment, folder_path, filename = value
        local_path = f"{folder_path}/{filename}"
        if filename not in os.listdir(folder_path):
            download_url = MEMBER_DOWNLOAD_URL if "member" in key else DOWNLOAD_URL
            response = requests.get(
                download_url,
                headers=headers,
                params={
                    "segment": segment,
                    "folderPath": folder_path,
                    "filename": filename,
                },
            )
            response.raise_for_status()
            with open(local_path, "wb") as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
            print(f"{filename} downloaded")
        else:
            print(f"{filename} already downloaded")


def unzip_all_files(folder_path):
    for file_name in os.listdir(folder_path):
        if file_name.endswith(".gz"):
            file_path = os.path.join(folder_path, file_name)
            unzipped_file_path = os.path.splitext(file_path)[0]
            with gzip.open(file_path, "rb") as gz_file:
                with open(unzipped_file_path, "wb") as unzipped_file:
                    unzipped_file.write(gz_file.read())
            # os.remove(file_path)


# Ensure the folder path exists
date_str = current_date.strftime("%d%m%y")
folder_path = f"{date_str}"
os.makedirs(folder_path, exist_ok=True)

# Download and process files
file_downloader(current_date)
unzip_all_files(folder_path)
