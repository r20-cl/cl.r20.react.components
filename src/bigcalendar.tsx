import React from "react";
import {v4} from "uuid";

export interface BigCalendarProps {
  observer: Date;
  className?: string;
  weekClassName?: string;
  dayClassName?: string;
  activeDayClassName?: string;
  dayDateClassName?: string;
  renderWeeks?: (weeks: MinimalWeek[]) => JSX.Element;
  renderWeekDays?: (week: MinimalWeek) => JSX.Element;
  renderDay?: (day: MinimalDay) => JSX.Element;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface BigCalendarState {
  weeks: MinimalWeek[];
  uuid: string;
}

export interface MinimalWeek {
  days: MinimalDay[]
  month: number;
  number: number;
}

export interface MinimalDay {
  date: number;
  week: number;
  month: number;
  active: boolean;
}

const DEFAULT_CLASSNAMES = {
  className: "big-calendar-month-container",
  weekClassName: "big-calendar-month-container-week",
  dayClassName: "big-calendar-month-container-week-day",
  activeDayClassName: "big-calendar-month-container-week-active-day",
  dayDateClassName: "big-calendar-month-container-week-day-date",
}

export class BigCalendar extends React.Component<BigCalendarProps, BigCalendarState> {

  constructor(props: BigCalendarProps) {
    super(props);
    this.state = {
      weeks: [],
      uuid: v4()
    }
  }


