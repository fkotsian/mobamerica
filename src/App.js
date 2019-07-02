import React, {Component} from 'react';
import axios from 'axios'
import logo from './logo.svg';
import './App.css';

class App extends Component {

  API_BASE = 'https://api.mobilize.us/v1'
  state = {
    events: [],
    next: null,
    prev: null,
    currentPosition: null,
  }
  gMap = null
  gMapRef = null
  bodyRef = null
  eventListRef = null
  eventListAnchorRef = null

  componentDidMount() {
    // load gMap
    let gMapsScript = document.createElement('script')
    gMapsScript.type = 'text/javascript'
    gMapsScript.src = `https://maps.googleapis.com/maps/api/js?v=3&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`
    gMapsScript.addEventListener('load', () => {
      this.getCurrentPosition(() => {
        this.gMap = this.createMap()
        console.log("MAP LOADED")

        // load events after map is loaded
        this.fetchEvents()
      })
    })

    this.bodyRef.appendChild(gMapsScript);
  }

  getCurrentPosition(cb) {
    console.log("CURR POS?")
    console.log(window.navigator.geolocation)
    if (window.navigator.geolocation) {
      window.navigator.geolocation.getCurrentPosition((position) => {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }

        this.setState({
          currentPosition: pos,
        }, () => {
          cb && cb()
        })

      }, () => {
        console.log("Unable to get location via Geocoordinate API; defaulting to NY")
      })
    }
  }

  createMap() {
    console.log("CURRENT POS")
    console.log(this.state.currentPosition)

    const gMap = new window.google.maps.Map(
      this.gMapRef,
      {
        zoom: 10,
        center: {
          lat: 40.04 || this.state.currentPosition.lat || 43,
          lng: -76.02 || this.state.currentPosition.lng || -79,
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

    console.log("HAS MAP?", this.gMap)

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
    console.log("Marker: ")
    console.log(m)
  }

  fetchEvents(
    url=`${this.API_BASE}/events`
  ) {
    return axios.get(
      url
    ).then(res => {
      console.log("EVENTS!")
      console.log(res)
      return res['data']
    }).then(data => {
      this.setState({
        events: data['data'],
        next: data['next'],
        prev: data['previous'],
      })

      data['data'].forEach((event, i) => {
        console.log("ADDING MARKER",
          event.location && event.location.location && event.location.location.latitude,
          event.location && event.location.location && event.location.location.longitude,
          event.title,
        )
        event.location && event.location.location && this.createMarker(
          event.location.location.latitude,
          event.location.location.longitude,
          event.title,
          i,
        )
      })
    })
  }

  fetchPage(url) {
    return (e) => {
      e.preventDefault()
      this.fetchEvents(url)
      this.eventListAnchorRef.scrollIntoView({
        behavior: 'smooth',
      })
    }
  }

  render() {
    return (
      <div className="App">
        <header className="header">
          <p>
            Welcome to MobAmerica
          </p>
        </header>

        <div
          className="body"
          ref={el => this.bodyRef = el}
        >
          <div
            className="eventList"
            ref={el => this.eventListRef = el}
          >
            <div
              ref={el => this.eventListAnchorRef = el}
            >
            </div>
            {
              this.state.events.map(e => (
                <div
                  key={e.id}
                  className="event-item"
                >
                  <a
                    href={e.browser_url}
                    target="_blank"
                  >
                    {e.title}
                  </a>
                  <p>
                    {e.sponsor.name}
                  </p>
                  <p>
                    { e.summary }
                  </p>
                  <p>
                    {e.location && (e.location.locality || e.location.postal_code)}
                  </p>
                </div>
              ))
            }
          </div>
          <div
            className="eventMap"
            ref={el => this.gMapRef = el}
          >
          </div>
        </div>

        <div
          className="footer"
        >
          <div
            className="eventList__nav"
          >
            <a
              disabled={!this.state.prev}
              onClick={this.fetchPage(this.state.prev)}
              href={this.state.prev}
            >
              Prev
            </a>
            <a
              disabled={!this.state.next}
              onClick={this.fetchPage(this.state.next)}
              href={this.state.next}
            >
              Next
            </a>
          </div>
        </div>
      </div>
    )
  }
}

export default App
