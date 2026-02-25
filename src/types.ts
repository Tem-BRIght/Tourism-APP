export interface Name {
  firstname: string;
  surname: string;
  suffix?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  name?: Name;
  nickname?: string;
  img?: string;
  dateOfBirth?: Date;
  nationality?: string;
  // any other fields from Firestore
}

export interface Destination {
  id: string;
  title: string;
  image: string;
  desc?: string;
  rating: number;
  reviews: number;
  distance: string;
  location?: string;
  address?: string;
  ranking?: string;
  hours?: string;
  entrance?: string;
  goodFor?: string;
  parking?: string;
  lastUpdated?: string;
  about?: string;
  history?: string;
  features?: string;
  massSchedule?: string;
  attractions?: string;
  operatingHours?: string;
  packages?: string;
  safety?: string;
  foodCategories?: string;
  mustTryDishes?: string;
  bestTimes?: string;
  parkingInfo?: string;
  walkingTour?: string;
  specialEvents?: string;
  exhibitHalls?: string;
  specialExhibits?: string;
  guidedTours?: string;
  collections?: string;
  researchFacilities?: string;
  visitorServices?: string;
  rules?: string;
  specialPrograms?: string;
  visitorTips?: string;
  nearbyAttractions?: string;
  reviewsSummary?: string;
  ecoFeatures?: string;
}