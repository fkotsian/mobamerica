import React, {PureComponent} from 'react'
import './style.css'

class EventMap extends PureComponent {

  static DEFAULT_ZOOM = 3
  static CITY_ZOOM = 10
  static DEFAULT_LAT = 40
  static DEFAULT_LNG = -95

  // class property syntax proposal (currently stage-3)
  gMap = null
  gMapRef = null
  markers = []

  componentDidMount() {
    this.attemptLoadMap()
  }

  componentDidUpdate(prevProps) {
    this.clearMarkers()
    this.createMarkers(this.props.events)

    if (this.props.lat !== prevProps.lat || this.props.lng !== prevProps.lng) {
      this.centerMap()
      this.zoomMap()
    }
  }

  centerMap() {
    this.gMap && this.gMap.setCenter({
      lat: this.props.lat,
      lng: this.props.lng,
    })
  }

  zoomMap() {
    const zoom = this.zoomLevel()
    this.gMap && this.gMap.setZoom(zoom)
  }

  zoomLevel() {
    const zoomLevel = (this.props.lat && this.props.lng)
      ? EventMap.CITY_ZOOM
      : EventMap.DEFAULT_ZOOM

    return zoomLevel
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

    const zoomLevel = this.zoomLevel()

    const gMap = new window.google.maps.Map(
      this.gMapRef,
      {
        zoom: zoomLevel,
        center: {
          lat: this.props.lat || EventMap.DEFAULT_LAT,
          lng: this.props.lng || EventMap.DEFAULT_LNG,
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
        (i+1).toString(),
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
        data-testid="eventMap"
        ref={el => this.gMapRef = el}
      >
      </div>
    )
  }
}

export default EventMap
