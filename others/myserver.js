// Server for local data 
const express = require("express");
const csv = require("csv-parser");
const fs = require("fs");
const { promisify } = require("util"); // Import promisify to convert fs functions to promises
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

// Apply CORS middleware to allow requests from any origin
app.use(cors());

// Convert fs functions to promises
const readdirAsync = promisify(fs.readdir);
const readFileAsync = promisify(fs.readFile);

// Directory path for CSV files
// const ftpDirectoryPath = "D:/project_python/FTP/working/Back_End/server/ftp/";
const ftpDirectoryPath = "./ftp/";

// Directory path for GSM files
// const gsmDirectoryPath = "./ftp/gsm"
const gsmDirectoryPath = "./ftp/gsm";


// Function to fetch data from a CSV file
const fetchDataFromCSV = async (filePath) => {
  try {
    const data = [];
    const stream = fs.createReadStream(filePath).pipe(csv());

    // Use promise to resolve when all data is read
    await new Promise((resolve, reject) => {
      stream.on("data", (chunk) => data.push(chunk));
      stream.on("end", resolve);
      stream.on("error", reject);
    });

    return data;
  } catch (error) {
    throw new Error(`Error reading file: ${error}`);
  }
};

// Endpoint to serve PNC files based on date
app.get("/pnc", async (req, res) => {
  let date = req.query.date;

  // Check if date is not provided
  if (!date) {
    // Calculate today's date
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yy = String(today.getFullYear()).slice(-2); // Last 2 digits of the year
    date = `${dd}${mm}${yy}`; // Format: DDMMYY
  }

  const directoryPath = path.join(ftpDirectoryPath, date);

  try {
    // Check if directory exists
    if (!fs.existsSync(directoryPath)) {
      throw new Error(`No data available for the date: ${date}`);
    }

    const files = await readdirAsync(directoryPath);
    const pncFiles = files.filter((file) => file.toLowerCase().includes("pnc"));

    const dataPromises = pncFiles.map(async (file) => {
      const filePath = path.join(directoryPath, file);
      const fileData = await fetchDataFromCSV(filePath);
      return fileData;
    });

    const responseData = await Promise.all(dataPromises);
    res.json(responseData.flat()); // Flatten the array to remove extra brackets
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to serve FNO files based on date
app.get("/fno", async (req, res) => {
  let date = req.query.date;

  // Check if date is not provided
  if (!date) {
    // Calculate today's date
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yy = String(today.getFullYear()).slice(-2); // Last 2 digits of the year
    date = `${dd}${mm}${yy}`; // Format: DDMMYY
  }

  const directoryPath = path.join(ftpDirectoryPath, date);

  try {
    // Check if directory exists
    if (!fs.existsSync(directoryPath)) {
      throw new Error(`No data available for the date: ${date}`);
    }

    const files = await readdirAsync(directoryPath);
    const fnoFiles = files.filter((file) => file.toLowerCase().includes("fao"));
    
    const dataPromises = fnoFiles.map(async (file) => {
      const filePath = path.join(directoryPath, file);
      const fileData = await fetchDataFromCSV(filePath);
      return fileData;
    });

    const responseData = await Promise.all(dataPromises);
    res.json(responseData.flat()); // Flatten the array to remove extra brackets
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});




// Function to live GSM folder and their each files
// Endpoint to serve GSM files based on date
const extractDateFromFilename = (filename) => {
  const match = filename.match(/\d{2}-[A-Z]{3}-\d{4}/);
  if (match) {
    const [day, month, year] = match[0].split("-");
    const monthIndex = new Date(`${month} 1, 2000`).getMonth();
    const date = new Date(year, monthIndex, day);
    const formattedDate = `${String(day).padStart(2, "0")}${String(monthIndex + 1).padStart(2, "0")}${String(year).slice(-2)}`;
    return { date, formattedDate };
  }
  return null;
};

const getLatestDateFromFiles = async (basePath) => {
  try {
    const entries = await readdirAsync(basePath);
    // console.log("Entries in base path:", entries);

    const dateFiles = entries
      .map(entry => {
        const dateObj = extractDateFromFilename(entry);
        return dateObj ? { entry, date: dateObj.date, formattedDate: dateObj.formattedDate } : null;
      })
      .filter(entry => entry !== null)
      .sort((a, b) => b.date - a.date);

    // console.log("Valid date files:", dateFiles.map(f => f.entry));

    return dateFiles.length > 0 ? dateFiles[0].entry : null;
  } catch (error) {
    throw new Error("Error reading directories");
  }
};

app.get("/gsm", async (req, res) => {
  let date = req.query.date;

  try {
    let dateFiles;
    if (!date) {
      const latestDateFile = await getLatestDateFromFiles(gsmDirectoryPath);
      if (!latestDateFile) {
        throw new Error("No data available.");
      }
      dateFiles = [latestDateFile];
    } else {
      const files = await readdirAsync(gsmDirectoryPath);
      dateFiles = files.filter(file => {
        const dateObj = extractDateFromFilename(file);
        return dateObj && dateObj.formattedDate === date && file.toLowerCase().includes("gsm");
      });

      if (dateFiles.length === 0) {
        throw new Error(`No data available for the date: ${date}`);
      }
    }

    const dataPromises = dateFiles.map(async (file) => {
      const filePath = path.join(gsmDirectoryPath, file);
      const fileData = await fetchDataFromCSV(filePath);
      return fileData;
    });

    const responseData = await Promise.all(dataPromises);
    res.json(responseData.flat());
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
