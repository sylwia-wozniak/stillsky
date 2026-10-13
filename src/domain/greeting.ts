export function greeting(name: string, hour: number): string {
  if (hour >= 5 && hour <= 11) return `Good morning, ${name}`;
  if (hour >= 12 && hour <= 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}
