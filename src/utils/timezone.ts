import { format, parse, parseISO } from "date-fns"

const INDIA_TIMEZONE_OFFSET = 5.5 * 60 * 60 * 1000 
const toIST = (date: Date): Date => {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000
  return new Date(utc + INDIA_TIMEZONE_OFFSET)
}

const fromIST = (date: Date): Date => {
  const utc = date.getTime() - INDIA_TIMEZONE_OFFSET
  return new Date(utc - new Date().getTimezoneOffset() * 60000)
}

// Format a date/time string to IST display
export const formatToIST = (dateString: string, formatString = "MMM d, yyyy h:mm a") => {
  try {
    if (!dateString) return "Invalid date"
    const date = parseISO(dateString)
    if (isNaN(date.getTime())) return "Invalid date"
    const istDate = toIST(date)
    return format(istDate, formatString)
  } catch (error) {
    console.error("Error formatting date to IST:", error)
    return "Invalid date"
  }
}

// Format a date object
export const formatDateToIST = (date: Date, formatString = "MMM d, yyyy h:mm a") => {
  try {
    if (!date || isNaN(date.getTime())) return "Invalid date"
    const istDate = toIST(date)
    return format(istDate, formatString)
  } catch (error) {
    console.error("Error formatting date to IST:", error)
    return "Invalid date"
  }
}

// Convert local date/time inputs to UTC for storage
export const convertLocalToUTC = (dateStr: string, timeStr: string) => {
  try {
    const localDateTime = parse(`${dateStr} ${timeStr}`, "yyyy-MM-dd HH:mm", new Date())

    const utcDate = fromIST(localDateTime)

    return utcDate.toISOString()
  } catch (error) {
    console.error("Error converting local time to UTC:", error)
    return new Date().toISOString()
  }
}

export const convertUTCToLocal = (isoString: string) => {
  try {
    if (!isoString) {
      const now = new Date()
      return {
        date: format(now, "yyyy-MM-dd"),
        time: format(now, "HH:mm"),
      }
    }
    const utcDate = parseISO(isoString)
    if (isNaN(utcDate.getTime())) {
      const now = new Date()
      return {
        date: format(now, "yyyy-MM-dd"),
        time: format(now, "HH:mm"),
      }
    }
    const istDate = toIST(utcDate)

    return {
      date: format(istDate, "yyyy-MM-dd"),
      time: format(istDate, "HH:mm"),
    }
  } catch (error) {
    console.error("Error converting UTC to local time:", error)
    const now = new Date()
    return {
      date: format(now, "yyyy-MM-dd"),
      time: format(now, "HH:mm"),
    }
  }
}

export const convertUTCToDateTimeLocal = (isoString: string) => {
  try {
    if (!isoString) {
      const now = new Date()
      return format(now, "yyyy-MM-dd'T'HH:mm")
    }
    const utcDate = parseISO(isoString)
    if (isNaN(utcDate.getTime())) {
      const now = new Date()
      return format(now, "yyyy-MM-dd'T'HH:mm")
    }
    const istDate = toIST(utcDate)
    return format(istDate, "yyyy-MM-dd'T'HH:mm")
  } catch (error) {
    console.error("Error converting UTC to datetime-local:", error)
    const now = new Date()
    return format(now, "yyyy-MM-dd'T'HH:mm")
  }
}

export const convertDateTimeLocalToUTC = (dateTimeLocal: string) => {
  try {
    if (!dateTimeLocal) return new Date().toISOString()

    const localDate = parse(dateTimeLocal, "yyyy-MM-dd'T'HH:mm", new Date())

    const utcDate = fromIST(localDate)

    return utcDate.toISOString()
  } catch (error) {
    console.error("Error converting datetime-local to UTC:", error)
    return new Date().toISOString()
  }
}

// Get current IST time
export const getCurrentIST = () => {
  return toIST(new Date())
}

// Get current IST time as ISO string
export const getCurrentISTString = () => {
  return getCurrentIST().toISOString()
}

export const isToday = (dateString: string) => {
  try {
    if (!dateString) return false
    const date = parseISO(dateString)
    if (isNaN(date.getTime())) return false
    const istDate = toIST(date)
    const today = getCurrentIST()

    return format(istDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")
  } catch (error) {
    return false
  }
}

// Format relative time in IST
export const formatRelativeTime = (dateString: string) => {
  try {
    if (!dateString) return "Unknown time"
    const date = parseISO(dateString)
    if (isNaN(date.getTime())) return "Unknown time"
    const istDate = toIST(date)
    const now = getCurrentIST()

    const diffInMinutes = Math.floor((now.getTime() - istDate.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hours ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} days ago`

    return formatToIST(dateString, "MMM d, yyyy")
  } catch (error) {
    return "Unknown time"
  }
}

// Check if two dates are the same day in IST
export const isSameDayIST = (date1: Date, date2: Date) => {
  try {
    if (!date1 || !date2 || isNaN(date1.getTime()) || isNaN(date2.getTime())) return false
    const ist1 = toIST(date1)
    const ist2 = toIST(date2)
    return format(ist1, "yyyy-MM-dd") === format(ist2, "yyyy-MM-dd")
  } catch (error) {
    return false
  }
}
