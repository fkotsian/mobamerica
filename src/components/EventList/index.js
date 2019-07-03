import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import EventListItem from '../../components/EventListItem'
import './style.css'

class EventList extends PureComponent {

  static DEFAULT_LOADING_MSG = '... Loading events in your area ...'

  eventListAnchorRef = null

  componentDidUpdate(prevProps) {
    if (this.props.events !== prevProps.events) {
      this.scrollToTop()
    }
  }

  scrollToTop() {
    this.eventListAnchorRef &&
      this.eventListAnchorRef.scrollIntoView &&
      typeof this.eventListAnchorRef.scrollIntoView === 'function' &&
      this.eventListAnchorRef.scrollIntoView({
        behavior: 'smooth',
      })
  }

  render() {
    return (
      <div
        className="eventList"
        data-testid="eventList"
      >
        <div
          ref={el => this.eventListAnchorRef = el}
        >
        </div>
        {
          // server error message
          this.props.error
            ?
              <span
                className="eventList__loading"
              >
                Whoops! We weren't able to load any event data. But don't worry - it's there! Please try again in just one second...
              </span>
            :
              ''
        }
        {
          // loading message
          this.props.loading && !this.props.error
            ?
              <span
                className="eventList__loading"
              >
                {
                  this.props.customLoadingMsg || EventList.DEFAULT_LOADING_MSG
                }
              </span>
            :
              ''
        }
        {
          // no events found message
          !this.props.loading && !this.props.error && this.props.events.length === 0
            ?
              <span
                className="eventList__loading"
              >
                Huh! We couldn't find any events in your area. Want to reload and try enabling geolocation?
              </span>
            :
              ''
        }
        {
          // display events
          this.props.events.length > 0 && this.props.events.map(e => (
            <EventListItem
              key={e.id}
              id={e.id}
              browserUrl={e.browser_url}
              title={e.title}
              timeslots={e.timeslots}
              sponsor={e.sponsor}
              summary={e.summary}
              location={e.location}
              imageUrl={e.featured_image_url}
            />
          ))
        }
      </div>
    )
  }
}

EventList.defaultProps = {
  events: [],
}

EventList.propTypes = {
  events: PropTypes.array,
  loading: PropTypes.bool,
  customLoadingMsg: PropTypes.string,
  error: PropTypes.bool,
}

export default EventList
