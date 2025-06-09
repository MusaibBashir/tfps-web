import { format, parse, parseISO } from "date-fns"

const INDIA_TIMEZONE_OFFSET = 5.5 * 60 * 60 * 1000 // IST is UTC+5:30

// Simple IST conversion without external timezone library
const toIST = (date: Date): Date => {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000
  return new Date(utc + INDIA_TIMEZONE_OFFSET)
}

const fromIST = (date: Date): Date => {
  const utc = date.getTime() - INDIA_TIMEZONE_OFFSET
  return new Date(utc - new Date().getTimezoneOffset() * 60000)
}

// Format a date/time string to IST display
export const formatToIST = (dateString: string, formatString = "MMM d, yyyy HH:mm") => {
  try {
    const date = parseISO(dateString)
    const istDate = toIST(date)
    return format(istDate, formatString)
  } catch (error) {
    console.error("Error formatting date to IST:", error)
    return "Invalid date"
  }
}

// Format a date object to IST display
export const formatDateToIST = (date: Date, formatString = "MMM d, yyyy HH:mm") => {
  const istDate = toIST(date)
  return format(istDate, formatString)
}

// Convert local date/time inputs to UTC for storage
export const convertLocalToUTC = (dateStr: string, timeStr: string) => {
  try {
    // Create a date object from the local date/time inputs (treating as IST)
    const localDateTime = parse(`${dateStr} ${timeStr}`, "yyyy-MM-dd HH:mm", new Date())

    // Convert from IST to UTC for storage
    const utcDate = fromIST(localDateTime)

    return utcDate.toISOString()
  } catch (error) {
    console.error("Error converting local time to UTC:", error)
    return new Date().toISOString()
  }
}

// Convert UTC date to IST for form inputs
export const convertUTCToLocal = (isoString: string) => {
  try {
    const utcDate = parseISO(isoString)
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

// Get current IST time
export const getCurrentIST = () => {
  return toIST(new Date())
}

// Get current IST time as ISO string
export const getCurrentISTString = () => {
  return getCurrentIST().toISOString()
}

// Check if a date is today in IST
export const isToday = (dateString: string) => {
  try {
    const date = parseISO(dateString)
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
    const date = parseISO(dateString)
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
  const ist1 = toIST(date1)
  const ist2 = toIST(date2)
  return format(ist1, "yyyy-MM-dd") === format(ist2, "yyyy-MM-dd")
}
