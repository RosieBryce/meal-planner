export const CUISINE_COLORS = {
  Thai:          { colour: '#2d6a4f', bg: '#d8f3dc' },
  Indian:        { colour: '#c77dff', bg: '#f3e8ff' },
  Fish:          { colour: '#0077b6', bg: '#caf0f8' },
  Mediterranean: { colour: '#0077b6', bg: '#caf0f8' },
  Mexican:       { colour: '#e76f51', bg: '#fde8d8' },
  Veggie:        { colour: '#b5838d', bg: '#ffe8ec' },
  Italian:       { colour: '#b5838d', bg: '#ffe8ec' },
  Malaysian:     { colour: '#e9a84c', bg: '#fff3e0' },
  Asian:         { colour: '#e9a84c', bg: '#fff3e0' },
}

export function getCuisineStyle(cuisine) {
  return CUISINE_COLORS[cuisine] ?? { colour: '#6b7280', bg: '#f3f4f6' }
}
