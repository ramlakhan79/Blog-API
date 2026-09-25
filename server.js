const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

/*
|--------------------------------------------------------------------------
| Load Environment Variables
|--------------------------------------------------------------------------
*/

dotenv.config();

const connectDB = require("./config/db");
const articleRoutes = require("./routes/articleRoutes");
const errorMiddleware = require("./middleware/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const testMailRoutes = require("./routes/testMailRoutes");
const articlePdfRoutes = require("./routes/articlePdfRoutes");
/*
|--------------------------------------------------------------------------
| Connect MongoDB
|--------------------------------------------------------------------------
*/


connectDB();

/*
|--------------------------------------------------------------------------
| Create Express App
|--------------------------------------------------------------------------
*/

const app = express();

/*
|--------------------------------------------------------------------------
| Middleware
|--------------------------------------------------------------------------
*/

const allowedOrigins = ["http://localhost:5173", "http://localhost:5174", process.env.CLIENT_URL];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  }),
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Blog API is running",
  });
});

/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
*/

app.use("/api/auth", authRoutes);

/*
|--------------------------------------------------------------------------
| Article Routes
|--------------------------------------------------------------------------
*/

app.use("/api/articles", articleRoutes);


/*
|--------------------------------------------------------------------------
| User Routes
|--------------------------------------------------------------------------
*/

app.use("/api/users", userRoutes);

/*
|--------------------------------------------------------------------------
| Test Routes
|--------------------------------------------------------------------------
*/

app.use("/api/test", testMailRoutes);

/*
|--------------------------------------------------------------------------
| PDF Routes
|--------------------------------------------------------------------------
*/

app.use("/api/article-pdfs", articlePdfRoutes);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/*
|--------------------------------------------------------------------------
| Error Middleware
|--------------------------------------------------------------------------
*/

app.use(errorMiddleware);

/*
|--------------------------------------------------------------------------
| Start Server
|--------------------------------------------------------------------------
*/

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
