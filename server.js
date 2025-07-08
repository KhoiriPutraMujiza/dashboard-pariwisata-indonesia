const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const app = express();
const port = 3000;

// Konfigurasi koneksi database
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "pariwisata",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

const pool = mysql.createPool(dbConfig);

app.use(cors());
app.use(express.json());

/* ========================
   HOTEL BINTANG
======================== */
app.get("/api/hotel_bintang", async (req, res) => {
  try {
    const { tahun } = req.query;
    let query =
      "SELECT id, provinsi, tahun, akomodasi, kamar, tempat_tidur FROM jlh_akomodasi_dll_hotel_bintang";
    const params = [];

    if (tahun) {
      query += " WHERE tahun = ?";
      params.push(tahun);
    }

    const [results] = await pool.query(query, params);
    res.json(results);
  } catch (err) {
    console.error("Query error:", err);
    res.status(500).json({ error: "Gagal mengambil data hotel bintang" });
  }
});

/* ========================
   HOTEL NON-BINTANG
======================== */
app.get("/api/hotel_non_bintang", async (req, res) => {
  try {
    const { tahun } = req.query;
    let query =
      "SELECT id, provinsi, tahun, akomodasi, kamar, tempat_tidur FROM jlh_akomodasi_dll_hotel_non_bintang";
    const params = [];

    if (tahun) {
      query += " WHERE tahun = ?";
      params.push(tahun);
    }

    const [results] = await pool.query(query, params);
    res.json(results);
  } catch (err) {
    console.error("Query error:", err);
    res.status(500).json({ error: "Gagal mengambil data hotel non-bintang" });
  }
});

/* ========================
   PERJALANAN PARIWISATA NUSANTARA
======================== */
app.get("/api/perjalanan_nusantara", async (req, res) => {
  try {
    const { tahun } = req.query;

    let query =
      "SELECT id, provinsi, tahun, jumlah_perjalanan FROM jumlah_perjalanan_pariwisata_nusantara";
    const params = [];

    if (tahun) {
      query += " WHERE tahun = ?";
      params.push(tahun);
    }

    const [results] = await pool.query(query, params);
    res.json(results);
  } catch (err) {
    console.error("Query error:", err);
    res
      .status(500)
      .json({ error: "Gagal mengambil data perjalanan nusantara" });
  }
});

/* ========================
   GEOJSON PROVINSI
======================== */
app.get("/api/provinsi_geojson", async (req, res) => {
  try {
    const [results] = await pool.query(
      "SELECT province, geojson FROM provinsiind_geojson"
    );

    const formatted = results.map((row) => ({
      province: row.province,
      geojson: JSON.parse(row.geojson),
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Query error:", err);
    res.status(500).json({ error: "Gagal mengambil data geojson provinsi" });
  }
});

/* ========================
   TINGKAT HUNIAN KAMAR HOTEL
======================== */
app.get("/api/tingkat_hunian", async (req, res) => {
  try {
    const { tahun } = req.query;
    let query = `
      SELECT id, provinsi, tahun, hotel_berbintang, hotel_non_berbintang
      FROM tingkat_hunian_kamar_hotel
    `;
    const params = [];

    if (tahun) {
      query += " WHERE tahun = ?";
      params.push(tahun);
    }

    const [results] = await pool.query(query, params);
    res.json(results);
  } catch (err) {
    console.error("Query error:", err);
    res
      .status(500)
      .json({ error: "Gagal mengambil data tingkat hunian kamar hotel" });
  }
});

/* ========================
   JALANKAN SERVER
======================== */
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

process.on("SIGINT", async () => {
  await pool.end();
  process.exit();
});
