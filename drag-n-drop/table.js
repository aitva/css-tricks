function Table(node, headers, rows) {
  const that = this;

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

      if (row.start === i) {
        createResizeHandle(td);
        td.classList.add('task');
        td.colSpan = row.span;
        i += (row.span - 1);
      }

      tr.appendChild(td);
    }

    return tr;
  };

  function createResizeHandle(td) {
    const left = document.createElement('div');
    left.classList.add('resize', 'resize-left')
    td.appendChild(left)

    const right = document.createElement('div');
    right.classList.add('resize', 'resize-right')
    td.appendChild(right)
  }
  
  function handleUpdate() {
    const thead = createHeader();
    const tbody = createRows();
    node.replaceChildren(thead, tbody);
    node.dispatchEvent(new Event('updated'))
  }

  node.addEventListener('update', handleUpdate);
  handleUpdate();
}

