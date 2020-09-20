import {MinimalWeek} from "./bigcalendar";

export const setZeroHours = (now: Date): Date => {
  now.setHours(0);
  now.setMinutes(0);
  now.setSeconds(0);
  return now;
};

export const cloneDateMonthFullYear = (date: number, now: Date): Date => {
  const ret = new Date();
  ret.setFullYear(now.getFullYear());
  ret.setMonth(now.getMonth());
  ret.setDate(date);
  return setZeroHours(ret);
};

export const getLastDayOfMonth = (now: Date): Date => {
  const firstDayOfNextMonth = cloneDateMonthFullYear(1, now);
  if (now.getMonth() + 1 > 11) {
    // next year month case
    firstDayOfNextMonth.setMonth(0);
    firstDayOfNextMonth.setFullYear(now.getFullYear() + 1);
  }
  const TWELVE_HOURS_MS = 1000 * 60 * 60 * 12;
  return setZeroHours(new Date(firstDayOfNextMonth.getTime() - TWELVE_HOURS_MS));
};

export const calculateWeeks = (now: Date): MinimalWeek[] => {
  const EMPTY_WEEK_VALUE = 99;
  const createEmptyWeek = (number: number): MinimalWeek => {
    return {
      number,
      month: now.getMonth(),
      days: []
    };
  };
  const firstDay = cloneDateMonthFullYear(1, now);
  const lastDayOfMonth = getLastDayOfMonth(firstDay);
  const weeks: MinimalWeek[] = [];
  let currentWeek: MinimalWeek = createEmptyWeek(0);
  for (let dateNumber = 0; dateNumber < lastDayOfMonth.getDate() - 1; dateNumber++) {
    const date = cloneDateMonthFullYear(dateNumber + 1, firstDay);
    const isLast: boolean = dateNumber === lastDayOfMonth.getDate() - 2;
    const dayOfWeek = date.getDay();
    const firstDayOfNextMonth = cloneDateMonthFullYear(1, date);
    if (firstDayOfNextMonth.getMonth() === 11) {
      firstDayOfNextMonth.setMonth(0);
      firstDayOfNextMonth.setFullYear(firstDayOfNextMonth.getFullYear() + 1);
    } else {
      firstDayOfNextMonth.setMonth(firstDayOfNextMonth.getMonth() + 1);
    }
    if (dateNumber === 0 && dayOfWeek !== 1) {
      // first day not monday so fill with inactive days from prev month
      const firstDayOfPrevMonth = cloneDateMonthFullYear(1, date);
      if (firstDayOfPrevMonth.getMonth() === 0) {
        firstDayOfPrevMonth.setMonth(11);
        firstDayOfPrevMonth.setFullYear(firstDayOfPrevMonth.getFullYear() - 1);
      } else {
        firstDayOfPrevMonth.setMonth(firstDayOfPrevMonth.getMonth() - 1);
      }
      const lastDayOfPrevMonth = getLastDayOfMonth(firstDayOfPrevMonth);
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
  return weeks;
};
