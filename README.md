## MOBILIZE AMERICA

Exercise: Display Mobilize.Us events in list and map form

### Running the App

- Start dev server: `yarn start`
- Run tests via Jest: `yarn test`

### Features

- detects user's lat/lng (or defaults to USA if user denies access)
- geocodes ZIP from user's lat/lng and loads events in user's area
- populates markers on map for each currently loaded event
- redraws markers with new events and recenters map with new lat/lng
- paginated event navigation

- display loading messages during load
- display error messages on server error
- allow for custom loading and error messages

- content is displayed on a single page in visually appealing, scrollable format
- event: display event title, description, organizer, date, and start time

### Extensions

- would like to wrap EventList and EventMap in an EventContainer and move all event fetching to there from App
- started ZIP functionality, would like to provide an opt-out (view global events)
- would like to polish CSS with some more color, gradients, numbering, and better image placement

- for fun: click on an event box to zoom to the event's location :)
