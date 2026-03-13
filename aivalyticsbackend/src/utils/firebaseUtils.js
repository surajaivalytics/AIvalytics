/**
 * Firebase Utility Functions
 */

/**
 * Safely converts a Firestore Timestamp to a JavaScript Date object.
 * If the value is already a Date, returns it.
 * If the value is a string or number, attempts to create a Date from it.
 * Returns null if conversion fails or value is missing.
 * 
 * @param {any} timestamp - The value to convert
 * @returns {Date|null}
 */
const formatFirestoreTimestamp = (timestamp) => {
  if (!timestamp) return null;

  // Handle Firestore Timestamp object (has .toDate() method)
  if (typeof timestamp.toDate === 'function') {
    try {
      return timestamp.toDate();
    } catch (error) {
      console.error('Error converting Firestore Timestamp:', error);
      return null;
    }
  }

  // Handle JavaScript Date object
  if (timestamp instanceof Date) {
    return timestamp;
  }

  // Handle string or number representing a date
  const date = new Date(timestamp);
  return isNaN(date.getTime()) ? null : date;
};

module.exports = {
  formatFirestoreTimestamp
};
