import React, { createRef } from 'react';
import { Card } from 'react-bootstrap';
import { ChevronDown, ChevronRight } from 'react-bootstrap-icons';
import { ReactTabulator } from 'react-tabulator';
import { authorization } from '../authorization';
import './tableView.scss';

const PAGE_FIELD = 'page';
const LIMIT_FIELD = 'limit';

interface TableViewProps {
  api?: string,
  columns: any[],
  selectedRow?: any,
  onRowSelected?: (row: any) => void,
  tableProps?: any
  apiPagination?: boolean,
  manageColumns?: boolean,
  params?: { [key: string]: any },
  paginationSize?: number,
  hideSizeSelector?: boolean,
  initialSorting?: { column: string, dir: 'asc' | 'desc' }[],
  data?: any,
  id?: string,
  fieldsMapper?: { [key: string]: string }
}

class TableView extends React.Component<TableViewProps, any> {

  private tabulator = createRef<ReactTabulator>();

  constructor(props: TableViewProps) {
    super(props);
    this.state = {
      loading: true,
      page: 1,
      pages: 1,
      columns: props.columns,
      manageColumns: props.manageColumns === undefined ? true : props.manageColumns,
      showColumns: false
    };
  }

  getSelectedData() {
    return this.tabulator?.current?.table?.getSelectedData();
  }

  reloadData() {
    // eslint-disable-next-line no-underscore-dangle
    this.tabulator?.current?.table?.modules?.page?._getRemotePage();
  }

  getData = (): Record<string, unknown>[] | undefined => this.tabulator?.current?.table?.getData();

