export function normalizePortfolioHistory(data) {
  if (!data) return { dates: [], series: {} };

  return {
    dates: data.dates || [],
    series: data.series || {},
  };
}