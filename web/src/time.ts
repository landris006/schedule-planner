export class Time {
  private _minutes: number;

  public get minutes(): number {
    return this._minutes;
  }

  private constructor(minutes: number) {
    this._minutes = minutes;
  }

  static fromHHMM(hhmm: string): Time {
    const [hour, minute] = hhmm.split(':');
    return new Time(parseInt(hour) * 60 + parseInt(minute));
  }

  static fromMinutes(minutes: number): Time {
    return new Time(Math.round(minutes));
  }

  static fromHours(hours: number): Time {
    return new Time(Math.round(hours * 60));
  }

  isBefore(time: Time): boolean {
    return this.minutes < time.minutes;
  }

  isAfter(time: Time): boolean {
    return this.minutes > time.minutes;
  }

  toHHMM(): string {
    const hour = Math.floor(this.minutes / 60);
    const minute = this.minutes % 60;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }

  add(time: Time): Time {
    return new Time(this.minutes + time.minutes);
  }

  subtract(time: Time): Time {
    return new Time(this.minutes - time.minutes);
  }
}
