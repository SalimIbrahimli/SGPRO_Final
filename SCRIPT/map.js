  const map = L.map('map').setView([40.4093, 49.8671], 15); // Bakı nümunə

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(map);

  L.marker([40.4093, 49.8671])
    .addTo(map)
    .bindPopup("SGPRO – Biz buradayıq 🚀")
    .openPopup();