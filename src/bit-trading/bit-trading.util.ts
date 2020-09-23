export const A_HOUR = 3600000;

export const isExpired = (date: string) => {
  const now = new Date().getTime();
  const targetTime = new Date(date).getTime();
  return !(targetTime - now - A_HOUR > 0);
};
