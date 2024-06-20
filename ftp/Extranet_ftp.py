import requests
import os
import gzip
import pandas as pd
from datetime import datetime, timedelta
import pandas_market_calendars as trading_calender

data = {
    "memberCode": "90234",
    "loginId": "RMS",
    "password": "u9IXDPo1Fj/sFlvOk2OYhg==",
}

req_post = requests.post(
    "https://www.connect2nse.com/extranet-api/login/2.0", json=data
)
header = {"Authorization": "Bearer " + req_post.json()["token"]}


# # Specify the trading calendar (e.g., 'NSE' for NSE)
calendar = trading_calender.get_calendar("NSE")


# # Get the current date
current_date = datetime.today()


# # Check if today is a trading day
is_trading_day = (
    calendar.valid_days(start_date=current_date, end_date=current_date).size > 0
)


def span_function(date):
    sapn_date = current_date.strftime("%Y%m%d")
    # checking file is present in the extranet
    FO_file = requests.get(
        "https://www.connect2nse.com/extranet-api/common/content/2.0",
        headers=header,
        params={
            "segment": "FO",
            "folderPath": "/Parameter",
        },
    )
    FO_file_name = FO_file.json()["data"][-1]["name"]
    CD_file = requests.get(
        "https://www.connect2nse.com/extranet-api/common/content/2.0",
        headers=header,
        params={
            "segment": "CD",
            "folderPath": "/Parameter",
        },
    )
    CD_file_name = CD_file.json()["data"][-1]["name"]
    span_dict = {
        "FO": ["FO", "/Parameter/", FO_file_name],
        "CD": ["CD", "/Parameter", CD_file_name],
    }

    # print(os.listdir.path.join('/20092023'))
    file_in_folder = set(os.listdir(f"{folder_path}/"))

    if CD_file_name not in file_in_folder:

        requested_file = requests.get(
            "https://www.connect2nse.com/extranet-api/common/file/download/2.0",
            headers=header,
            params={
                "segment": f"CD",
                "folderPath": f"/Parameter/",
                "filename": f"{CD_file_name}",
            },
        )
        with open(f"{folder_path}/{CD_file_name}", "wb") as f:
            for chunk in requested_file.iter_content(chunk_size=8192):
                if chunk:  # Filter out any potential empty chunks
                    f.write(chunk)
        print(f" {CD_file_name} downloaded ")
    else:
        print(f"{CD_file_name} already downlaod")

    if FO_file_name not in file_in_folder:
        requested_file = requests.get(
            "https://www.connect2nse.com/extranet-api/common/file/download/2.0",
            headers=header,
            params={
                "segment": f"FO",
                "folderPath": f"/Parameter/",
                "filename": f"{FO_file_name}",
            },
        )
        with open(f"{folder_path}/{FO_file_name}", "wb") as f:
            for chunk in requested_file.iter_content(chunk_size=8192):
                if chunk:  # Filter out any potential empty chunks
                    f.write(chunk)
        print(f" {FO_file_name} downloaded ")
    else:
        print(f"{FO_file_name} already downlaod")


# fucntion to download files from NSE server and save them into local machine
def file_downloader(date):
    # last trading day
    schedule = calendar.schedule(
        start_date=current_date - timedelta(10), end_date=current_date
    )
    # print(schedule)
    schedule.sort_values(by="market_open", inplace=True, ascending=False)

    for key, value in schedule.iterrows():

        if current_date.strftime("%d%m%Y") > key.date().strftime("%d%m%Y"):
            last_trading_day = key.date().strftime("%d%m%Y")
            # print(last_trading_day[:4])
            break

    sapn_date = current_date.strftime("%Y%m%d")
    ps03_dict = {}
    file_name_dict = {
        "fao_ottr": [
            "FO",
            "/Investigation/Dnld/",
            f"FAO_ORDER_TO_TRADE_RATIO_{last_trading_day}_90234.csv",
        ],
        "pnc": [
            "FO",
            "/Surveillance/Dnld/",
            f"PNC_OPT_90234_{last_trading_day}.csv",
        ]
    }

    # looping the above dict
    for key, vlaue in file_name_dict.items():
        member_file_list = ["fao_ottr", "pnc"]
        if key in member_file_list:
            filename = f"{file_name_dict[key][2]}"
            file = requests.get(
                "https://www.connect2nse.com/extranet-api/member/file/download/2.0",
                headers=header,
                params={
                    "segment": file_name_dict[key][0],
                    "folderPath": file_name_dict[key][1],
                    "filename": file_name_dict[key][2],
                },
            )
            # downloding the file  hehehe
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
                params={
                    "segment": file_name_dict[key][0],
                    "folderPath": file_name_dict[key][1],
                    "filename": file_name_dict[key][2],
                },
            )
            # downloding the file
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
            # os.remove(os.path.join(folder_path, file_name))


# trading calendars
calendar = trading_calender.get_calendar("NSE")
# today
current_date = datetime.today()


# Check if today is a trading day
is_trading_day = (
    calendar.valid_days(start_date=current_date, end_date=current_date).size > 0
)
# function is calling here
date = current_date.strftime("%d%m%Y")
date1 = current_date.strftime("%d%m%y")
folder_path = f"{date1}"
if not os.path.exists(folder_path):
    os.makedirs(folder_path)

file_downloader(date)
