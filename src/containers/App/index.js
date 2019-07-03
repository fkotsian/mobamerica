import React, {Component} from 'react';
import axios from 'axios'
import EventList from '../../components/EventList'
import EventMap from '../../components/EventMap'
import './style.css';

class App extends Component {

  static API_BASE = 'https://api.mobilize.us/v1'

  state = {
    events: [],
    next: null,
    prev: null,
    lat: null,
    lng: null,
    zip: null,
    eventsErr: null,
    loading: true,
    geocodingEnabled: true,
  }
  bodyRef = null

  componentDidMount() {
    // open passing ZIP to test event fetching trigger
    if (this.props.zip) {
      this.setZip(this.props.zip)
    }

    this.loadGoogleApi()
    this.getCurrentPosition()
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.zip !== prevState.zip) {
      this.fetchEvents(undefined, this.state.zip)
    }
  }

  setLatLng(lat, lng, cb) {
    this.setState({
      lat: lat,
      lng: lng,
    }, () => {
      cb && cb();
      this.attemptReverseGeocode(lat, lng);
    })
  }

  setZip(zip) {
    this.setState({
      zip: zip,
    })
  }

  getCurrentPosition(cb) {
    if (window.navigator.geolocation) {
      window.navigator.geolocation.getCurrentPosition((position) => {
        var pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }

        this.setLatLng(
          pos.lat,
          pos.lng,
          cb,
        )
      }, () => {
        console.log("Unable to get location via Geocoordinate API; defaulting to USA")
        this.getDefaultPosition()
      })
    }
    else {
      this.getDefaultPosition()
    }
  }

  getDefaultPosition() {
    this.setState({
      geocodingEnabled: false,
    })
    // zip-based hook not triggered, so load global events
    this.fetchEvents()
  }

  attemptReverseGeocode(lat, lng) {
    if (window.google) {
      this.reverseGeocode(lat, lng)
    }
    else {
      window.setTimeout(() => this.attemptReverseGeocode(lat, lng), 1000)
    }
  }

  reverseGeocode(lat, lng) {
    const geocoder = new window.google.maps.Geocoder

    geocoder.geocode({
      'location': {
        lat: lat,
        lng: lng,
      },
    },
    (res, status) => {
      if (status === 'OK' && res[0]) {
        let zip = res[0].address_components[7] && res[0].address_components[7].long_name
        this.setZip(zip)
      }
      else {
        console.log("FAILED TO GEOCODE")
      }
    })
  }

  loadGoogleApi() {
    let gMapsScript = document.createElement('script')
    gMapsScript.type = 'text/javascript'
    gMapsScript.dataset.testid = 'gMapsScript'
    gMapsScript.src = `https://maps.googleapis.com/maps/api/js?v=3&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`

    this.bodyRef.appendChild(gMapsScript)
  }

  queryStrFor(base, zip) {
    if (!/\?/.test(base)) {
      base += "?"
    }
    else if (base.charAt(base.length-1) !== '&') {
      base += '&'
    }

    if (zip) {
      base += `zipcode=${zip}&`
    }

    return base
  }

  fetchEvents(
    url=`${App.API_BASE}/events`,
    zip=null
  ) {

    url = this.queryStrFor(url, zip)

    this.setState({
      loading: true,
      eventsErr: false,
      events: [],
    })
    return axios.get(
      url
    ).then(res => {
      return res['data']
    }, err => {
      console.log("ERROR FETCHING EVENTS")
      console.log(err)
      this.setState({
        eventsErr: true,
      })
    }).then(data => {
      this.setState({
        events: data['data'],
        next: data['next'],
        prev: data['previous'],
        loading: false,
        eventsErr: false,
      })
      return data['data']
    })
  }

  fetchPage(url) {
    return (e) => {
      e.preventDefault()
      this.fetchEvents(url)
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
            My Location: {
              this.state.geocodingEnabled
                ?
                  this.state.zip || 'USA'
                :
                  'The World'
            }
          </div>
        </header>

        <div
          className="body"
          ref={el => this.bodyRef = el}
        >
          <EventList
            events={this.state.events}
            loading={this.state.loading}
          />
          <EventMap
            events={this.state.events}
            lat={this.state.lat}
            lng={this.state.lng}
          />
        </div>

        <div
          className="footer"
        >
          <div
            className="pagination"
          >
            <a
              className="pagination__link"
              disabled={!this.state.prev}
              onClick={this.fetchPage(this.state.prev)}
              href={this.state.prev}
            >
              Prev
            </a>
            <a
              className="pagination__link"
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
