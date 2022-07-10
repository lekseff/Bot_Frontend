/* eslint-disable class-methods-use-this */
import Tooltip from './Tooltip';

export default class Geolocation {
  constructor(container) {
    this.container = container;
    this.getGeoButton = this.container.querySelector('.send__button-geo');
    this.clickEventHandler = [];
    this.registerEvents();
  }

  registerEvents() {
    this.getGeoButton.addEventListener('click', this.clickHandler.bind(this));
    this.tooltip = new Tooltip(this.container);
  }

  addClickEventHandler(callback) {
    this.clickEventHandler.push(callback);
  }

  /**
   * Получает текущую geo позицию
   * @returns - geolocation, error
   */
  getCurrentGeolocation() {
    if (!navigator.geolocation) return;

    // eslint-disable-next-line consistent-return
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }

  async clickHandler() {
    try {
      const { coords } = await this.getCurrentGeolocation();
      const { latitude, longitude } = coords;
      const data = {
        event: 'geolocation',
        type: 'geolocation',
        message: { latitude, longitude },
      };
      this.clickEventHandler.forEach((o) => {
        o.call(null, data);
      });
    } catch (err) {
      this.tooltip.showMessage(this.getGeoButton, 'Не удалось получить координаты');
    }
  }
}
