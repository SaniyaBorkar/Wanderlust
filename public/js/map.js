	mapboxgl.accessToken = mapToken;
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: 'mapbox://styles/mapbox/streets-v12',
        center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
        zoom: 9 // starting zoom
    });

 // Create a default Marker and add it to the map.
//  const marker = new mapboxgl.Marker()
//  .setLngLat(coordinates)
//  .addTo(map);
const marker = new mapboxgl.Marker({ color: "red" })
    .setLngLat(listing.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 }) // Initialize the popup
            .setHTML(`<h6>${listing.location}</h6><p>Exact location provided after booking</p>`) // Set the popup content
    )
    .addTo(map);