<?php
// Konfigurasi database
$host = 'localhost';
$user = 'root';
$password = '';
$database = 'pariwisata';

$conn = new mysqli($host, $user, $password, $database);
if ($conn->connect_error) {
    die("Koneksi gagal: " . $conn->connect_error);
}

// Baca file GeoJSON
$json_file = '38 Provinsi Indonesia - Provinsi.json';
$json_data = file_get_contents($json_file);
if (!$json_data) {
    die("Gagal membaca file JSON.");
}

$geojson = json_decode($json_data, true);
if (!$geojson || !isset($geojson['features'])) {
    die("Format JSON tidak valid.");
}

// Hapus data lama (jika diperlukan)
$conn->query("DELETE FROM provinsiind_geojson");

// Proses dan masukkan ke database
foreach ($geojson['features'] as $feature) {
    if (!isset($feature['geometry'])) continue;

    // Ambil nama provinsi dari properties, sesuaikan field sesuai isi file
    $provinceName = isset($feature['properties']['PROVINSI']) 
        ? strtoupper($feature['properties']['PROVINSI']) 
        : (isset($feature['properties']['provinsi']) 
            ? strtoupper($feature['properties']['provinsi']) 
            : null);

    if (!$provinceName) continue;

    $geometry = $feature['geometry'];
    $geojson_text = json_encode($geometry);

    $stmt = $conn->prepare("INSERT INTO provinsiind_geojson (province, geojson) VALUES (?, ?)");
    $stmt->bind_param("ss", $provinceName, $geojson_text);
    $stmt->execute();
    $stmt->close();
}

echo "Berhasil menyimpan data provinsi ke database.";
$conn->close();
?>
