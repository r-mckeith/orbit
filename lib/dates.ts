// lib/dates.ts
export const getTodayLocalDateString = () => {
  const d = new Date();
  // yyyy-MM-dd in local time (avoids UTC off-by-one)
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};