export interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

export function getTimeLeft(target: number, now = Date.now()): TimeLeft {
  const diff = Math.max(0, target - now);
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds, done: diff <= 0 };
}

export function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function isGateOpen(opensAt: string, now = Date.now()): boolean {
  return now >= new Date(opensAt).getTime();
}
