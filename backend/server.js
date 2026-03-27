const express = require("express");
const cors    = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/users",    require("./routes/userRoutes"));
app.use("/api/requests", require("./routes/requestRoutes"));
app.use("/api/upload",   require("./routes/uploadRoutes"));
app.use("/api/reviews",  require("./routes/reviewRoutes"));

app.get("/", (req, res) => res.send("API Running"));

app.listen(process.env.PORT || 5000, () =>
  console.log(`Server running on port ${process.env.PORT || 5000}`)
);