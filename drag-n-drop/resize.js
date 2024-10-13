function Resize(node, headers, rows) {
  const that = this;
  let clientX = 0;
  let resizeFunc = null;
  let preview = null;
  let target = {
    node: null,
    left: 0,
    right: 0,
    width: 0
  };

  // getCursorOffset returns the column offset of the cursor inside a cell.
  function getCursorOffset(target, clientX) {
    const rect = target.getBoundingClientRect();
    const cellWidth = rect.width / target.colSpan
    const x = clientX - rect.left;
    return Math.floor(x / cellWidth);
  };

  function handleMouseDown(e) {
    if (e.preventDefault) {
      e.preventDefault();
    }
    
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

  function handleMouseUp() {
    // Remove listeners on the document.
    document.removeEventListener('mousemove', resizeFunc);
    document.removeEventListener('mouseup', handleMouseUp);

    target.node.removeChild(preview);

    clientX = 0;
    resizeFunc = null;
    preview = null;
    target = {
      node: null,
      left: 0,
      right: 0,
      width: 0
    };
    return false;
  };

  function handleUpdated() {
    // Enable resize on the tasks.
    items = node.querySelectorAll('.task .resize');
    items.forEach(function (item) {
      item.addEventListener('mousedown', handleMouseDown, false);
    });
  }

  node.addEventListener('updated', handleUpdated);
}
