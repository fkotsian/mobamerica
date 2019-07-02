import React, {PureComponent} from 'react'
import axios from 'axios'
import EventListItem from '../../components/EventListItem'

class EventList extends PureComponent {

  eventListAnchorRef = null

  componentDidUpdate(prevProps) {
    if (this.props.events !== prevProps.events) {
      this.scrollToTop()
    }
  }

  scrollToTop() {
    this.eventListAnchorRef.scrollIntoView({
      behavior: 'smooth',
    })
  }

  render() {
    return (
      <div
        className="eventList"
        ref={el => this.eventListRef = el}
      >
        <div
          ref={el => this.eventListAnchorRef = el}
        >
        </div>
        {
          this.props.events.map(e => (
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

export default EventList
