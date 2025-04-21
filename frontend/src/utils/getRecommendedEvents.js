export const getRecommendedEvents = (allEvents, user) => {
  if (!user || !allEvents || allEvents.length === 0) return [];

  const userInterests = user.interests || [];
  const userMajors = user.majors || [];

  const currentDate = new Date();

  const recommended = allEvents.filter(event => {
    // Ensure event has a startTime and it's in the future
    const eventStartTime = new Date(event.startTime);
    if (eventStartTime < currentDate) return false;

    // Check if event matches user interests or majors
    const hasMatchingCategory = event.categories &&
      event.categories.some(category =>
        userInterests.includes(category) || userMajors.includes(category)
      );

    return hasMatchingCategory;
  });

  // Fallback: if no matches, show all upcoming events
  return recommended.length > 0
    ? recommended
    : allEvents.filter(event => new Date(event.startTime) >= currentDate);
};