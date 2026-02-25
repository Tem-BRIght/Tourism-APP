import { ref, get } from 'firebase/database';
import { db } from '../firebase';

/**
 * Fetch all destinations from Firebase
 */
export const fetchDestinations = async () => {
  try {
    const destinationsRef = ref(db, 'destinations');
    const snapshot = await get(destinationsRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error('Error fetching destinations:', error);
    throw error;
  }
};

/**
 * Fetch recommended destinations from Firebase
 */
export const fetchRecommendedDestinations = async () => {
  try {
    const recommendedRef = ref(db, 'destinations/recommended');
    const snapshot = await get(recommendedRef);
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Error fetching recommended:', error);
    throw error;
  }
};

/**
 * Fetch popular destinations from Firebase
 */
export const fetchPopularDestinations = async () => {
  try {
    const popularRef = ref(db, 'destinations/popular');
    const snapshot = await get(popularRef);
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Error fetching popular:', error);
    throw error;
  }
};
