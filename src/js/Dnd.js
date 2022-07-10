export default class Dnd {
  constructor(container) {
    this.container = container;
    this.loadFileHandler = [];
  }

  init() {
    this.registerEvents();
  }

  registerEvents() {
    const loadButton = this.container.querySelector('.send__button-load');
    const inputFile = this.container.querySelector('#load-field');

    const dragZone = this.container.querySelector('.communication__messages');
    dragZone.addEventListener('dragover', this.constructor.dragOverHandler);
    dragZone.addEventListener('drop', this.dropHandler.bind(this));

    loadButton.addEventListener('click', () => {
      inputFile.dispatchEvent(new MouseEvent('click'));
    });
    inputFile.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (!file) return;
      this.onLoad(file);
      inputFile.value = '';
    });
  }

  // Callback обработчик загрузки
  addLoadFileHandler(callback) {
    this.loadFileHandler.push(callback);
  }

  onLoad(file) {
    this.loadFileHandler.forEach((o) => {
      o.call(null, file);
    });
  }

  // Отменят событие по умолчанию при перетаскивании файла
  static dragOverHandler(event) {
    event.preventDefault();
  }

  // Загрузка файла
  dropHandler(event) {
    event.preventDefault();
    const file = Array.from(event.dataTransfer.files)[0];
    if (!file) return;
    this.onLoad(file);
  }
}
