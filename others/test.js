const express = require("express");
const csv = require("csv-parser");
const fs = require("fs");
const { promisify } = require("util");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

const readdirAsync = promisify(fs.readdir);

const gsmDirectoryPath = "./ftp/gsm";

const fetchDataFromCSV = async (filePath) => {
  try {
    const data = [];
    const stream = fs.createReadStream(filePath).pipe(csv());

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
    console.log("Entries in base path:", entries);

    const dateFiles = entries
      .map(entry => {
        const dateObj = extractDateFromFilename(entry);
        return dateObj ? { entry, date: dateObj.date, formattedDate: dateObj.formattedDate } : null;
      })
      .filter(entry => entry !== null)
      .sort((a, b) => b.date - a.date);

    console.log("Valid date files:", dateFiles.map(f => f.entry));

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
