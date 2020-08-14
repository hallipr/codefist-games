function Visualizer(log, container, settings) {
    this.play = function () {
        container.innerHTML = "<pre>" + JSON.stringify(log, null, "  ") + "</pre>";
    };

    this.stop = function () {
    };
}