// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { Component } from "react";
import { v4 } from "uuid";
import axios from "axios";
import { stringify } from "querystring";
import { ParseOptionsError, RequestResponse, SimpleMap } from "@miqro/core";

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
  onClickCheckBox?: (item: any[]) => void;
  renderCheckBox?: boolean;
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
    headers?: SimpleMap<string>;
    query?: SimpleMap<string>;
  };

}

export interface PaginatedEndpointTableState {
  rows: any[];
  renderedOffset?: number;
  pageCount: number;
  loading: boolean;
  selectedAll: boolean[];
  selectedItem: SimpleMap<any>;

}

export class PaginatedEndpointTable extends Component<PaginatedEndpointTableProps, PaginatedEndpointTableState> {
  private unMounted = false;

  constructor(props: PaginatedEndpointTableProps) {
    super(props);
    
    this.state = {
      rows: [],
      loading: true,
      renderedOffset: undefined,
      pageCount: 0,
      //selectedAllCheckbox: false,
      selectedItem: {},
      selectedAll: []

    };
    this.updatePage = this.updatePage.bind(this);
    this.onClickItem = this.onClickItem.bind(this);
    this.onClickAllItems = this.onClickAllItems.bind(this);
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

    let arrCheck: boolean[] = []
    for(let i=0; i<this.state.pageCount; i++){
      arrCheck[i] = false;
    }
    this.setState({selectedAll: arrCheck})
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


        const response = await axios.request(this.props.endpoint.headers ? {
          url: `${this.props.endpoint.endpoint}?${this.props.endpoint.query ? stringify({
            ...cleanQuery(this.props.endpoint.query),
            ...paginationQuery
          }) : stringify(paginationQuery)}`,
          headers: this.props.endpoint.headers,
          method: "GET"
        } : {
            url: `${this.props.endpoint.endpoint}?${this.props.endpoint.query ? stringify({
              ...cleanQuery(this.props.endpoint.query),
              ...paginationQuery
            }) : stringify(paginationQuery)}`,
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
                  this.props.onPageData(response as unknown as RequestResponse);
                  if (this.props.changeOnProgressbar)
                    this.props.changeOnProgressbar(false)
                 
                } catch (e) {
                  console.error(e);
                  if (this.props.changeOnProgressbar)
                    this.props.changeOnProgressbar(false)
                }
              }
            });
          }
        } else {
          if (this.props.changeOnProgressbar)
            this.props.changeOnProgressbar(false)
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
          this.props.changeOnProgressbar(false)
      });
      if (this.props.changeOnProgressbar)
        this.props.changeOnProgressbar(false)
    })
  }

  componentWillUnmount(): void {
    this.unMounted = true;
    if (this.props.onClickCheckBox !== undefined)
      this.props.onClickCheckBox([]);
  }

  protected onClickAllItems(): void {
    const sall: SimpleMap<any> = {};
    this.state.rows.forEach((e, i)=>{
      sall[i] = e
    })
    let items: any[] = [];
    this.setState({selectedItem: sall},() => {
      for (let e in sall) {
        items.push(sall[e]);
      }
      if(this.props.onClickCheckBox !== undefined)
        this.props.onClickCheckBox(items);
    })
    /*
    this.setState({ selectedItem: {} }, () => {
      this.state.rows.forEach(i => {
        this.onClickItem(i);
      })
    })
    */
  }

  protected onClickItem(item: any): void {
    const selectedItem = this.state.selectedItem//{...this.state.selectedItem};
    const id = item.id ? item.id : -1;
    let items: any[] = [];
    if (id !== -1) {
      if (selectedItem[id] !== undefined) {
        delete selectedItem[id];
      }
      else {
        selectedItem[id] = item;
      }
      this.setState({ selectedItem }, () => {
        for (let e in selectedItem) {
          items.push(selectedItem[e]);
        }
        if(this.props.onClickCheckBox !== undefined)
          this.props.onClickCheckBox(items);
      })
    }
  }

  protected renderCheckBox(isHeader: boolean, row: any): JSX.Element {

    if (isHeader) {
      return (
        <th key={v4()} 
        className={this.props.table.columnsClassname}>
        <input type="checkbox"
          key={v4()}
          checked={this.state.selectedAll[Math.ceil(this.props.table.offset/this.props.table.limit)]}
          onClick={(e) => {
            const select = {...this.state.selectedAll}
            const npage = Math.ceil(this.props.table.offset/this.props.table.limit)
            select[npage] = !select[npage]; 
            this.setState({ selectedAll: select },()=>{
            this.state.selectedAll[npage]?this.onClickAllItems():this.setState({selectedItem:{}}, ()=>this.props.onClickCheckBox([]))
          })}
          } />
      </th>
        /*
        <th key={v4()} 
          className={this.props.table.columnsClassname}>
          <input type="checkbox"
            key={v4()}
            checked={this.state.selectedAllCheckbox}
            onClick={(e) => this.setState({ selectedAllCheckbox: !this.state.selectedAllCheckbox },()=>{
              this.state.selectedAllCheckbox?this.onClickAllItems():this.setState({selectedItem:{}}, ()=>this.props.onClickCheckBox([]))
            })} />
        </th>
        */
      )
      
    }
    else {
      return (
        <td key={v4()} 
          className={this.props.table.rowsClassname}>
          <input key={v4()} type="checkbox" checked={this.state.selectedItem[row.id] !== undefined}
          onClick={(e) => this.onClickItem(row)} />
        </td>
      )
    }

  }

  protected renderColumns(columns: string[]): JSX.Element {

    let newColumns: string[]
    if (this.props.table.translateColumns !== undefined) {
      newColumns = columns.map((name, i) => {
        return this.props.table.translateColumns[i];
      })
    } else {
      newColumns = columns;
    }

    let newRowCol : JSX.Element = <tr key={v4()} className={this.props.table.columnsClassname}>
      {(this.props.renderCheckBox !== undefined && this.props.renderCheckBox === true) && this.renderCheckBox(true, undefined)}
      {this.props.renderColumns ? this.props.renderColumns(newColumns) : (
      
        columns.map((name, i) => <th key={v4()} className={this.props.table.columnsClassname}>{newColumns[i]}</th>)
      
    )}
    </tr>;

    return newRowCol;
    /*
    return this.props.renderColumns ? this.props.renderColumns(newColumns) : (
      <tr key={v4()} className={this.props.table.columnsClassname}>
        {(this.props.renderCheckBox !== undefined && this.props.renderCheckBox===true) && this.renderCheckBox(true, undefined)}
        {columns.map((name, i) => <th key={v4()} className={this.props.table.columnsClassname}>{newColumns[i]}</th>)}
      </tr>
    )
    */
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  protected renderRow(columns: string[], row: any): JSX.Element {

    let newRow: JSX.Element = 
    <tr key={v4()}
      className={this.props.table.rowsTRClassname}>
      
      {(this.props.renderCheckBox !== undefined && this.props.renderCheckBox === true) && this.renderCheckBox(false, row)}
      {this.props.renderRow ? this.props.renderRow(columns, row) : (
       
        columns.map(columnName => <td
          key={v4()}
          className={this.props.table.rowsClassname}>
          {`${row[columnName]}`}
        </td>)
        
      
      )}
    </tr>
    return newRow;
    /*
    return this.props.renderRow ? this.props.renderRow(columns, row) : (
      <tr
        key={v4()}
        className={this.props.table.rowsTRClassname}>
        {(this.props.renderCheckBox !== undefined && this.props.renderCheckBox === true) && this.renderCheckBox(false, row) }
        {columns.map(columnName => <td
          key={v4()}
          className={this.props.table.rowsClassname}>
          {`${row[columnName]}`}
        </td>)
        }
      </tr>
    )
    */
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