  render() {
    const thisClass = this;
    const apiPagination = this.props.apiPagination === undefined || this.props.apiPagination === true;
    const options = this.props.data ? {
      columns: this.props.columns,
      initialSorting: this.props.initialSorting,
      movableRows: false,
      rowClick: (_: Event, row: any) => {
        // eslint-disable-next-line no-underscore-dangle
        thisClass.props.onRowSelected?.call(this, row);
      }
    } : {
      paginationSize: this.props.paginationSize ?? 10,
      paginationSizeSelector: this.props.hideSizeSelector === true ? undefined : [10, 25, 50, 100, 200, 500],
      movableRows: false,
      columns: this.props.columns,
      initialSorting: this.props.initialSorting,
      ajaxConfig: {
        headers: {
          Authorization: `Bearer ${authorization.accessToken}` // set specific content type
        }
      },
      ajaxURL: this.props.api,
      ajaxURLGenerator: (url: any, _config: any, params: any) => {
        // url - the url from the ajaxURL property or setData function
        // config - the request config object from the ajaxConfig property
        // params - the params object from the ajaxParams property, this will also include any pagination,
        //          filter and sorting properties based on table setup
        const sendParams: any = this.props.params || {};
        if (apiPagination) {
          sendParams.page = params.page;
          sendParams.limit = params.limit;
        }
        if (params.sorters !== undefined && params.sorters.length > 0) {
          params.sorters.map((f: any) => {
            const column = this.props.columns.find((c: any) => c.field === f.field);
            f.field = column ? column.sorterField || f.field : f.field;
            return f;
          });
          sendParams.sorters = JSON.stringify(params.sorters);
        } else if (this.props.initialSorting) {
          const sorters = this.props.initialSorting.map((is) => ({ field: is.column, dir: is.dir }));
          sendParams.sorters = JSON.stringify(sorters);
        }
        if (params.filters !== undefined) {
          params.filters.map((f: any) => {
            const column = this.props.columns.find((c: any) => c.field === f.field);
            f.field = column ? column.filterField || f.field : f.field;
            return f;
          });
          sendParams.filters = JSON.stringify(params.filters);
        }
        // return request url
        return `${url}?${new URLSearchParams(sendParams).toString()}`; // encode parameters as a json object
      },
      ajaxSorting: true,
      ajaxFiltering: true,
      paginationDataSent: {
        page: PAGE_FIELD,
        size: LIMIT_FIELD
      },
      // eslint-disable-next-line i18next/no-literal-string
      pagination: apiPagination ? 'remote' : 'local',
      current_page: 1,
      ajaxRequesting: (url: any, params: any) => {
        // url - the URL of the request
        // params - the parameters passed with the request
        if (`Bearer ${authorization.accessToken}` !== options.ajaxConfig?.headers?.Authorization) {
          options.ajaxConfig = {
            headers: {
              Authorization: `Bearer ${authorization.accessToken}` // set specific content type
            }
          };
          this.tabulator.current?.table.setData(url, params, options.ajaxConfig);
        }
      },
      ajaxResponse: (_url: any, _params: any, response: any) => {
        console.log(response);
        if (apiPagination) {
          response.last_page = response.pagination.lastPage;
          return response; // return the response data to tabulator
        }
        return response.data;
      },
      ajaxError: async (error: any) => {
        console.log('ajaxError', error);
        if (error.status === 401) {
          const result = await authorization.refreshToken();
          console.log('Is token refreshed? ', result);
          if (result) {
            this.reloadData();
          }
        }
      },
      rowClick: (_: Event, row: any) => {
        thisClass.props.onRowSelected?.call(this, row);
      },
      dataLoaded: () => {
        if (thisClass.tabulator !== undefined && thisClass.props.selectedRow !== undefined) {
          thisClass.tabulator!.current!.table.selectRow(thisClass.props.selectedRow);
        }
        console.log('Data loaded');
      },
      ...this.props.tableProps
    };

    options.persistenceID = `r-${this.props.id || Date.now()}`;
    options.persistence = true;
    options.pageLoaded = (pageno: number) => {
      const table: any = this.tabulator.current?.ref;
      console.log('Page loaded: ', pageno, table?.style);
      // eslint-disable-next-line i18next/no-literal-string
      table.style.maxHeight = '70vh';
    };

    /* eslint-disable i18next/no-literal-string */
    // options.persistenceWriterFunc = (id: string, type: string, data: any) => {
    //   // id - tables persistence id
    //   // type - type of data being persisted ('sort', 'filter', 'group', 'page' or 'columns')
    //   // data - array or object of data

    //   const filters = [];
    //   const headers = Array.from<HTMLDivElement>(this.tabulator.current?.ref?.querySelectorAll('.tabulator-col'));
    //   for (let i = 0; i < headers.length; i += 1) {
    //     const header = headers[i];
    //     const field = header.getAttribute('tabulator-field');
    //     const input = header.querySelector<HTMLInputElement>('input[type='search']');
    //     if (input && input.value && field) {
    //       filters.push({ field, type: 'like', value: input.value });
    //     }
    //   }
    //   if (localStorage.getItem(id + '-custom-filters') !== JSON.stringify(filters)) {
    //     localStorage.setItem(id + '-custom-filters', JSON.stringify(filters));
    //   }

    //   localStorage.setItem(id + '-' + type, JSON.stringify(data));
    // };

    // options.persistenceReaderFunc = (id: string, type: string, data: any) => {
    //   // id - tables persistence id
    //   // type - type of data being persisted ('sort', 'filter', 'group', 'page' or 'columns')
    //   // data - array or object of data

    //   if (type === 'filter' && localStorage.getItem(id + '-custom-filters')) {
    //     const filters = JSON.parse(localStorage.getItem(id + '-custom-filters') as string);
    //     const headers = Array.from<HTMLDivElement>(this.tabulator.current?.ref?.querySelectorAll('.tabulator-col'));
    //     for (let i = 0; i < headers.length; i += 1) {
    //       const header = headers[i];
    //       const field = header.getAttribute('tabulator-field');
    //       const input = header.querySelector<HTMLInputElement>('input[type='search']');
    //       const filter = filters.find((f: any) => field === f.field);
    //       if (input && filter) {
    //         input.value = filter.value;
    //       }
    //     }
    //     return filters;
    //   }

    //   console.log('READER: ', id, type, data);
    //   const loacalStorageData = localStorage.getItem(id + '-' + type);
    //   return loacalStorageData ? JSON.parse(loacalStorageData) : false;
    // };
    return <>
      {
        this.state.manageColumns &&

        <div className="float-right">
          <div className="text-right">
            <label className="manage-columns-button" onClick={() => this.setState({ showColumns: !this.state.showColumns })}>
              <span>Gestione colonne</span>
              {this.state.showColumns ? <ChevronDown /> : <ChevronRight />}
            </label>
          </div>
          {
            this.state.showColumns &&
            <Card className="columns-wrapper">
              <Card.Body>
                <div>
                  {
                    this.props.columns.filter((column: any) => !!column.title)
                      .map((column: any) => <div key={`column-${column.field}`}>
                        <label htmlFor={`checkbox-${column.field}`}>
                          <input type="checkbox"
                            key={`checkbox-${column.field}`}
                            name={`checkbox-${column.field}`}
                            id={`checkbox-${column.field}`}
                            checked={column.visible !== false}
                            style={{ marginLeft: '0.5em', marginRight: '0.5em' }}
                            onClick={() => {
                              const table = this.tabulator.current?.table;
                              column.visible = !column.visible;
                              if (table && !column.visible) {
                                table.hideColumn(column.field);
                              }
                              if (table && column.visible) {
                                table.showColumn(column.field);
                              }
                              this.setState({ columns: this.props.columns });
                            }}
                          />
                          {column.title}
                        </label>
                      </div>)
                  }
                </div>
              </Card.Body>
            </Card>
          }
        </div>
      }

      <ReactTabulator  
        ref={this.tabulator}
        columns={[]}
        data={this.props.data ? this.props.data : []}
        options={options}
      />
    </>;
  }
  /* eslint-enable i18next/no-literal-string */

}

export default TableView;