import constants from './constants';
import Maker from './Maker';
import Tooltip from './Tooltip';
import Dnd from './Dnd';
import Geolocation from './Geolocation';
import Recorder from './Recorder';

export default class Bot {
  constructor(container) {
    this.container = container;
  }

  init() {
    this.controlPanel = this.container.querySelector('.communication__control'); // Панель ввода и кнопок
    this.messagesField = this.container.querySelector('.communication__messages'); // Поле сообщений
    this.maker = new Maker(); // Создает элементы для чата
    this.tooltip = new Tooltip(this.controlPanel); // Сообщения об ошибке
    this.geolocation = new Geolocation(this.controlPanel); // Геолокация
    this.recorder = new Recorder(this.container.querySelector('.send__buttons')); // Запись аудио
    this.wss = null; // WebSocketServer
    this.connectButton = this.container.querySelector('.online__connect_button');

    this.registerEvents();
    this.connectWebSocketServer();
    this.dnd.init();
    this.recorder.init();
  }

  /**
   * Добавляем обработчики событий
   */
  registerEvents() {
    // Отправка сообщения
    const inputForm = this.container.querySelector('#send-form');
    inputForm.addEventListener('submit', this.handleSubmitForm.bind(this));

    // Подключение
    this.connectButton.addEventListener('click', this.connectWebSocketServer.bind(this));
    // Функция DnD
    const communicationWindow = this.container.querySelector('.communication');
    this.dnd = new Dnd(communicationWindow);
    this.dnd.addLoadFileHandler(this.fileLoader.bind(this));

    // Обработка получения координат
    this.geolocation.addClickEventHandler(this.sendMessage.bind(this));

    // Получение файла аудио записи
    this.recorder.addStopEventHandler(this.fileLoader.bind(this));

    // Событие прокрутки и ленивая загрузка истории
    this.messagesField.addEventListener('scroll', () => {
      const topCoords = this.messagesField.scrollTop;
      if (topCoords === 0) {
        const { id } = this.messagesField.firstElementChild.dataset;
        this.onLoadHistory(id);
      }
    });

    // Добавляет /get при нажатии стрелки вправо и пустой строке
    const inputField = inputForm.send;
    inputField.addEventListener('keyup', (event) => {
      if (event.keyCode === 39 && inputField.value === '') {
        inputField.value = '/get ';
      }
    });
  }

  /**
   * Подключение WebSocket к серверу
   */
  connectWebSocketServer() {
    this.wss = new WebSocket(constants.URL);

    this.wss.addEventListener('open', () => {
      // console.log('Соединение установлено');
      this.setConnectState(true);
      this.onLoad(); // Загружаем сообщения с сервера
    });

    this.wss.addEventListener('close', () => {
      // console.log('Соединение закрыто');
      this.setConnectState(false);
    });

    this.wss.addEventListener('error', () => {
      // console.log('Ошибка подключения');
      this.setConnectState(false);
    });

    this.wss.addEventListener('message', (event) => {
      const response = JSON.parse(event.data);
      this.receivedMessageHandler(response);
    });
  }

  /**
   * Обработка загруженного файла
   * @param {*} file - blob из input или dnd
   */
  fileLoader(file) {
    const { name, type } = file;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result;
      this.sendMessage({
        event: 'upLoadFile',
        file: base64,
        type: 'file',
        info: {
          name,
          category: type,
        },
      });
    };
  }

  /**
 * Отправка данных на сервер
*/
  sendMessage(data) {
    this.wss.send(JSON.stringify(data));
  }

  /**
   * Обработка response
   * @param {*} data - данные
   */
  async receivedMessageHandler(data) {
    switch (data.event) {
      case 'newMessage':
      case 'command':
      case 'geolocation':
        await this.messagesField.append(
          this.maker.createElement(data),
        );
        this.messagesField.scrollTop = this.messagesField.scrollHeight;
        break;
      case 'getLastMessage':
        this.renderLastMessage(data);
        this.messagesField.scrollTop = this.messagesField.scrollHeight;
        break;
      case 'getHistory':
        this.renderHistory(data);
        break;
      case 'upLoadFile':
        await this.renderFileMessage(data);
        this.messagesField.scrollTop = this.messagesField.scrollHeight;
        break;
      default:
    }
  }

  /**
   * Загрузка последних сообщений при подключении
   */
  onLoad(id = null) {
    this.sendMessage({
      id,
      event: 'getLastMessage',
    });
  }

  /**
   * Загрузка N сообщений из истории
   * @param {*} id - id последнего элемента
   */
  onLoadHistory(id) {
    this.sendMessage({
      id,
      event: 'getHistory',
    });
  }

  /**
   * Рендер элемента загруженного файла
   * @param {*} data - {id, date, message, type, info}
   */
  async renderFileMessage(data) {
    const element = await this.maker.createElement(data);
    if (element) {
      await this.messagesField.append(element);
    } else {
      const sendButton = this.controlPanel.querySelector('.send__button-load');
      this.tooltip.showMessage(sendButton, 'Не верный формат файла');
    }
  }

  /**
   * Рендер последних сообщений сообщений при подключении
   * @param {*} data - {event, status, message}
   */
  renderLastMessage(data) {
    if (!data.status) return;
    data.message.forEach((msg) => {
      const element = this.maker.createElement(msg);
      this.messagesField.append(element);
    });
  }

  /**
   * Рендер подгруженных сообщений истории
   * @param {*} data - {event, status, message}
   * @returns -
   */
  renderHistory(data) {
    if (!data.status) {
      // console.warn('no message');
      return;
    }
    const currentTopScroll = this.messagesField.scrollHeight - this.messagesField.clientHeight;
    data.message.forEach((msg) => {
      const element = this.maker.createElement(msg);
      this.messagesField.firstElementChild.before(element);
      const newTopScroll = this.messagesField.scrollHeight - this.messagesField.clientHeight;
      this.messagesField.scrollTop = newTopScroll - currentTopScroll;
    });
  }

  /**
   * Обработка поля ввода
   * @param {*} event - event
   * @returns -
   */
  async handleSubmitForm(event) {
    event.preventDefault();
    const inputEl = event.target.elements.send;
    const data = inputEl.value.trim();
    if (data === '') {
      this.tooltip.showMessage(inputEl, 'Пустое поле');
      return;
    }

    const requestData = {
      message: data,
      type: 'text',
    };

    //  Получаем координаты если требуется погода
    if (data.startsWith('/get погода')) {
      try {
        const location = await this.geolocation.getCurrentGeolocation();
        const { latitude, longitude } = location.coords;
        requestData.event = 'command';
        requestData.location = { latitude, longitude };
        this.sendMessage(requestData);
      } catch (err) {
        const geoButton = this.controlPanel.querySelector('.send__button-geo');
        this.tooltip.showMessage(geoButton, err.message);
      }
    }

    if (data.startsWith('/get') && !data.startsWith('/get погода')) {
      requestData.event = 'command';
      this.sendMessage(requestData);
    }

    // Отправка текстового в любом случае
    this.sendMessage({
      event: 'newMessage',
      message: data,
      type: 'text',
    });
    inputEl.value = '';
  }

  /**
   * Установка состояния подключения
   * @param {*} status true/false
   */
  setConnectState(status) {
    if (status) {
      this.container.querySelector('#online-status').className = 'online__title-online';
      this.connectButton.setAttribute('disabled', true);
    } else {
      this.container.querySelector('#online-status').className = 'online__title-offline';
      this.connectButton.removeAttribute('disabled');
    }
  }
}
