// import React from 'react';
// import { DateRange, Range, OnDateRangeChangeProps } from 'react-date-range';
import moment from 'moment';
// import ReactDOMServer from 'react-dom/server';

/* eslint-disable i18next/no-literal-string */

// interface HeaderDateRangeFilterProps {
//     ranges?: Range[],
//     onChange?: ((range: OnDateRangeChangeProps) => void)
// }

// interface HeaderDateRangeFilterState {
//     showDateRange?: boolean,
//     ranges?: Range[],
//     placeholder?: string;
//     onChange?: ((range: OnDateRangeChangeProps) => void)
// }

// class HeaderDateRangeFilter extends React.Component<HeaderDateRangeFilterProps, HeaderDateRangeFilterState> {

//     constructor(props: any) {
//         super(props);
//         this.state = {
//             showDateRange: true,
//             ranges: props.ranges,
//             onChange: props.onChange
//         };
//     }

//     render() {
//         const { ranges, onChange } = this.state;
//         return <>
//             <input type="text"
//                 value={this.state.placeholder}
//                 onClick={() => {
//                     alert('ok');
//                     this.setState({
//                     showDateRange: true,
//                     placeholder: 'Opened!'
//                 });
//             }}
//             />
//             {
//                 this.state.showDateRange &&
//                 <DateRange
//                     ranges={ranges}
//                     onChange={onChange}
//                 />
//             }
//         </>;
//     }

// }

//custom max min header filter
export const minMaxFilterEditor = function (
    cell: any,
    onRendered: Function,
    success: Function,
    cancel: Function
) {
    let end: any = null;

    let container = document.createElement('div');

    //create and style inputs
    let start = document.createElement('input');
    start.setAttribute('type', 'date');
    start.setAttribute('placeholder', 'Min');
    start.style.padding = '4px';
    start.style.width = '50%';
    start.style.boxSizing = 'border-box';

    start.value = cell.getValue();

    function buildValues() {
        const value = [start.value, end.value];
        if (start.value && start.value) {
            success({
                op: 'between',
                range: value
            });
            return;
        }
        success();
    }

    function keypress(e: Event & { keyCode: number }) {
        if (e.keyCode == 13) buildValues();
        if (e.keyCode == 27) cancel();
    }

    end = start.cloneNode();
    end.setAttribute('placeholder', 'Max');

    start.addEventListener('change', buildValues);
    start.addEventListener('blur', buildValues);
    start.addEventListener('keydown', keypress);

    end.addEventListener('change', buildValues);
    end.addEventListener('blur', buildValues);
    end.addEventListener('keydown', keypress);

    // let startContainer = document.createElement('div');
    // startContainer.appendChild(start);
    // let endContainer = document.createElement('div');
    // endContainer.appendChild(end);
    let clear = document.createElement('div');
    let small = document.createElement('small');
    small.innerHTML = 'clear';
    small.style.cursor = 'pointer';
    clear.style.textAlign = 'initial';
    clear.appendChild(small);
    clear.onclick = () => {
        start.value = '';
        end.value = '';
        success();
    };

    container.appendChild(start);
    container.appendChild(end);
    container.appendChild(clear);

    // const el = <HeaderDateRangeFilter />;
    // container.innerHTML = ReactDOMServer.renderToString(el);

    return container;
};

//custom max min filter function
export const minMaxFilterFunction = (
    headerValue: { start: string | Date, end: string | Date },
    _rowValue: Date
) => {
    //headerValue - the value of the header filter element
    //rowValue - the value of the column in this row
    //rowData - the data for the row being filtered
    //filterParams - params object passed to the headerFilterFuncParams property

    //convert strings into dates
    let rowValue = _rowValue;
    if (headerValue.start) {
        headerValue.start = new Date(headerValue.start);
    }
    if (headerValue.end) {
        headerValue.end = new Date(headerValue.end);
    }

    //compare dates
    if (rowValue) {
        rowValue = new Date(rowValue);

        if (headerValue.start) {
            if (headerValue.end) {
                return moment(rowValue).toDate() >= headerValue.start && rowValue <= headerValue.end;
            } else {
                return rowValue >= headerValue.start;
            }
        } else {
            if (headerValue.end != '') {
                return rowValue <= headerValue.end;
            }
        }
    }

    return true; //must return a boolean, true if it passes the filter.
};