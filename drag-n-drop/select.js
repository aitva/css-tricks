// select.js provides functions to enable selection on a planning.

// Rect represents a rectangle on screen.
//
// It provides the following properties & methods:
//
//    interface Rect {
//      left: int
//      top: int
//      right: int
//      bottom: int
//
//      // width returns the width of the rectangle.
//      width()
//
//      // height returns the height of the rectangle.
//      height()
//
//      // add adds a rectangle into Rect.
//      //
//      // It grows the size of Rect to contain the new rectangle.
//      add(rect)
//    }
function Rect() {
  this.left = Number.MAX_SAFE_INTEGER;
  this.top = Number.MAX_SAFE_INTEGER;
  this.right = 0;
  this.bottom = 0;

  this.width = function () {
    return this.right - this.left;
  }

  this.height = function () {
    return this.bottom - this.top;
  }

  this.add = function (rect) {
    if (rect.left < this.left) {
      this.left = rect.left;
    }
    if (rect.top < this.top) {
      this.top = rect.top;
    }
    if (rect.right > this.right) {
      this.right = rect.right;
    }
    if (rect.bottom > this.bottom) {
      this.bottom = rect.bottom;
    }
  }
}

// createSelection renders a selection overlay for the targets.
//
// Below is an example of the generated HTML:
//
//    <div class="selection" style="position: absolute; left: 0px; right: 0px; width: 100px; height: 100px;">
//      <div class="selected" style="position: absolute; left: 0px; right: 0px; width: 50px; height: 50px;"></div>
//      <div class="selected" style="position: absolute; left: 50px; right: 50px; width: 50px; height: 50px;"></div>
//    </div>
function createSelection(targets, handleDeselection) {
  // Compute selection size;
  const minMax = new Rect();
  for (let t of targets) {
    minMax.add(t.getBoundingClientRect());
  }

  // Create the selection.
  const selection = document.createElement('div');
  selection.classList.add('selection');
  selection.style.position = 'absolute';
  selection.style.left = `${minMax.left}px`;
  selection.style.top = `${minMax.top}px`;
  selection.style.width = `${minMax.width()}px`;
  selection.style.height = `${minMax.height()}px`;

  // Display individual elements.
  for (let i = 0; i < targets.length; i++) {
    const rect = targets[i].getBoundingClientRect();
    const s = document.createElement('div');
    s.classList.add('selected');
    s.style.position = 'absolute';
    s.style.left = `${rect.left - minMax.left}px`;
    s.style.top = `${rect.top - minMax.top}px`;
    s.style.width = `${rect.width}px`;
    s.style.height = `${rect.height}px`;
    s.dataset.target = i;
    s.addEventListener('click', handleDeselection, false);
    selection.appendChild(s);
  }
  
  return selection;
}

// Select renders a selection overlay on a Table.
// 
// It provides the following methods to manipulate the selection:
//
//    interface Select {
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
export function Select(table) {
  const renderers = [];
  let targets = [];
  let selection = null;

  function handleClearSelection(e) {
    if (targets.length > 0) {
      targets = [];
      render();
    }
    return false;
  }

  function handleSelection(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }

    const i = targets.indexOf(this);
    if (i !== -1) {
      console.error('unexpected selection of selected target', this);
      return false;
    }

    if (e.ctrlKey) {
      targets.push(this)
    } else {
      targets = [this];
    }
    render()
    return false;
  }

  function handleDeselection(e) {
    if (e.stopPropagation) {
      e.stopPropagation();
    }

    if (this.dataset.target == null) {
      targets = [];
      render();
      return false;
    }

    const i = parseInt(this.dataset.target)
    if (e.ctrlKey) {
      targets.splice(i, 1);
    } else {
      targets = [targets[i]];
    }
    render();
    return false;
  }

  function render() {
    // Clear selection on screen.
    if (selection !== null) {
      selection.remove();
      selection = null;
    }

    // Stop if there is no target.
    if (targets.length === 0) {
      return;
    }
    
    // Display the selection.
    selection = createSelection(targets, handleDeselection)
    document.body.appendChild(selection);
    
    for (let r of renderers) {
      r.render();
    }
  }


  /*** Public properties ***/
  
  this.addRenderer = function (r) {
    renderers.push(r);
  };

  this.render = function() {
    // Enable selection on the tasks.
    const items = table.node.querySelectorAll('td.task');
    items.forEach(function (item) {
      item.addEventListener('click', handleSelection, false);
    });
  }

  this.getRowOffset = table.getRowOffset;

  this.move = function (target, from, to) {
    for (let t of targets) {
      table.move(t, from, to);
    }
    targets = [];
    render();
  };
 
  this.resize = function (target, from, to) {
    for (let t of targets) {
      table.resize(t, from, to);
    }
    targets = [];
    render();
  };

  document.body.addEventListener('click', handleClearSelection, false);
}
