function DragNDrop(table) {
  const that = this;
  let target = null;
  let from = 0;
  
  function handleDragStart(e) {
    target = this;
    from = table.getRowOffset(e.clientX);
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

    const to = table.getRowOffset(e.clientX);
    table.move(target, from, to);

    target = null;
    from = 0;
    return false;
  }

  /*** Public properties ***/

  this.notify = function() {
    // Enable drop on all the cell.
    //
    // The `dragover` event is required for `drop` to work.
    let items = table.node.querySelectorAll('td');
    items.forEach(function (item) {
      item.addEventListener('drop', handleDrop, false);
      item.addEventListener('dragover', handleDragOver, false);
    });

    // Enable drag on the tasks.
    items = table.node.querySelectorAll('td.task');
    items.forEach(function (item) {
      item.setAttribute('draggable', true);
      item.addEventListener('dragstart', handleDragStart, false);
    });
  }
}
