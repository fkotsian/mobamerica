import React, {Component} from 'react';
import axios from 'axios'
import EventList from '../../components/EventList'
import EventMap from '../../components/EventMap'
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
  bodyRef = null
  eventListRef = null

  componentDidMount() {
    this.loadGoogleApi()

    // get position
    this.getCurrentPosition()
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.zip !== prevState.zip) {
      this.fetchEvents(undefined, this.state.zip)
      console.log("EVENTS REFETCHED ON ZIP")
    }
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
          cb && cb();
          this.attemptReverseGeocode(pos.lat, pos.lng);
        })

      }, () => {
        console.log("Unable to get location via Geocoordinate API; defaulting to NY")
      })
    }
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

  loadGoogleApi() {
    let gMapsScript = document.createElement('script')
    gMapsScript.type = 'text/javascript'
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
    url=`${this.API_BASE}/events`,
    zip=null
  ) {

    url = this.queryStrFor(url, zip)

    console.log("FETCHING: ", url)
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
            Current Loc: {this.state.lat}, {this.state.lng}
            <br />
            ZIP: {this.state.zip}
          </div>
        </header>

        <div
          className="body"
          ref={el => this.bodyRef = el}
        >
          <EventList
            events={this.state.events}
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
