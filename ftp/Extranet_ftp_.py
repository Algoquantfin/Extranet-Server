import requests
import os
import gzip
import pandas as pd
from datetime import datetime, timedelta
import pandas_market_calendars as trading_calender
import base64
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad

# Encryption
LOGIN_ID = "RMS"
PASSWORD = "Rms@12345678"
SECRET_KEY = "XE97uRmS1ALYxDtRHM4AmrSqrSF1ZW45V3vf2FscIQ0="

password_bytes = PASSWORD.encode('utf-8')
key = base64.b64decode(SECRET_KEY)
cipher = AES.new(key, AES.MODE_ECB)
padded_password = pad(password_bytes, AES.block_size)
encrypted_password = cipher.encrypt(padded_password)
encrypted_password_b64 = base64.b64encode(encrypted_password).decode('utf-8')

# API Request
data = {
    "memberCode": "90234",
    "loginId": LOGIN_ID,
    "password": encrypted_password_b64,
}

req_post = requests.post(
    "https://www.connect2nse.com/extranet-api/login/2.0", json=data
)

if req_post.status_code == 200:
    header = {"Authorization": "Bearer " + req_post.json()["token"]}

    # Specify the trading calendar (e.g., 'NSE' for NSE)
    calendar = trading_calender.get_calendar("NSE")

    # Get the current date
    current_date = datetime.today()

    # Check if today is a trading day
    is_trading_day = (
        calendar.valid_days(start_date=current_date, end_date=current_date).size > 0
    )

    # Define functions
    def span_function(date):
        sapn_date = current_date.strftime("%Y%m%d")
        FO_file = requests.get(
            "https://www.connect2nse.com/extranet-api/common/content/2.0",
            headers=header,
            params={"segment": "FO", "folderPath": "/Parameter"},
        )
        FO_file_name = FO_file.json()["data"][-1]["name"]
        CD_file = requests.get(
            "https://www.connect2nse.com/extranet-api/common/content/2.0",
            headers=header,
            params={"segment": "CD", "folderPath": "/Parameter"},
        )
        CD_file_name = CD_file.json()["data"][-1]["name"]
        span_dict = {"FO": ["FO", "/Parameter/", FO_file_name], "CD": ["CD", "/Parameter", CD_file_name]}

        file_in_folder = set(os.listdir(f"{folder_path}/"))

        if CD_file_name not in file_in_folder:
            requested_file = requests.get(
                "https://www.connect2nse.com/extranet-api/common/file/download/2.0",
                headers=header,
                params={"segment": f"CD", "folderPath": f"/Parameter/", "filename": f"{CD_file_name}"},
            )
            with open(f"{folder_path}/{CD_file_name}", "wb") as f:
                for chunk in requested_file.iter_content(chunk_size=8192):
                    if chunk:  # Filter out any potential empty chunks
                        f.write(chunk)
            print(f" {CD_file_name} downloaded ")
        else:
            print(f"{CD_file_name} already downloaded")

        if FO_file_name not in file_in_folder:
            requested_file = requests.get(
                "https://www.connect2nse.com/extranet-api/common/file/download/2.0",
                headers=header,
                params={"segment": f"FO", "folderPath": f"/Parameter/", "filename": f"{FO_file_name}"},
            )
            with open(f"{folder_path}/{FO_file_name}", "wb") as f:
                for chunk in requested_file.iter_content(chunk_size=8192):
                    if chunk:  # Filter out any potential empty chunks
                        f.write(chunk)
            print(f" {FO_file_name} downloaded ")
        else:
            print(f"{FO_file_name} already downloaded")

    def file_downloader(date):
        schedule = calendar.schedule(start_date=current_date - timedelta(10), end_date=current_date)
        schedule.sort_values(by="market_open", inplace=True, ascending=False)

        for key, value in schedule.iterrows():
            if current_date.strftime("%d%m%Y") > key.date().strftime("%d%m%Y"):
                last_trading_day = key.date().strftime("%d%m%Y")
                break

        sapn_date = current_date.strftime("%Y%m%d")
        ps03_dict = {}
        file_name_dict = {
            "fao_ottr": ["FO", "/Investigation/Dnld/", f"FAO_ORDER_TO_TRADE_RATIO_{last_trading_day}_90234.csv"],
            "pnc": ["FO", "/Surveillance/Dnld/", f"PNC_OPT_90234_{last_trading_day}.csv"],
        }

        for key, value in file_name_dict.items():
            member_file_list = ["fo_pos", "cd_pos", "cd_ps03", "fo_ps03", "fao_ottr", "pnc"]
            if key in member_file_list:
                filename = f"{file_name_dict[key][2]}"
                file = requests.get(
                    "https://www.connect2nse.com/extranet-api/member/file/download/2.0",
                    headers=header,
                    params={"segment": file_name_dict[key][0], "folderPath": file_name_dict[key][1], "filename": filename},
                )
                with open(f"{folder_path}/{filename}", "wb") as f:
                    for chunk in file.iter_content(chunk_size=8192):
                        if chunk:  # Filter out any potential empty chunks
                            f.write(chunk)
                print(f" {filename} downloaded ")
            else:
                filename = f"{file_name_dict[key][2]}"
                file = requests.get(
                    "https://www.connect2nse.com/extranet-api/common/file/download/2.0",
                    headers=header,
                    params={"segment": file_name_dict[key][0], "folderPath": file_name_dict[key][1], "filename": filename},
                )
                with open(f"{folder_path}/{filename}", "wb") as f:
                    for chunk in file.iter_content(chunk_size=8192):
                        if chunk:  # Filter out any potential empty chunks
                            f.write(chunk)
                print(f" {filename} downloaded ")

    def unzip_all_files(folder_path):
        for file_name in os.listdir(folder_path):
            if file_name.endswith(".gz"):
                file_path = os.path.join(folder_path, file_name)
                unzipped_file_path = os.path.splitext(file_path)[0]
                with gzip.open(file_path, "rb") as gz_file:
                    with open(unzipped_file_path, "wb") as unzipped_file:
                        unzipped_file.write(gz_file.read())

    current_date = datetime.today()
    is_trading_day = (
        calendar.valid_days(start_date=current_date, end_date=current_date).size > 0
    )

    date = current_date.strftime("%d%m%Y")
    date1 = current_date.strftime("%d%m%y")
    folder_path = f"{date1}"
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)

    file_downloader(date)
else:
    print(f"Error: {req_post.status_code} - {req_post.json()}")
