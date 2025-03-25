// table.js provides functions to render a planning as an HTML table.

// createHeader renders headers into a thead element.
//
// Below an example of the generated HTML:
//
//    <tr>
//      <th>09/09</th>
//      <th>16/09</th>
//      <th>23/09</th>
//      <th>30/09</th>
//      <th>07/10</th>
//    </tr>
function createHeader(headers) {
  const tr = document.createElement('tr');
  tr.appendChild(document.createElement('th'));
  for (const h of headers) {
    const th = document.createElement('th');
    th.textContent = h;
    tr.appendChild(th);
  }

  const thead = document.createElement('thead');
  thead.appendChild(tr);
  return thead;
};

// createRow renders a row into a tr element.
//
// Below an exemple of the generated HTML:
//
//    <tr>
//      <th>Label</th>
//      <td></td>
//      <td></td>
//      <td class="task" colspan=2></td>
//      <td></td>
//    </td>
function createRow(headers, row) {
  const tr = document.createElement('tr');
  
  const th = document.createElement('th');
  th.textContent = row.name;
  tr.appendChild(th);

  for (let i = 0; i < headers.length; i++) {
    const td = document.createElement('td');
    td.dataset.col = i;

    if (row.start === i && row.span > 0) {
      td.classList.add('task');
      td.colSpan = row.span;
      i += (row.span - 1);
    }

    tr.appendChild(td);
  }

  return tr;
};

// createRows renders rows into a tbody element.
function createRows(headers, rows) {
  const tbody = document.createElement('tbody');

  for (let i = 0; i < rows.length; i++) {
    const tr = createRow(headers, rows[i]);
    tr.dataset.row = i;
    tbody.appendChild(tr);
  }

  return tbody;
};

// Table renders a planning as an HTML table.
//
// It provides the following methods to manipulate the table:
//
//    interface Table {
//      // addRenderer adds a renderer to be executed after render.
//      //
//      // The function expects a renderer to implement the following interface:
//      //
//      //    interface Renderer { render() }
//      //
//      addRenderer(r)
//
//      // render renders the planning as a table.
//      //
//      // It calls registered renderer once rendering is done.
//      render()
//
//      // getRowOffset returns the row offset from the cursor position.
//      getRowOffset(clientX)
//
//      // move moves the target.
//      move(target, from, to)
//
//      // resize resizes the target.
//      resize(target, from, to)
//    }
export function Table(node, headers, rows) {
  /* Private properties */

  const that = this;
  const renderers = [];


  /* Public properties */

  this.node = node;
  this.headers = headers;
  this.rows = rows;

  /* Public methods */

  this.addRenderer = function (r) {
    renderers.push(r);
  };

  this.render = function () {
    const thead = createHeader(headers);
    const tbody = createRows(headers, rows);
    node.replaceChildren(thead, tbody);

    for (let r of renderers) {
      r.render();
    }
  };

  this.getRowOffset = function (clientX) {
    const tr = node.querySelector('tbody tr');
    const td = tr.querySelector('td');
    const rect = td.getBoundingClientRect();

    // We want the width of one column.
    const width = rect.width / td.colSpan;

    const x = Math.max(0, clientX - rect.left);
    const offset = Math.floor(x / width);
    return Math.min(offset, headers.length);
  };

  this.move = function (target, from, to) {
    const i = parseInt(target.parentElement.dataset.row);
    const row = rows[i];

    row.start = row.start + (to - from);
    row.start = Math.max(0, row.start);
    row.start = Math.min(row.start, headers.length - row.span);
    that.render();
  };
 
  this.resize = function (target, from, to) {
    const i = parseInt(target.parentElement.dataset.row);
    const row = rows[i];

    const span = to - from;
    if (row.start === from) {
      row.start = to;
      row.span = row.span - span;
    } else if (to < from){
      row.start -= span;
      row.span += span;
    } else {
      row.span += span + 1;
    }

    row.start = Math.max(0, row.start);
    row.start = Math.min(row.start, headers.length - row.span);
    that.render();
  };
}
