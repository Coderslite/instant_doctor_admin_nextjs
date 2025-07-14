import { Timestamp } from "firebase/firestore";

export const formatDate = (timestamp: Timestamp | null | undefined, locale: string = 'en-GB'): string => {
    // Validate input
    if (!timestamp || typeof timestamp.seconds !== 'number' || isNaN(timestamp.seconds)) {
        console.warn('Invalid timestamp provided:', timestamp);
        return 'Invalid Date';
    }

    // Convert Firebase Timestamp to Date (seconds * 1000 for milliseconds)
    const date = new Date(timestamp.seconds * 1000);
    const now = new Date();

    // Check if the date is valid
    if (isNaN(date.getTime())) {
        console.warn('Invalid Date object created from timestamp:', timestamp);
        return 'Invalid Date';
    }

    // Log time zone information for debugging
    console.debug('Timestamp Date:', date.toString(), 'Local Time Zone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
    console.debug('Current Date:', now.toString());

    // Define formatting options
    const dateOptions: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    };

    const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // 24-hour format; set to true for 12-hour (e.g., 1:58 PM)
    };

    // Normalize dates to ignore time for comparison (to handle WAT time zone)
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(nowOnly);
    yesterday.setDate(nowOnly.getDate() - 1);

    // Check if the date is today
    if (dateOnly.getTime() === nowOnly.getTime()) {
        return `Today, ${date.toLocaleTimeString(locale, timeOptions)}`;
    }

    // Check if the date is yesterday
    if (dateOnly.getTime() === yesterday.getTime()) {
        return `Yesterday, ${date.toLocaleTimeString(locale, timeOptions)}`;
    }

    // For other dates, return full date and time
    return `${date.toLocaleDateString(locale, dateOptions)}, ${date.toLocaleTimeString(locale, timeOptions)}`;
};