

mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/light-v10', // style URL
  // center: [lng, lat], // starting position [lng, lat]
  center: campground.geometry.coordinates,
  zoom: 12, // starting zoom
  projection: 'globe' // display the map as a 3D globe
});
// map.on('style.load', () => {
//   map.setFog({}); // Set the default atmosphere style
// });


// Set marker options.
new mapboxgl.Marker({
  color: "black",
  draggable: false
})
  .setPopup(
    new mapboxgl.Popup({ offset: 35 })
      .setHTML(
        `<h5>${campground.title}</h5>
         <p>${campground.location}</p>`
      )
  )
  .setLngLat([lng, lat])
  .addTo(map);