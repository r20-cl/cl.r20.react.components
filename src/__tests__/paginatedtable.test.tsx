// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as React from "react";
import {strictEqual} from "assert";
import {render, RenderResult} from "@testing-library/react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {PaginatedEndpointTable, PaginatedEndpointTableProps} from "../paginatedtable";
import express from "express";
import {fake} from "@miqro/core";

const renderComponent = (props: PaginatedEndpointTableProps): RenderResult => {
  return render(<PaginatedEndpointTable {...props} />);
};

describe("<PaginatedEndpointTable />", () => {
  let fakeServer = null;

  const fakeModel = fake((req, res) => {
    // req.query.pagination = JSON.parse(req.query.pagination);
    switch (fakeModel.callCount) {
      case 1:
        strictEqual(req.query.limit, "10");
        strictEqual(req.query.offset, "0");
        res.json({
          result: {
            rows: [
              {
                id: "bla",
                name: "ble"
              }
            ],
            count: 1000
          }
        });
        break;
      case 2:
        strictEqual(req.query.limit, "10");
        strictEqual(req.query.offset, "1");
        res.json({
          result: {
            rows: [
              {
                id: "bla",
                name: "ble"
              }
            ],
            count: 1000
          }
        });
        break;
    }
  });
  beforeAll(async () => {
    const app = express();
    app.get("/mymodel", fakeModel);
    fakeServer = app.listen(8080);
  });

  afterAll(async () => {
    fakeServer.close();
  });

  test("happy path with offset change from props rerender", async () => {
    const props = {
      endpoint: {
        endpoint: "http://localhost:8080/mymodel",
        headers: {}
      },
      search: {
        columns: ["id", "name"]
      },
      table: {
        offset: 0,
        limit: 10,
        columns: ["name"]
      },
      onPageData: fake(() => {
        // TODO asserts
      })
    };
    const {rerender} = renderComponent(props);
    await new Promise(resolve => {
      const interval = setInterval(() => {
        if (fakeModel.callCount === 1 && props.onPageData.callCount === 1) {
          clearInterval(interval);
          resolve();
        }
      }, 0);
    });
    const newProps = {
      endpoint: {
        endpoint: "http://localhost:8080/mymodel",
        headers: {}
      },
      search: {
        columns: ["id", "name"]
      },
      table: {
        offset: 1,
        limit: 10,
        columns: ["name"]
      },
      onPageData: fake(() => {
        // TODO asserts
      })
    };
    rerender(<PaginatedEndpointTable {...newProps} />)
    await new Promise(resolve => {
      const interval = setInterval(() => {
        if (fakeModel.callCount === 2 && newProps.onPageData.callCount === 1 && props.onPageData.callCount === 1) {
          clearInterval(interval);
          resolve();
        }
      }, 0);
    });
  }, 10000);
});
