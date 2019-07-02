import React, {PureComponent} from 'react'

class EventMap extends PureComponent {

  // class property syntax proposal (currently stage-3)
  gMap = null
  gMapRef = null
  markers = []

  componentDidMount() {
    this.attemptLoadMap()
  }

  componentDidUpdate(prevProps) {
    if (this.props.events !== prevProps.events) {
      this.clearMarkers()
      this.createMarkers(this.props.events)
    }

    if (this.props.lat !== prevProps.lat || this.props.lng !== prevProps.lng) {
      this.centerMap()
    }
  }

  centerMap() {
    this.gMap && this.gMap.setCenter({
      lat: this.props.lat,
      lng: this.props.lng,
    })
  }

  attemptLoadMap = () => {
    if (window.google) {
      this.gMap = this.createMap()
      console.log("MAP CREATED!")
    }
    else {
      window.setTimeout(this.attemptLoadMap, 1000)
    }
  }

  createMap() {
    console.log("CURRENT POS")
    console.log(this.props.lat, this.props.lng)

    const gMap = new window.google.maps.Map(
      this.gMapRef,
      {
        zoom: 10,
        center: {
          lat: this.props.lat || 43,
          lng: this.props.lng || -79,
        },
        disableDefaultUI: true,
      }
    )

    return gMap
  }

  createMarker(lat, lng, title, label) {
    if (!lat || !lng) {
      return
    }

    let m = new window.google.maps.Marker({
      position: {
        lat: lat,
        lng: lng,
      },
      map: this.gMap,
      title: title,
      label: label,
      animation: window.google.maps.Animation.DROP,
    })

    return m
  }

  createMarkers(events) {
    let markers = events.map((event, i) => {
      let loc = event.location && event.location.location || {}
      console.log("ADDING MARKER",
        event.location && event.location.location && event.location.location.latitude,
        event.location && event.location.location && event.location.location.longitude,
        event.title,
      )
      let m = this.createMarker(
        loc.latitude,
        loc.longitude,
        event.title,
        i.toString(),
      )
      return m
    })

    console.log("MARKERS ADDED: ", markers.length)
    console.log(markers)
    this.markers = markers.filter(m => !!m)
    console.log(this.markers)
  }

  clearMarkers() {
    console.log("CLEARING MARKERS")
    console.log(this.markers)
    this.markers.forEach(m => {
      m.setMap(null)
      m = null
    })

    this.markers = []
    console.log("CLEARED MARKERS")
  }

  render() {
    return (
      <div
        className="eventMap"
        ref={el => this.gMapRef = el}
      >
      </div>
    )
  }
}

export default EventMap
