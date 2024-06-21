// dateUtils.js

// Function to get current date folder
const getCurrentDateFolder = (date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear().toString().slice(-2);
    return `${day}${month}${year}`;
  };
  
  // Function to get current date for PNC
  const currentDateForPNC = (date) => {
    const previousDay = new Date(date);
    previousDay.setDate(previousDay.getDate() - 0);
    const day = previousDay.getDate().toString().padStart(2, "0");
    const month = (previousDay.getMonth() + 1).toString().padStart(2, "0");
    const year = previousDay.getFullYear().toString();
    return `PNC_OPT_90234_${day}${month}${year}`;
  };
  
  // Function to get current date for FNO
  const currentDateForFNO = (date) => {
    const previousDay = new Date(date);
    previousDay.setDate(previousDay.getDate() - 0);
    const day = previousDay.getDate().toString().padStart(2, "0");
    const month = (previousDay.getMonth() + 1).toString().padStart(2, "0");
    const year = previousDay.getFullYear().toString();
    return `FAO_ORDER_TO_TRADE_RATIO_${day}${month}${year}__90234`;
  };
  
  // Function to get the folder name of the last available date where data exists
  const lastDateForFolder = (date) => {
    const previousDay = new Date(date);
    previousDay.setDate(previousDay.getDate() - 1);
    return getCurrentDateFolder(previousDay);
  };
  
  // Function to get the file name for FNO data from the last available date where data exists
  const lastDateForFNO = (date) => {
    const previousDay = new Date(date);
    previousDay.setDate(previousDay.getDate() - 1);
    return currentDateForFNO(previousDay);
  };
  
  // Function to get the file name for PNC data from the last available date where data exists
  const lastDateForPNC = (date) => {
    const previousDay = new Date(date);
    previousDay.setDate(previousDay.getDate() - 1);
    return currentDateForPNC(previousDay);
  };
  
  module.exports = {
    getCurrentDateFolder,
    dateForPNC: currentDateForPNC,
    dateForFNO: currentDateForFNO,
    lastDateForFolder,
    lastDateForFNO,
    lastDateForPNC,
  };  

// these three function will check the last date folder and file if the data(file) doesn't exist current day folder then it will look(search) in other folder (last date) that is data exist there or not, and till it find data will will continue searching data(file)
