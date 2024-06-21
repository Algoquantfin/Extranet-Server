// routes/pnc.js
const express = require("express");
const { fetchDataFromCollection, getLatestCollectionName } = require("../controllers/dataController");

module.exports = (pncDb) => {
  const router = express.Router();

  router.get("/", async (req, res) => {
    try {
      const dateParam = req.query.date;
      const date = dateParam ? dateParam : await getLatestCollectionName(pncDb);
      const data = await fetchDataFromCollection(pncDb, date);
      res.json(data);
    } catch (error) {
      console.error("Error fetching PNC data:", error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
