require("dotenv").config();
const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const siswaRoutes = require("./routes/siswaRoutes");

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim().replace(/^['"]|['"]$/g, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", userRoutes);
app.use("/api/siswa", siswaRoutes);

app.get("/", (_req, res) => {
  res.json({ message: "SPK API is running" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint tidak ditemukan" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// require ('dotenv').config();
// const express = require('express');
// const cors = require('cors'); // Import the cors middleware
// const app = express();
// const port = 3000;

// // Use the cors middleware
// app.use(cors({
//   origin: 'http://localhost:5173' // Allow only your frontend origin
// }));

// // If you want to allow all origins during development (less secure for production):
// // app.use(cors());

// // Your existing routes
// app.get('/api/siswa', (req, res) => {
//   res.json([{ id: 1, name: 'Budi' }]);
// });

// app.listen(port, () => {
//   console.log(`Server listening at http://localhost:${port}`);
// });
