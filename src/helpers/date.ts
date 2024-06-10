export const formatDuration = (seconds: number) => {
  let acc = seconds;
  const hours = Math.floor(acc / 3600);
  acc %= 3600;
  const minutes = Math.round(acc / 60);
  const elts = [];
  if (hours) {
    elts.push(`${hours}h`);
  }
  if (minutes) {
    elts.push(`${minutes} min`);
  }
  return elts.join(" ");
};
