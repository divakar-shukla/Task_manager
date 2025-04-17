import app from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 8000;
// process.exit(1)

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`app is runing on port ${port}`);
    });
  })
  .catch(() => {
    console.error("Database connection failed");
  });
