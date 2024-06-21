// routes/otr.js
const express = require("express");
const { fetchDataFromCollection, getLatestCollectionName } = require("../controllers/dataController");

module.exports = (otrDb) => {
  const router = express.Router();

  router.get("/", async (req, res) => {
    try {
      const dateParam = req.query.date;
      const date = dateParam ? dateParam : await getLatestCollectionName(otrDb);
      const data = await fetchDataFromCollection(otrDb, date);
      res.json(data);
    } catch (error) {
      console.error("Error fetching OTR data:", error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
