"use strict";

function Select(table) {
  const notifiers = [];
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
    
    // Compute selection size;
    const minMax = new MinMax();
    for (let t of targets) {
      minMax.add(t.getBoundingClientRect());
    }

    // Create the selection.
    selection = document.createElement('div');
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
  
    // Display the selection.
    document.body.appendChild(selection);
    
    for (let n of notifiers) {
      n.notify();
    }
  }


  /*** Public properties ***/
  
  this.addNotifier = function (n) {
    notifiers.push(n);
  };

  this.notify = function() {
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

function MinMax() {
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
