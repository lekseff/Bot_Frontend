import Tooltip from './Tooltip';

export default class Recorder {
  constructor(container) {
    this.recorderPanel = container;
    this.stopEventHandler = [];
  }

  /**
   * Инициализация
   */
  init() {
    this.registerEvents();
    this.primaryButtons = this.recorderPanel.querySelector('.send__primary_buttons');
    this.recordButtons = this.recorderPanel.querySelector('.send__record_buttons');
    this.recordTime = this.recorderPanel.querySelector('.record__time');
    this.stopButton = this.recorderPanel.querySelector('.send__button-stop');
    this.tooltip = new Tooltip(this.recorderPanel);
  }

  /**
   * Регистрация обработчиков событий
   */
  registerEvents() {
    this.recordButton = this.recorderPanel.querySelector('#record-btn');
    this.recordButton.addEventListener('click', this.voiceRecord.bind(this));
  }

  /**
   * Добавляет функцию обработчик записи
   * @param {*} callback - callback
   */
  addStopEventHandler(callback) {
    this.stopEventHandler.push(callback);
  }

  /**
   * Запись аудио
   */
  async voiceRecord() {
    try {
      let timerId = null;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      const recorder = new MediaRecorder(stream);
      const chunk = [];

      recorder.addEventListener('start', () => {
        this.toggleButtons();
        timerId = this.timer();
      });

      recorder.addEventListener('dataavailable', (event) => {
        chunk.push(event.data);
      });

      recorder.addEventListener('stop', () => {
        this.toggleButtons();
        clearInterval(timerId);
        const blob = new Blob(chunk, { type: 'audio/ogg; codecs=opus' });
        this.stopEventHandler.forEach((o) => {
          o.call(null, blob);
        });
      });

      const stopRecord = () => {
        recorder.stop();
        stream.getTracks().forEach((track) => track.stop());
        this.stopButton.removeEventListener('click', stopRecord);
      };

      this.stopButton.addEventListener('click', stopRecord);
      recorder.start();
    } catch (err) {
      this.showErrorTooltip(err.message);
    }
  }

  /**
   * Показывает подсказку об ошибке
   * @param {*} message - текст ошибки
   */
  showErrorTooltip(message) {
    const recordButton = this.recorderPanel.querySelector('.send__button-audio');
    this.tooltip.showMessage(recordButton, message);
  }

  /**
   * Переключает панели кнопок при записи
   */
  toggleButtons() {
    this.primaryButtons.classList.toggle('hidden');
    this.recordButtons.classList.toggle('hidden');
  }

  /**
   * Таймер
   * @returns id таймера
   */
  timer() {
    const el = this.recorderPanel.querySelector('.record__time');
    el.textContent = '00:00';
    let minutes = 0;
    let seconds = 0;
    const intervalId = setInterval(() => {
      seconds += 1;
      if (seconds === 60) {
        minutes += 1;
        seconds = 0;
      }
      const min = (minutes < 10) ? `0${minutes}` : `${minutes}`;
      const sec = (seconds < 10) ? `0${seconds}` : `${seconds}`;
      el.textContent = `${min}:${sec}`;
    }, 1000);

    return intervalId;
  }
}
