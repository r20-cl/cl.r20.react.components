import React from "react";
import {v4} from "uuid";
import {calculateWeeks} from "./bigcalendar-utils";

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
    this.updateBigCalendar = this.updateBigCalendar.bind(this);
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

  protected updateBigCalendar = (): void => {
    this.setState({
      weeks: calculateWeeks(this.props.observer)
    });
  }

  protected renderDay(day: MinimalDay): JSX.Element {
    return this.props.renderDay ? this.props.renderDay(day) : (
      <div
        data-testid={`big-calendar-container-week-${day.week}-day-${day.date}`}
        key={`${this.state.uuid}-week-${day.week}-day-${day.date}`}
        className={`${this.props.dayClassName ? this.props.dayClassName : DEFAULT_CLASSNAMES.dayClassName} ${day.active ? (this.props.activeDayClassName ? this.props.activeDayClassName : DEFAULT_CLASSNAMES.activeDayClassName) : ""}`}>
        <div
          data-testid={`big-calendar-container-week-${day.week}-day-${day.date}-date`}
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
            data-testid={`big-calendar-container-week-${index}`}
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
        data-testid={`big-calendar-container`}
        className={this.props.className ? this.props.className : DEFAULT_CLASSNAMES.className}>
        {this.renderWeeks(this.state.weeks)}
      </div>
    );
  }
}
