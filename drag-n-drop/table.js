function Table(table, headers, rows) {
  const that = this;
  let src = null;
  let offset = 0;
  
  function handleDragStart(e) {
    src = this;
    offset = that.getCursorOffset(e);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }

    e.dataTransfer.dropEffect = 'move';
    return false;
  }

  function handleDrop(e) {
    if (e.stopPropagation) {
      e.stopPropagation(); // stops the browser from redirecting.
    }
      
    // Find the row.
    const i = parseInt(src.parentElement.dataset.row)
    const row = rows[i];

    const dst = this;
    if (src !== dst) {
      let start = parseInt(dst.dataset.col);
      row.start = start - offset;
    } else {
      let dropOffset = that.getCursorOffset(e);
      row.start = row.start + (dropOffset - offset);
    }

    refresh(table, headers, rows);
    src = null;
    offset = 0;
    return false;
  }

  function refresh(table, headers, rows) {
    const thead = that.createHeader(headers);
    const tbody = that.createRows(headers, rows);
    table.replaceChildren(thead, tbody);

    // Enable drop on all the cell.
    //
    // The `dragover` event is required for `drop` to work.
    let items = table.querySelectorAll('td');
    items.forEach(function (item) {
      item.addEventListener('drop', handleDrop, false);
      item.addEventListener('dragover', handleDragOver, false);
    });

    // Enable drag on the task only.
    items = table.querySelectorAll('td.task');
    items.forEach(function (item) {
      item.setAttribute('draggable', true);
      item.addEventListener('dragstart', handleDragStart, false);
    });
  }
  
  refresh(table, headers, rows);
}

// getCursorOffset returns the column offset of the cursor inside a cell.
Table.prototype.getCursorOffset = function (e) {
  const rect = e.target.getBoundingClientRect();
  const cellWidth = rect.width / e.target.colSpan
  const x = e.clientX - rect.left;
  return Math.floor(x / cellWidth);
};

Table.prototype.createHeader = function (headers) {
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

Table.prototype.createRows = function (headers, rows) {
  const tbody = document.createElement('tbody');

  for (let i = 0; i < rows.length; i++) {
    const tr = this.createRow(headers, rows[i]);
    tr.dataset.row = i;
    tbody.appendChild(tr);
  }

  return tbody;
};

Table.prototype.createRow = function (headers, row) {
  const tr = document.createElement('tr');
  
  const th = document.createElement('th');
  th.textContent = row.name;
  tr.appendChild(th);

  for (let i = 0; i < headers.length; i++) {
    const td = document.createElement('td');
    td.dataset.col = i;

    if (row.start === i) {
      td.classList.add('task')
      td.colSpan = row.span;
      i += (row.span - 1);
    }

    tr.appendChild(td);
  }

  return tr;
};
