"use strict"

// Defines a new resize observer
const cnvResizeObserver = new ResizeObserver((entries) => {
  // Iterate over each canvas where auto resize is enabled
  for (let entry of entries) {
    // Updates its size
    const rect = entry.target.getBoundingClientRect();
    entry.target.width = rect.width;
    entry.target.height = rect.height;

    // Fires 'autoresize' event, sending new width and height
    const autoResizeEvent = new CustomEvent("autoresize", {
      width: rect.width,
      height: rect.height
    });
    entry.target.dispatchEvent(autoResizeEvent);
  }
});

// Canvas method for setting auto resize on or off
HTMLCanvasElement.prototype.setAutoResize = function(value) {
  if (value) {
    // Observe this element
    cnvResizeObserver.observe(this);
    // Update its size
    const rect = this.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
  }
  else {
    // Stop observing this element
    cnvResizeObserver.unobserve(this);
  }
}

// Canvas method for clearing all of its content
CanvasRenderingContext2D.prototype.clearContent = function() {
  this.clearRect(0, 0, this.canvas.width, this.canvas.height);
}