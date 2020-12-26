// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { Component } from "react";
import { v4 } from "uuid";
import axios from "axios";
import { stringify } from "querystring";
import { ParseOptionsError, RequestResponse, SimpleMap } from "@miqro/core";
import { inspect } from "util";

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

export interface Item{
  id: string;
  data: any;
  selected: boolean;
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
  //selectedAll: boolean[];
  //selectedItem: SimpleMap<any>;
  selectedItemByPage: SimpleMap<Item[]>;
  npage: number;
  //items: Item[];

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
      //selectedItem: {},
      //selectedAll: [],
      selectedItemByPage: {},
      npage: 0,
      //items: []

    };
    this.updatePage = this.updatePage.bind(this);
    this.onClickItem = this.onClickItem.bind(this);
    //this.onClickAllItems = this.onClickAllItems.bind(this);
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
    /*
    let arrCheck: boolean[] = []
    for(let i=0; i<this.state.pageCount; i++){
      arrCheck[i] = false;
    }
    this.setState({selectedAll: arrCheck})
    */
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
            const items: Item[] = [];
            result.rows.forEach(row => {
              let item: Item = {
                id: v4(),
                data: row,
                selected: false
              }
              items.push(item)
            });

            const selectedItemByPage: SimpleMap<Item[]> = {};
            selectedItemByPage[Math.ceil(this.props.table.offset/this.props.table.limit)] = items;

            this.setState({
              rows: result.rows,
              loading: false,
              renderedOffset: this.props.table.offset,
              pageCount: Math.ceil(result.count / this.props.table.limit),
              npage: Math.ceil(this.props.table.offset/this.props.table.limit),
              selectedItemByPage: selectedItemByPage
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

  protected selectedAllItemsPage(): void{
    //Seleccionar todos los items de la pagina y marcar como true el array selectedAll

    const sitembpage: SimpleMap<Item[]> = {...this.state.selectedItemByPage};
    const items: Item[] = sitembpage[this.state.npage];
    items.forEach(e=>{
      e.selected = true
    })
    sitembpage[this.state.npage] = items;
    this.setState({selectedItemByPage: sitembpage}, ()=>{
        const items: Item[] = [];
        for(let key in this.state.selectedItemByPage){
          this.state.selectedItemByPage[key].forEach(item=>{
            if(item.selected)
              items.push(item);
          })
        }
        if(this.props.onClickCheckBox)
          this.props.onClickCheckBox(items);
      
    })

    /*
    const sitemppage: SimpleMap<Item[]> = {...this.state.selectedItemPerPage};
    const selectcheckhead = [...this.state.selectedAll];
    sitemppage[this.state.npage] = [...this.state.rows];
    selectcheckhead[this.state.npage] = true;
    this.setState({selectedItemPerPage: sitemppage, selectedAll: selectcheckhead}, ()=>{
      let result: any[] = [];
      for(let items in this.state.selectedItemPerPage){
        for(let item in this.state.selectedItemPerPage[items]){
          result.push(item);
        }
      }
      if(this.props.onClickCheckBox)
      this.props.onClickCheckBox(result);
    })
    */
  }

  protected deselectedAllItemsPage(): void{
    //Deseleccionar todos los items de la pagina y marcar como false el array selectedAll

    const sitembpage: SimpleMap<Item[]> = {...this.state.selectedItemByPage};
    const items: Item[] = sitembpage[this.state.npage];
    items.forEach(e=>{
      e.selected = false
    })
    sitembpage[this.state.npage] = items;
    this.setState({selectedItemByPage: sitembpage}, ()=>{
      const items: Item[] = [];
        for(let key in this.state.selectedItemByPage){
          this.state.selectedItemByPage[key].forEach(item=>{
            if(item.selected)
              items.push(item);
          })
        }
        if(this.props.onClickCheckBox)
          this.props.onClickCheckBox(items);
    })

    /*
    const sitemppage: SimpleMap<any[]> = {...this.state.selectedItemPerPage};
    sitemppage[this.state.npage] = [];
    const selectcheckhead = [...this.state.selectedAll];
    selectcheckhead[this.state.npage] = false;
    this.setState({selectedItemPerPage: sitemppage, selectedAll: selectcheckhead}, ()=>{
      let result: any[] = [];
      for(let items in this.state.selectedItemPerPage){
        for(let item in this.state.selectedItemPerPage[items]){
          result.push(item);
        }
      }
      if(this.props.onClickCheckBox)
      this.props.onClickCheckBox(result);
    })
    */
  }

  /*
  protected onClickAllItems(): void {
    const sall: SimpleMap<any> = {};
    this.state.rows.forEach((e)=>{
      sall[e.id] = e
    })
    let items: any[] = [];
    for (let e in this.state.selectedItem) {
      items.push(this.state.selectedItem[e]);
    }
    this.setState({selectedItem: sall},() => {
      for (let e in sall) {
        items.push(sall[e]);
      }
      if(this.props.onClickCheckBox !== undefined)
        this.props.onClickCheckBox(items);
    })
   
  }
*/
  protected onClickItem(item: Item): void {

    const mitem = {...item};
    console.log("paginatedtable mitem: "+inspect(mitem));
    mitem.selected = !item.selected;
    const sitembpage: SimpleMap<Item[]> = {...this.state.selectedItemByPage};
    const items: Item[] = [...this.state.selectedItemByPage[this.state.npage]];
    const index = items.findIndex(i=>i.id===item.id)
    items[index] = mitem;
    sitembpage[this.state.npage] = items;
    this.setState({selectedItemByPage: sitembpage}, ()=>{
      const items: Item[] = [];
      for(let key in this.state.selectedItemByPage){
        this.state.selectedItemByPage[key].forEach(item=>{
          if(item.selected)
            items.push(item);
        })
      }
      console.log("paginatedtable items: "+inspect(items));
      if(this.props.onClickCheckBox)
        this.props.onClickCheckBox(items);
    })

    /*
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
    */
  }

  protected isCheckedAllItems(): boolean{
    let ret: boolean = true;
    const items = this.state.selectedItemByPage[this.state.npage];
    for(let i=0; i<items.length;i++){
      if(items[i].selected === false){
        ret = false;
        break;
      }
    }

    return ret;
  }

  protected renderCheckBox(isHeader: boolean, item: Item): JSX.Element {

    if (isHeader) {
      return (
        <th key={v4()} 
        className={this.props.table.columnsClassname}>
        <input type="checkbox"
          key={v4()}
          checked={this.isCheckedAllItems()}
          onClick={(e) => {
            this.selectedAllItemsPage();
            //e.target.checked?this.deselectedAllItemsPage:this.selectedAllItemsPage;
            //this.state.selectedAll[this.state.npage]?this.deselectedAllItemsPage:this.selectedAllItemsPage();
            /*
            const select = this.state.selectedAll
            const npage = Math.ceil(this.props.table.offset/this.props.table.limit)
            select[npage] = !select[npage]; 
            this.setState({ selectedAll: select },()=>{
            this.state.selectedAll[npage]?this.onClickAllItems():this.setState({selectedItem:{}}, ()=>this.props.onClickCheckBox([]))
            */
            }
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
          <input key={v4()} type="checkbox" checked={this.state.selectedItemByPage[this.state.npage].find(it=>it.id===item.id).selected}
          onClick={(e) => this.onClickItem(item)} />
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
  protected renderRow(columns: string[], item: Item): JSX.Element {

    let row: any = item.data;

    let newRow: JSX.Element = 
    <tr key={v4()}
      className={this.props.table.rowsTRClassname}>
      
      {(this.props.renderCheckBox !== undefined && this.props.renderCheckBox === true) && this.renderCheckBox(false, item)}
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
              {this.state.selectedItemByPage[this.state.npage].map(item=>this.renderRow(this.props.table.columns, item))
              /*this.state.rows.map(val => this.renderRow(this.props.table.columns, val))*/}
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
