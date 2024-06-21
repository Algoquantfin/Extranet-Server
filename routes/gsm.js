// routes/gsm.js
const express = require("express");
const { fetchDataFromCollection, getLatestGsmCollectionName } = require("../controllers/dataController");
const { checkCollectionExists } = require("../utils/collectionUtils");

module.exports = (gsmDb) => {
  const router = express.Router();

  router.get("/", async (req, res) => {
    try {
      const dateParam = req.query.date;
      let date = dateParam ? dateParam : await getLatestGsmCollectionName(gsmDb);

      date = date.replace(/(\d{2})(\d{2})(\d{2})/, "$1$2$3");

      let collectionName = `90234_GSM_${date}`;

      let collectionExistsASD = await checkCollectionExists(gsmDb, `90234_GSM_ASD_${date}`);
      if (collectionExistsASD) {
        collectionName = `90234_GSM_ASD_${date}`;
      } else {
        let collectionExists = await checkCollectionExists(gsmDb, collectionName);
        if (!collectionExists) {
          throw new Error(`No data found in GSM collection for date: ${date}`);
        }
      }

      const data = await fetchDataFromCollection(gsmDb, collectionName);
      res.json(data);
    } catch (error) {
      console.error("Error fetching GSM data:", error);
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