  public componentDidMount(): void {
    return this.updateBigCalendar();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public componentDidUpdate(prevProps: Readonly<BigCalendarProps>, prevState: Readonly<BigCalendarState>, snapshot?: any): void {
    // only if observer change you need to re-render
    if (prevProps.observer !== this.props.observer) {
      return this.updateBigCalendar();
    }
  }

  protected setZeroHours(now: Date): Date {
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    return now;
  }

  protected cloneDateMonthFullYear(date: number, now: Date): Date {
    const ret = new Date();
    ret.setFullYear(now.getFullYear());
    ret.setMonth(now.getMonth());
    ret.setDate(date);
    return this.setZeroHours(ret);
  }

  protected getLastDayOfMonth(now: Date): Date {
    const firstDayOfNextMonth = this.cloneDateMonthFullYear(1, now);
    if (now.getMonth() + 1 > 11) {
      // next year month case
      firstDayOfNextMonth.setMonth(0);
      firstDayOfNextMonth.setFullYear(now.getFullYear() + 1);
    }
    const TWELVE_HOURS_MS = 1000 * 60 * 60 * 12;
    return this.setZeroHours(new Date(firstDayOfNextMonth.getTime() - TWELVE_HOURS_MS));
  }

  protected updateBigCalendar(): void {
    const now = this.props.observer;
    const EMPTY_WEEK_VALUE = 99;
    const createEmptyWeek = (number: number): MinimalWeek => {
      return {
        number,
        month: now.getMonth(),
        days: []
      };
    };
    const firstDay = this.cloneDateMonthFullYear(1, now);
    const lastDayOfMonth = this.getLastDayOfMonth(firstDay);
    const weeks: MinimalWeek[] = [];
    let currentWeek: MinimalWeek = createEmptyWeek(0);
    for (let dateNumber = 0; dateNumber < lastDayOfMonth.getDate() - 1; dateNumber++) {
      const date = this.cloneDateMonthFullYear(dateNumber + 1, firstDay);
      const isLast: boolean = dateNumber === lastDayOfMonth.getDate() - 2;
      const dayOfWeek = date.getDay();
      const firstDayOfNextMonth = this.cloneDateMonthFullYear(1, date);
      if (firstDayOfNextMonth.getMonth() === 11) {
        firstDayOfNextMonth.setMonth(0);
        firstDayOfNextMonth.setFullYear(firstDayOfNextMonth.getFullYear() + 1);
      } else {
        firstDayOfNextMonth.setMonth(firstDayOfNextMonth.getMonth() + 1);
      }
      if (dateNumber === 0 && dayOfWeek !== 1) {
        // first day not monday so fill with inactive days from prev month
        const firstDayOfPrevMonth = this.cloneDateMonthFullYear(1, date);
        if (firstDayOfPrevMonth.getMonth() === 0) {
          firstDayOfPrevMonth.setMonth(11);
          firstDayOfPrevMonth.setFullYear(firstDayOfPrevMonth.getFullYear() - 1);
        } else {
          firstDayOfPrevMonth.setMonth(firstDayOfPrevMonth.getMonth() - 1);
        }
        const lastDayOfPrevMonth = this.getLastDayOfMonth(firstDayOfPrevMonth);
        if (dayOfWeek === 0) {
          // first day is sunday so fill entire week
          [
            lastDayOfPrevMonth.getDate() - 5,
            lastDayOfPrevMonth.getDate() - 4,
            lastDayOfPrevMonth.getDate() - 3,
            lastDayOfPrevMonth.getDate() - 2,
            lastDayOfPrevMonth.getDate() - 1,
            lastDayOfPrevMonth.getDate()
          ].forEach(date => currentWeek.days.push({
            active: false,
            month: now.getMonth(),
            week: currentWeek.number,
            date
          }));
        } else {
          for (let i = dayOfWeek - 2; i >= 0; i--) {
            currentWeek.days.push({
              active: false,
              month: now.getMonth(),
              week: currentWeek.number,
              date: lastDayOfPrevMonth.getDate() - i
            })
          }
        }
      }

      currentWeek.days.push({
        active: true,
        month: now.getMonth(),
        week: currentWeek.number,
        date: date.getDate()
      });

      if (dayOfWeek === 0) {
        // sunday so last day of the week
        weeks.push(currentWeek);
        currentWeek = createEmptyWeek(currentWeek.number + 1);
      } else if (isLast) {
        // fill with inactive days from next month
        for (let i = 0; i + dayOfWeek <= 6; i++) {
          currentWeek.days.push({
            active: false,
            month: firstDayOfNextMonth.getMonth(),
            week: currentWeek.number,
            date: firstDayOfNextMonth.getDate() + i
          })
        }
        weeks.push(currentWeek);
      }
    }
    this.setState({
      weeks
    });
  }

  protected renderDay(day: MinimalDay): JSX.Element {
    return this.props.renderDay ? this.props.renderDay(day) : (
      <div
        data-testId={`big-calendar-container-week-${day.week}-day-${day.date}`}
        key={`${this.state.uuid}-week-${day.week}-day-${day.date}`}
        className={`${this.props.dayClassName ? this.props.dayClassName : DEFAULT_CLASSNAMES.dayClassName} ${day.active ? (this.props.activeDayClassName ? this.props.activeDayClassName : DEFAULT_CLASSNAMES.activeDayClassName) : ""}`}>
        <div
          data-testId={`big-calendar-container-week-${day.week}-day-${day.date}-date`}
          key={`${this.state.uuid}-week-${day.week}-day-${day.date}-date`}
          className={`${this.props.dayDateClassName ? this.props.dayDateClassName : DEFAULT_CLASSNAMES.dayDateClassName}`}>{day.date}</div>
      </div>
    )
  }

  protected renderWeekDays(week: MinimalWeek): JSX.Element {
    const days: MinimalDay[] = week.days;
    return this.props.renderWeekDays ? this.props.renderWeekDays(week) : (
      <>
        {days.map(day => this.renderDay(day))}
      </>
    )
  }

  protected renderWeeks(weeks: MinimalWeek[]): JSX.Element {
    return this.props.renderWeeks ? this.props.renderWeeks(weeks) : (
      <>
        {weeks.map((week, index) =>
          <div
            data-testId={`big-calendar-container-week-${index}`}
            key={`${this.state.uuid}-week-${index}`}
            className={this.props.weekClassName ? this.props.weekClassName : DEFAULT_CLASSNAMES.weekClassName}>
            {this.renderWeekDays(week)}
          </div>)}
      </>
    )
  }

  public render(): JSX.Element {
    return (
      <div
        data-testId={`big-calendar-container`}
        className={this.props.className ? this.props.className : DEFAULT_CLASSNAMES.className}>
        {this.renderWeeks(this.state.weeks)}
      </div>
    );
  }
}
