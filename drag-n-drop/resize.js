function Resize(table) {
  const that = this;
  let from = 0;
  let clientX = 0;
  let preview = null;
  let target = {
    node: null,
    left: 0,
    right: 0,
    width: 0
  };
  let resizeFunc = null;

  function handleMouseDown(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }

    // Get the start offset.
    from = table.getRowOffset(e.clientX);
    
    // Get the target and its edges;
    target.node = e.target.parentElement;
    const rect = target.node.getBoundingClientRect();
    target.left = rect.left;
    target.right = rect.left + rect.width;
    target.width = rect.width;

    // Get mouse position.
    clientX = e.clientX;

    // Create the preview.
    const div = document.createElement('div');
    div.classList.add('resize', 'resize-preview');
    target.node.appendChild(div)
    preview = div;

    // Pick resize function.
    resizeFunc = handleLeftResize;
    if (e.target.classList.contains('resize-right')) {
      resizeFunc = handleRightResize;
    }

    // Register listener on the document.
    document.addEventListener('mousemove', resizeFunc);
    document.addEventListener('mouseup', handleMouseUp);

    return false;
  }

  function handleLeftResize(e) {
    const cappedX = Math.min(target.right, e.clientX)
    const dx = cappedX - clientX;
    preview.style.left = `${dx}px`
    preview.style.width = `${target.width - dx}px`;
    return false;
  }

  function handleRightResize(e) {
    const cappedX = Math.max(target.left, e.clientX)
    const dx = cappedX - clientX;
    preview.style.width = `${target.width + dx}px`;
    return false;
  }

  function handleMouseUp(e) {
    // Remove listeners on the document.
    document.removeEventListener('mousemove', resizeFunc);
    document.removeEventListener('mouseup', handleMouseUp);

    // Remove resize preview.
    target.node.removeChild(preview);

    // Update row.
    const to = table.getRowOffset(e.clientX);
    table.resize(target.node, from, to);

    // Cleanup local state.
    from = 0;
    clientX = 0;
    preview = null;
    target = {
      node: null,
      left: 0,
      right: 0,
      width: 0
    };
    resizeFunc = null;
    return false;
  };
  
  /*** Public properties ***/

  this.notify = function() {
    // Enable resize on the tasks.
    items = table.node.querySelectorAll('.task .resize');
    items.forEach(function (item) {
      item.addEventListener('mousedown', handleMouseDown, false);
    });
  };
}
