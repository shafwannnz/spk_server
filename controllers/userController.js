const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const secret = process.env.JWT_SECRET || "rahasia";

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Nama, email, dan password wajib diisi" });
    }

    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: "Email sudah terdaftar" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role: "admin" });
    // menambahkan role default 'admin' saat pendaftaran

    res.status(201).json({ message: "User registered", user });
  } catch (err) {
    console.error("POST /api/register:", err);
    res.status(500).json({ message: "Gagal mendaftarkan user" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password} = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email dan password wajib diisi" });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "User tidak ditemukan" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Email atau password salah" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role ?? "admin" },
      secret,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("POST /api/login:", err);
    res.status(500).json({ message: "Gagal memproses login" });
  }
};

exports.getAll = async (_req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    console.error("GET /api/users:", err);
    res.status(500).json({ message: "Gagal memuat data user" });
  }
};

exports.getOne = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    res.json(user);
  } catch (err) {
    console.error("GET /api/users/:id:", err);
    res.status(500).json({ message: "Gagal memuat detail user" });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const payload = { name, email };

    if (password) {
      payload.password = await bcrypt.hash(password, 10);
    }

    const updated = await User.update(req.params.id, payload);
    if (!updated) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json({ message: "User updated", user: updated });
  } catch (err) {
    console.error("PUT /api/users/:id:", err);
    res.status(500).json({ message: "Gagal memperbarui user" });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await User.remove(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("DELETE /api/users/:id:", err);
    res.status(500).json({ message: "Gagal menghapus user" });
  }
};
