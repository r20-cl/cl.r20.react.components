// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, {Component} from "react";
import {v4} from "uuid";
import {ParseOptionsError, request, RequestResponse, SimpleMap} from "@miqro/core";

export interface PaginatedEndpointTableProps {
  table: {
    bodyClassname?: string;
    headClassname?: string;
    offset: number;
    limit: number;
    className?: string;
    columnsClassname?: string;
    columnsTRClassname?: string;
    columns: string[];
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
  };
}

export interface PaginatedEndpointTableState {
  rows: any[];
  renderedOffset?: number;
  pageCount: number;
}

export class PaginatedEndpointTable<T extends PaginatedEndpointTableProps = PaginatedEndpointTableProps> extends Component<T, PaginatedEndpointTableState> {
  private unMounted = false;

  constructor(props: T) {
    super(props);
    this.state = {
      rows: [],
      renderedOffset: undefined,
      pageCount: 0
    };
    this.updatePage = this.updatePage.bind(this);
  }

  componentDidUpdate(prevProps: PaginatedEndpointTableProps): void {
    if (prevProps.table.offset !== this.props.table.offset) {
      this.updatePage();
    }
  }

  componentDidMount(): void {
    this.updatePage();
  }

  protected updatePage(): void {
    (async () => {
      const response = await request({
        url: `${this.props.endpoint.endpoint}?pagination=${JSON.stringify(this.props.search.searchQuery !== "" ? {
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
            renderedOffset: this.props.table.offset,
            pageCount: Math.ceil(result.count / this.props.table.limit)
          }, () => {
            if (this.props.onPageData) {
              try {
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
    });
  }

  componentWillUnmount(): void {
    this.unMounted = true;
  }

  protected renderColumns(columns: string[]): JSX.Element {
    return (
      <tr key={v4()} className={this.props.table.columnsClassname}>
        {columns.map(name => <th key={v4()} className={this.props.table.columnsClassname}>{name}</th>)}
      </tr>
    )
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  protected renderRow(columns: string[], row: any): JSX.Element {
    return (
      <tr
        key={v4()}
        className={this.props.table.rowsTRClassname}>
        {columns.map(columnName => <td
          key={v4()}
          className={this.props.table.rowsClassname}>{`${row[columnName]}`}</td>)}
      </tr>
    )
  }

  public render(): JSX.Element {
    return (
      <table className={this.props.table.className}>
        <thead className={this.props.table.headClassname}>
        {this.renderColumns(this.props.table.columns)}
        </thead>
        <tbody className={this.props.table.bodyClassname}>
        {this.state.rows.map(val => this.renderRow(this.props.table.columns, val))}
        </tbody>
      </table>
    );
  }
}
