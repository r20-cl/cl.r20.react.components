// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { Component } from "react";
import { v4 } from "uuid";
import { ParseOptionsError, request, RequestResponse, SimpleMap } from "@miqro/core";
import querystring from "querystring";

const cleanQuery = (query: SimpleMap<string | undefined>): SimpleMap<string> => {
  const keys = Object.keys(query);
  const ret = {
    ...query
  };
  for (const k of keys) {
    if (query[k] === undefined) {
      delete ret[k];
    }
  }
  return ret;
}

export interface PaginatedEndpointTableProps {
  renderColumns?: (columns: string[]) => JSX.Element;
  renderRow?: (columns: string[], row: any) => JSX.Element;
  changeOnProgressbar?: (status: boolean) => void;
  table: {
    bodyClassname?: string;
    headClassname?: string;
    offset: number;
    limit: number;
    className?: string;
    columnsClassname?: string;
    columnsTRClassname?: string;
    columns: string[];
    translateColumns?: string[];
    rowsClassname?: string;
    rowsTRClassname?: string;
  },
  onError?: (e: Error) => void;
  onPageData?: (response: RequestResponse) => void;
  search: {
    searchQuery?: string,
    placeHolder?: string;
    columns: string[];
  },
  endpoint: {
    endpoint: string;
    headers: SimpleMap<string>;
    query?: SimpleMap<string>;
  };

}

export interface PaginatedEndpointTableState {
  rows: any[];
  renderedOffset?: number;
  pageCount: number;
  loading: boolean;
}

export class PaginatedEndpointTable<T extends Partial<PaginatedEndpointTableProps> = PaginatedEndpointTableProps> extends Component<T, PaginatedEndpointTableState> {
  private unMounted = false;

  constructor(props: T) {
    super(props);
    this.state = {
      rows: [],
      loading: true,
      renderedOffset: undefined,
      pageCount: 0
    };
    this.updatePage = this.updatePage.bind(this);
  }

  componentDidUpdate(prevProps: Partial<PaginatedEndpointTableProps>, prevState: Partial<PaginatedEndpointTableState>): void {
    if (prevProps.table.offset !== this.props.table.offset || prevProps.search.searchQuery !== this.props.search.searchQuery) {
      this.updatePage();
    }
    /*
    if(this.state.loading !== prevState.loading){
      this.props.changeOnProgressbar(this.state.loading)
    }
    */
  }

  componentDidMount(): void {
    this.updatePage();
    //this.props.changeOnProgressbar(this.state.loading)
  }

  protected updatePage(): void {
    this.setState({
      loading: true
    }, () => {
      (async () => {

        if (this.props.changeOnProgressbar)
          this.props.changeOnProgressbar(this.state.loading)

        const paginationQuery = {
          q: this.props.search.searchQuery,
          columns: this.props.search.columns,
          limit: this.props.table.limit,
          offset: this.props.table.offset
        };


        const response = await request({
          url: `${this.props.endpoint.endpoint}?${this.props.endpoint.query ? `${querystring.stringify(cleanQuery(this.props.endpoint.query))}&` : ""}pagination=${JSON.stringify(this.props.search.searchQuery !== "" ? {
            limit: this.props.table.limit,
            offset: this.props.table.offset,
            search: {
              columns: this.props.search.columns,
              query: this.props.search.searchQuery
            }
          } : {
              limit: this.props.table.limit,
              offset: this.props.table.offset
            })}`,
          headers: this.props.endpoint.headers,
          method: "GET"
        });

        const result = response.data.result && response.data.result.rows ? response.data.result : response.data;
        if (result && result.rows instanceof Array && result.count !== undefined) {
          if (!this.unMounted) {
            this.setState({
              rows: result.rows,
              loading: false,
              renderedOffset: this.props.table.offset,
              pageCount: Math.ceil(result.count / this.props.table.limit)
            }, () => {
              if (this.props.onPageData) {
                try {
                  if (this.props.changeOnProgressbar)
                    this.props.changeOnProgressbar(this.state.loading)
                  this.props.onPageData(response);
                } catch (e) {
                  console.error(e);
                }
              }
            });
          }
        } else {
          throw new ParseOptionsError("invalid endpoint data");
        }
      })().catch((e) => {
        console.error(e);
        if (this.props.onError) {
          try {
            this.props.onError(e);
          } catch (e) {
            console.error(e);
          }
        }
        if (this.props.changeOnProgressbar)
          this.props.changeOnProgressbar(this.state.loading)
      });
    })
  }

  componentWillUnmount(): void {
    this.unMounted = true;
  }

  protected renderColumns(columns: string[]): JSX.Element {

    let newColumns: string[]
    if (this.props.table.translateColumns !== undefined) {
      newColumns = columns.map((name, i) => {
        return this.props.table.translateColumns[i];
      })
    }
    else {
      newColumns = columns;
    }

    return this.props.renderColumns ? this.props.renderColumns(newColumns) : (
      <tr key={v4()} className={this.props.table.columnsClassname}>
        {columns.map((name, i) => <th key={v4()} className={this.props.table.columnsClassname}>{newColumns[i]}</th>)}
      </tr>
    )
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  protected renderRow(columns: string[], row: any): JSX.Element {
    return this.props.renderRow ? this.props.renderRow(columns, row) : (
      <tr
        key={v4()}
        className={this.props.table.rowsTRClassname}>
        {columns.map(columnName => <td
          key={v4()}
          className={this.props.table.rowsClassname}>{`${row[columnName]}`}</td>)}
      </tr>
    )
  }

  /*
  protected renderLoading(): JSX.Element {
    return this.props.renderLoading ? this.props.renderLoading() : (
      <p>loading...</p>
    )
  }
  */

  public render(): JSX.Element {
    // this.state.loading?this.props.changeOnProgressbar("start"):this.props.changeOnProgressbar("stop");
    return (
      <>
        {
          !this.state.loading &&
          <table className={this.props.table.className}>
            <thead className={this.props.table.headClassname}>
              {this.renderColumns(this.props.table.columns)}
            </thead>
            <tbody className={this.props.table.bodyClassname}>
              {this.state.rows.map(val => this.renderRow(this.props.table.columns, val))}
            </tbody>
          </table>
        }
        {/*
          this.state.loading &&
          this.renderLoading()
        */}
      </>
    );
  }
}
