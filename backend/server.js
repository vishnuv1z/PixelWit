const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/users",
require("./routes/userRoutes"));

app.get("/", (req,res)=>{
  res.send("API Running");
});

app.listen(5000, ()=>{
  console.log("Server running on port 5000");
});