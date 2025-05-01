maplibregl.accessToken = mapToken;

const map = new maplibregl.Map({
    container: 'map',
    style: 'https://api.maptiler.com/maps/streets/style.json?key=nOQObUQWP1nl4VOlphj8', // or your custom style
    center: [77.5946, 12.9716], // Initial center
    zoom: 3
});
 
async function getCoordinatesFromAddress(address) {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
    const data = await response.json();
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      };
    } else {
      throw new Error("Location not found");
    }
  }
  
  async function addListing(address, map) {
    try {
      const coords = await getCoordinatesFromAddress(address);
  
      new maplibregl.Marker()
        .setLngLat([coords.lon, coords.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 25 })
            .setHTML(`<h4>${address}</h4><p>Exact location provided after booking</p>`)
        )
        .addTo(map);
  
      map.flyTo({
        center: [coords.lon, coords.lat],
        zoom: 9
      });
  
    } catch (err) {
      console.error("Map error:", err.message);
    }
  }
  
  map.on('load', () => {
    if (typeof address !== 'undefined') {
      addListing(address, map);
    }
  });

// // Add a new listing after map loads
// map.on('load', () => {
//     addListing("Gateway of India, Mumbai", map);
// });

// const map = new maplibregl.Map({
//     container: 'map',
//     style: 'https://api.maptiler.com/maps/streets/style.json?key=nOQObUQWP1nl4VOlphj8',
//     center: [77.5946, 12.9716],
//     zoom: 10
// });

// map.addControl(new maplibregl.NavigationControl());

// new maplibregl.Marker()
//     .setLngLat(listingCoordinates)
//     .addTo(map);

// var map = new maplibregl.Map({
//     container: 'map',
//     style: 'https://api.maptiler.com/maps/streets/style.json?key=nOQObUQWP1nl4VOlphj8',
//     center: [72.88261000, 19.07283000], // Default India
//     zoom: 9
// });

// map.addControl(new maplibregl.NavigationControl());
