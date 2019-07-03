import React from 'react'
import {
  render
} from '@testing-library/react'
import EventList from './index.js'

it('renders without crashing', () => {
  const { getByTestId } = render(<EventList />)
  expect(getByTestId('eventList')).toBeInTheDocument()
})

fdescribe('while loading event data', () => {
  it('displays a loading message to the user', () => {
    const { getByText } = render(<EventList loading={true} />)
    expect(getByText('... Loading events in your area ...')).toBeInTheDocument()
  })

  describe('when a custom loading message is provided', () => {
    it('displays the custom loading message', () => {
      const { getByText } = render(<EventList loading={true} customLoadingMsg="Loading!" />)
      expect(getByText('Loading!')).toBeInTheDocument()
    })
  })

  describe('when a server error is observed', () => {
    it('displays an informative message to the user', () => {
      const { getByText } = render(<EventList error={true} />)
      expect(getByText(/Whoops! We weren't able to load any event data/)).toBeInTheDocument()
    })
  })

  describe('when the request succeeds but no event data is found', () => {
    it('displays an informative message to the user', () => {
      const { getByText } = render(<EventList events={[]} />)
      expect(getByText(/Huh! We couldn't find any events in your area./)).toBeInTheDocument()
    })
  })
})



