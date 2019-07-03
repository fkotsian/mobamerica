import React, {PureComponent} from 'react'
import dayjs from 'dayjs'
import './style.css'

const EventListItem = ({
  id,
  browserUrl,
  title,
  timeslots,
  sponsor,
  summary,
  location,
  imageUrl
}) => (
  <div
    className="eventListItem"
  >
    <div
      className="eventListItem__left"
    >
      <div
        className="eventListItem__left__title"
      >
        <a
          href={browserUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {title}
        </a>
      </div>
      <div
        className="eventListItem__left__times"
      >
        {
          timeslots && timeslots.length > 0
            ?
            timeslots
            .filter(t => !t.is_full)
            .slice(0,1)
            .map(t => (
              <span
                key={t.id}
              >
                {dayjs(t.start_date * 1000).format('M/DD/YY, h:mm a')} - {dayjs(t.end_date * 1000).format('h:mm a')}
              </span>
            ))
            :
            ''
        }
      </div>
      <p>
        {sponsor.name}
      </p>
      <p>
        { summary }
      </p>
      <p>
        {location && (location.locality || location.postal_code)}
      </p>
    </div>

    <div
      className="eventListItem__right"
    >
      {
        imageUrl
          ?
          <img
            onError={(e) => {e.target.width = 0; e.target.height = 0}}
            className="eventListItem__image"
            src={imageUrl}
          />
          :
          ''
      }
    </div>
  </div>
)

export default EventListItem
