import React from 'react'
import {
  render
} from '@testing-library/react'
import axiosMock from 'axios'
import App from './index.js'

const mockData = {
  data: {
    data: [],
  }
}
jest.mock('axios')
axiosMock.get.mockImplementation(() => Promise.resolve(mockData))

it('renders without crashing', () => {
  const { getByText } = render(<App />)
  expect(getByText('Welcome to MobAmerica')).toBeInTheDocument()
})

describe('on mount', () => {
  it('loads the Google Maps API', () => {
    const { getByTestId } = render(<App />)
    expect(getByTestId('gMapsScript')).toBeInTheDocument()
  })

  describe("detecting the user's location", () => {
    it('prompts the user for geolocation permissions', () => {
      const mockGeoloc = mockGeolocation()
      render(<App />)
      expect(mockGeoloc.getCurrentPosition.mock.calls.length).toBe(1)
    })
  })

  it('loads an EventList', () => {
    const { getByTestId } = render(<App />)
    expect(getByTestId('eventList')).toBeInTheDocument()
  })

  it('loads an EventMap', () => {
    const { getByTestId } = render(<App />)
    expect(getByTestId('eventMap')).toBeInTheDocument()
  })
})

describe('when a zip code is geocoded', () => {
  it('fetches events in that zip code', () => {
    const mockGetEvents = jest.fn(_ => {
      return Promise.resolve(mockData)
    })
    axiosMock.get = mockGetEvents

    render(<App zip="11211" />)
    expect(mockGetEvents).toHaveBeenCalledTimes(1)
    expect(mockGetEvents).toHaveBeenCalledWith('https://api.mobilize.us/v1/events?zipcode=11211&')
  })
})

function mockGeolocation() {
  const mockLatLng = {
    lat: 40.71,
    lng: -73.96,
  }
  const mockGetCurrentPos = jest.fn(_ => mockLatLng)
  const mockGeolocation = {
    getCurrentPosition: mockGetCurrentPos,
  }
  global.navigator.geolocation = mockGeolocation

  return mockGeolocation
}
