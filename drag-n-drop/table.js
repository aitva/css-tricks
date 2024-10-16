"use strict";

function Table(node, headers, rows) {
  const that = this;
  const notifiers = [];

  function createHeader() {
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

  function createRows() {
    const tbody = document.createElement('tbody');

    for (let i = 0; i < rows.length; i++) {
      const tr = createRow(rows[i]);
      tr.dataset.row = i;
      tbody.appendChild(tr);
    }

    return tbody;
  };

  function createRow(row) {
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

  /*** Public properties ***/

  this.node = node;
  this.headers = headers;
  this.rows = rows;

  this.addNotifier = function (n) {
    notifiers.push(n);
  };

  this.render = function () {
    const thead = createHeader();
    const tbody = createRows();
    node.replaceChildren(thead, tbody);

    for (let n of notifiers) {
      n.notify();
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

