function DragNDrop(node, headers, rows) {
  const that = this;
  let src = null;
  let offset = 0;

  // getCursorOffset returns the column offset of the cursor inside a cell.
  function getCursorOffset(target, clientX) {
    const rect = target.getBoundingClientRect();
    const cellWidth = rect.width / target.colSpan
    const x = clientX - rect.left;
    return Math.floor(x / cellWidth);
  };
  
  function handleDragStart(e) {
    src = this;
    offset = getCursorOffset(this, e.clientX);
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

    // Set new row offset.
    const dst = this;
    if (src !== dst) {
      let start = parseInt(dst.dataset.col);
      row.start = start - offset;
    } else {
      let dropOffset = getCursorOffset(this, e.clientX);
      row.start = row.start + (dropOffset - offset);
    }

    node.dispatchEvent(new Event('update'));
    src = null;
    offset = 0;
    return false;
  }

  function handleUpdated() {
    // Enable drop on all the cell.
    //
    // The `dragover` event is required for `drop` to work.
    let items = node.querySelectorAll('td');
    items.forEach(function (item) {
      item.addEventListener('drop', handleDrop, false);
      item.addEventListener('dragover', handleDragOver, false);
    });

    // Enable drag on the tasks.
    items = node.querySelectorAll('td.task');
    items.forEach(function (item) {
      item.setAttribute('draggable', true);
      item.addEventListener('dragstart', handleDragStart, false);
    });
  }

  node.addEventListener('updated', handleUpdated);
}
