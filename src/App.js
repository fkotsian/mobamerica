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
    lat: null,
    lng: null,
    zip: null,
  }
  gMap = null
  gMapRef = null
  bodyRef = null
  eventListRef = null
  eventListAnchorRef = null
  markers = []

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
          lat: pos.lat,
          lng: pos.lng,
        }, () => {
          cb && cb()
          this.reverseGeocode(pos.lat, pos.lng)
        })

      }, () => {
        console.log("Unable to get location via Geocoordinate API; defaulting to NY")
      })
    }
  }

  reverseGeocode(lat, lng) {
    const geocoder = new window.google.maps.Geocoder
    console.log("REVERSE GEOCODE INIT", lat, lng)

    geocoder.geocode({
      'location': {
        lat: lat,
        lng: lng,
      },
    },
    (res, status) => {
      if (status === 'OK') {
        if (res[0]) {
          console.log("REVERSE GEOCODED")
          console.log(res[0])
          this.setState({
            zip: res[0].address_components[7] && res[0].address_components[7].long_name,
          })
        }
      }
      else {
        console.log("FAILED TO GEOCODE")
      }
    })
  }

  createMap() {
    console.log("CURRENT POS")
    console.log(this.state.lat, this.state.lng)

    const gMap = new window.google.maps.Map(
      this.gMapRef,
      {
        zoom: 10,
        center: {
          lat: this.state.lat || 43,
          lng: this.state.lng || -79,
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

  queryStrFor(base) {
    if (!/\?/.test(base)) {
      base += "?"
    }
    else if (base.charAt(base.length-1) !== '&') {
      base += '&'
    }

    if (this.state.zip) {
      base += `zipcode=${this.state.zip}&`
    }

    return base
  }

  clearMarkers = () => {
    console.log("CLEARING MARKERS")
    console.log(this.markers)
    this.markers.forEach(m => {
      m.setMap(null)
      m = null
    })

    this.markers = []
    console.log("CLEARED MARKERS")
  }

  fetchEvents(
    url=`${this.API_BASE}/events`
  ) {
    console.log("FETCHING: ", this.queryStrFor(url))
    this.clearMarkers()

    return axios.get(
      this.queryStrFor(url)
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
      return data['data']
    }).then(newEvents => {
      let markers = newEvents.map((event, i) => {
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
          <div>
            Current Loc: {this.state.lat}, {this.state.lng}
            <br />
            ZIP: {this.state.zip}
          </div>
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
                  className="eventItem"
                >
                  <div
                    className="eventItem__left"
                  >
                    <span
                    >
                      <a
                        href={e.browser_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {e.title}
                      </a>
                      {
                        e.timeslots && e.timeslots.length > 0
                          ?
                            e.timeslots
                              .filter(t => !t.is_full)
                              .slice(0,3)
                              .map(t => (
                                <span
                                >
                                  {new Date(t.start_date * 1000).toLocaleString()} - {new Date(t.end_date * 1000).toLocaleString()}
                                </span>
                            ))
                          :
                            ''
                      }
                    </span>
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

                  <div
                    className="eventItem__right"
                  >
                    {
                      e.featured_image_url
                        ?
                          <img
                            onError={(e) => {e.target.width = 0; e.target.height = 0}}
                            className="eventItem__image"
                            src={e.featured_image_url}
                          />
                        :
                          ''
                    }
                  </div>
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
              className="eventList__nav__link"
              disabled={!this.state.prev}
              onClick={this.fetchPage(this.state.prev)}
              href={this.state.prev}
            >
              Prev
            </a>
            <a
              className="eventList__nav__link"
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
