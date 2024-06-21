// server.js
const express = require("express");
const cors = require("cors");
const { connectToMongoDB } = require("./config/db");
const pncRoutes = require("./routes/pnc");
const otrRoutes = require("./routes/otr");
const gsmRoutes = require("./routes/gsm");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

connectToMongoDB().then(({ pncDb, otrDb, gsmDb }) => {
  // Inject db instances into the route handlers
  app.use("/pnc", pncRoutes(pncDb));
  app.use("/otr", otrRoutes(otrDb));
  app.use("/gsm", gsmRoutes(gsmDb));

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(error => {
  console.error("Failed to start the server:", error);
  process.exit(1);
});
