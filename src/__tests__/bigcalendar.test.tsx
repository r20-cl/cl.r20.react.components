// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as React from "react";
import {render, RenderResult} from "@testing-library/react";
import {BigCalendar, BigCalendarProps} from "../bigcalendar";

const renderComponent = (props: BigCalendarProps): RenderResult => {
  return render(<BigCalendar {...props} />);
};

describe("<BigCalendar />", () => {
  test("S 2020 time happy path", async () => {
    const observer = new Date();
    observer.setFullYear(2020);
    observer.setMonth(8);
    observer.setDate(1);
    const component = renderComponent({
      observer
    });
    await component.findByTestId(`big-calendar-container`);
    await component.findByTestId(`big-calendar-container-week-0`);
    const firstDay = await component.findByTestId(`big-calendar-container-week-0-day-1`);
    expect(firstDay).toHaveClass("big-calendar-month-container-week-active-day");
    const lastDay = await component.findByTestId(`big-calendar-container-week-4-day-30`);
    expect(lastDay).toHaveClass("big-calendar-month-container-week-active-day");
    const lastInactiveDay = await component.findByTestId(`big-calendar-container-week-4-day-4`);
    expect(lastInactiveDay).toHaveClass("big-calendar-month-container-week-day");
  });
  test("F 2020 time happy path", async () => {
    const observer = new Date();
    observer.setFullYear(2020);
    observer.setMonth(1);
    observer.setDate(1);
    const component = renderComponent({
      observer
    });
    await component.findByTestId(`big-calendar-container`);
    await component.findByTestId(`big-calendar-container-week-0`);
    const firstDay = await component.findByTestId(`big-calendar-container-week-0-day-1`);
    expect(firstDay).toHaveClass("big-calendar-month-container-week-active-day");
    const lastDay = await component.findByTestId(`big-calendar-container-week-4-day-28`);
    expect(lastDay).toHaveClass("big-calendar-month-container-week-active-day");
    const lastInactiveDay = await component.findByTestId(`big-calendar-container-week-4-day-1`);
    expect(lastInactiveDay).toHaveClass("big-calendar-month-container-week-day");
  });
});
