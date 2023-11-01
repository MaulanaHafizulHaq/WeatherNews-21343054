const express = require("express");
const hbs = require("hbs");
const path = require("path");
const geocode = require("./utils/geocode");
const forecast = require("./utils/prediksiCuaca");
const getBerita = require("axios");

const app = express();
const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, "../public");
const viewPath = path.join(__dirname, "../templates/views");
const partialsPath = path.join(__dirname, "../templates/partials");

app.set("view engine", "hbs");
app.set("views", viewPath);
hbs.registerPartials(partialsPath);

app.use(express.static(publicDirectoryPath));

app.get("", (req, res) => {
  res.render("index", {
    title: "Aplikasi Cek Cuaca",
    name: "Maulana Hafizul Haq",
  });
});

app.get("/tentang", (req, res) => {
  res.render("tentang", {
    title: "Tentang Saya",
    name: "Maulana Hafizul Haq",
  });
});

app.get("/bantuan", (req, res) => {
  res.render("bantuan", {
    title: "Bantuan",
    teksBantuan: "Bantuan apa yang anda butuhkan?",
    name: "Maulana Hafizul Haq",
  });
});

app.get("/berita", async (req, res) => {
  try {
    const urlApiMediaStack = "http://api.mediastack.com/v1/news";
    const apiKey = "ebc790aaa79d2204d119ac5aa445f9cb";

    const params = {
      access_key: apiKey,
      countries: "id",
      limit: 99,
    };

    const response = await getBerita.get(urlApiMediaStack, { params });
    const dataBerita = response.data;

    res.render("berita", {
      name: "Maulana Hafizul Haq",
      judul: "Laman Berita",
      berita: dataBerita.data,
      gambar: dataBerita.data.images,
    });
  } catch (error) {
    console.error(error);
    res.render("error", {
      judul: "Terjadi Kesalahan",
      pesanKesalahan: "Terjadi kesalahan saat mengambil berita.",
    });
  }
});
app.get("/infocuaca", (req, res) => {
  if (!req.query.address) {
    return res.send({
      error: "Kamu harus memasukan lokasi yang ingin dicari",
    });
  }
  geocode(
    req.query.address,
    (error, { latitude, longitude, location } = {}) => {
      if (error) {
        return res.send({ error });
      }
      forecast(latitude, longitude, (error, dataPrediksi) => {
        if (error) {
          return res.send({ error });
        }
        res.send({
          prediksiCuaca: dataPrediksi,
          lokasi: location,
          address: req.query.address,
        });
      });
    }
  );
});

app.get("/bantuan/*", (req, res) => {
  res.render("404", {
    title: "404",
    name: "Maulana Hafizul Haq",
    pesanError: "Belum ada artikel bantuan tersedia",
  });
});

app.get("*", (req, res) => {
  res.render("404", {
    title: "404",
    name: "Maulana Hafizul Haq",
    pesanError: "Halaman tidak ditemukan",
  });
});

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
