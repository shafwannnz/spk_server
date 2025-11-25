require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

const userRoutes = require("./routes/userRoutes");
const siswaRoutes = require("./routes/siswaRoutes");
const guruRoutes = require("./routes/dataguruRoutes");
const kriteriaRoutes = require("./routes/kriteriaRoutes");
const perhitunganRoutes = require("./routes/perhitunganRoutes");

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim().replace(/^['"]|['"]$/g, ""))
  .filter(Boolean);

// fetch('http://localhost:3000/api/kriteria') {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify({ nama_kriteria: 'Kualitas', bobot: 3, deskripsi: 'uji' })
// }

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
app.use("/api/guru", guruRoutes);
app.use("/api/kriteria", kriteriaRoutes);
app.use("/api/perhitungan", perhitunganRoutes);

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
