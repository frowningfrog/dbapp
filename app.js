import express from "express";
import mongoose from "mongoose";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// const MONGO_URI = "mongodb://localhost:27017/mtec";
const MONGO_URI = "mongodb://127.0.0.1:27017";

mongoose.connect(MONGO_URI);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("Connected to MongoDB");
});
const restaurantSchema = new mongoose.Schema({
  name: String,
  cuisine: String,
  capacity: Number,
});
const Restaurant = mongoose.model("Restaurant", restaurantSchema);

app.get("/getRestaurants", async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching restaurants");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
