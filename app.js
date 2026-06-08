import express from "express";
import mongoose from "mongoose";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mtec";

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

//in app.js

// Get a restaurant by id
app.get("/getRestaurantById", async (req, res) => {
  try {
    const id = req.query.id;
    console.log(`id: ${id}`);

    const restaurant = await Restaurant.findById(id); //mongoose specialized function
    res.json(restaurant);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching a restaurant");
  }
});

// POST add new restaurant
app.post("/addRestaurant", async (req, res) => {
  try {
    const { name, cuisine, capacity } = req.body;

    if (!name || !cuisine || capacity === undefined) {
      return res
        .status(400)
        .json({ message: "Name, cuisine, and capacity are required" });
    }

    const newRestaurant = new Restaurant({
      name,
      cuisine,
      capacity: parseInt(capacity),
    });

    await newRestaurant.save(); // save the new restaurant to the database
    res.json({
      message: "Restaurant added successfully",
      restaurant: newRestaurant,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding restaurant" });
  }
});

// PUT update restaurant
app.put("/updateRestaurant/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, cuisine, capacity } = req.body;

    const updateData = {};

    if (name !== undefined) {
      updateData.name = name;
    }
    if (cuisine !== undefined) {
      updateData.cuisine = cuisine;
    }
    if (capacity !== undefined) {
      updateData.capacity = parseInt(capacity);
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      //Mongoose method
      id,
      { $set: updateData },
      { new: true },
    );

    if (!updatedRestaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.json({
      message: "Restaurant updated successfully",
      restaurant: updatedRestaurant,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating restaurant" });
  }
});

// DELETE restaurant
app.delete("/deleteRestaurant/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRestaurant = await Restaurant.findByIdAndDelete(id); //Mongoose method

    if (!deletedRestaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }

    res.json({ message: "Restaurant deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting restaurant" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  if (process.env.MONGO_URI) {
    console.log("accessing remote database");
  } else {
    console.log("accessing local database");
  }
});
