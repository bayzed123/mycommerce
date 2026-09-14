import dayjs from 'dayjs'

import calendar from 'dayjs/plugin/calendar'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

export default defineNuxtPlugin(_nuxtApp => {
  dayjs.extend(calendar)
  dayjs.extend(duration)
  dayjs.extend(utc)
  dayjs.extend(timezone)
  dayjs.extend(relativeTime)

  return {
    provide: {
      dayjs,
      estimatedTimezone: dayjs.tz.guess()
    }
  }
})
