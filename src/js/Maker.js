export default class Maker {
  createElement(data) {
    const { type } = data;
    let element = null;

    switch (type) {
      case 'text':
      case 'geolocation':
        element = this.constructor.createTextElement(data);
        break;
      case 'file':
        element = this.constructor.createFileElement(data);
        break;
      case 'weather':
        element = this.constructor.createWeatherElement(data);
        break;
      // case 'geolocation':
      //   element = this.constructor.createTextElement(data);
      //   break;
      case 'news':
        element = this.constructor.createNewsElement(data);
        break;
      default:
    }
    return element;
  }

  /**
   * Возвращает html элемент по типу файла
   * @param {*} data - {id, time, message, file, info}
   * @returns - html элемент
   */
  static createFileElement(data) {
    const { category } = data.info;
    let element = null;

    if (category.startsWith('image/')) {
      element = this.createImageElement(data);
      return element;
    }

    if (category.startsWith('audio/')) {
      element = this.createAudioElement(data);
      return element;
    }

    if (category.startsWith('video/')) {
      element = this.createVideoElement(data);
      return element;
    }

    return false;
  }

  /**
   * Создает текстовый элемент
   * @param {*} data - {type, time, message, id}
   * @returns html элемент
   */
  static createTextElement(data) {
    const { date, message, id } = data;
    const messageEl = document.createElement('div');
    messageEl.classList.add('message');
    messageEl.dataset.id = id;

    const messageHeaderEl = document.createElement('div');
    messageHeaderEl.classList.add('message__header');

    const dateEl = document.createElement('span');
    dateEl.classList.add('message-date');
    dateEl.textContent = date;

    const messageTextEl = document.createElement('p');
    messageTextEl.classList.add('message__text');

    // Пишем координаты, если они есть
    const text = (message.latitude && message.longitude)
      ? `Твои координаты: ${message.latitude}, ${message.longitude}` : message;
    messageTextEl.innerHTML = text;
    messageHeaderEl.append(dateEl);
    messageEl.append(messageHeaderEl);
    messageEl.append(messageTextEl);
    return messageEl;
  }

  /**
   * Создает элемент изображения
   * @param {*} data -
   * @returns - html элемент
   */
  static createImageElement(data) {
    const {
      id, date, file, info,
    } = data;

    const views = document.createElement('div');
    views.classList.add('message', 'views');
    views.dataset.id = id;

    const messageHeaderEl = document.createElement('div');
    messageHeaderEl.classList.add('message__header');

    const dateEl = document.createElement('span');
    dateEl.classList.add('message-date');
    dateEl.textContent = date;
    messageHeaderEl.append(dateEl);

    const images = document.createElement('img');
    images.src = file;

    const a = document.createElement('a');
    a.href = file;
    a.download = info.name;
    a.append(images);

    views.append(messageHeaderEl);
    // views.append(images);
    views.append(a);

    return views;
  }

  /**
   * Создает аудио элемент
   * @param {*} data -
   * @returns - html элемент
   */
  static createAudioElement(data) {
    const { date, file, info } = data;
    const div = document.createElement('div');
    div.classList.add('message', 'audio__message');

    const messageHeaderEl = document.createElement('div');
    messageHeaderEl.classList.add('message__header');

    const dateEl = document.createElement('span');
    dateEl.classList.add('message-date');
    dateEl.textContent = date;
    messageHeaderEl.append(dateEl);

    const audio = document.createElement('audio');
    audio.setAttribute('controls', true);
    audio.src = file;

    const title = document.createElement('p');
    title.classList.add('sound__title');
    title.innerText = (info.name) ? info.name : 'No name';

    div.append(messageHeaderEl);
    div.append(audio);
    div.append(title);
    return div;
  }

  /**
   * Создает видео элемент
   * @param {*} data -
   * @returns - html элемент
   */
  static createVideoElement(data) {
    const { date, file, info } = data;
    const div = document.createElement('div');
    div.classList.add('message');
    const messageHeaderEl = document.createElement('div');
    messageHeaderEl.classList.add('message__header');

    const dateEl = document.createElement('span');
    dateEl.classList.add('message-date');
    dateEl.textContent = date;
    messageHeaderEl.append(dateEl);

    const video = document.createElement('video');
    video.setAttribute('controls', true);
    video.src = file;

    const title = document.createElement('p');
    title.classList.add('sound__title');
    title.innerText = info.name;

    div.append(messageHeaderEl);
    div.append(video);
    div.append(title);

    return div;
  }

  /**
   * Создает элемент погоды
   * @param {*} data -
   * @returns - html элемент
   */
  static createWeatherElement(data) {
    // console.log('html', data);
    const {
      location, temp, icon, condition,
    } = data.weather;

    const weather = document.createElement('div');
    weather.classList.add('weather');
    weather.dataset.id = data.id;

    const weatherLogo = document.createElement('div');
    weatherLogo.classList.add('weather__logo');
    const weatherIcon = document.createElement('img');
    weatherIcon.classList.add('weather__icon');
    weatherIcon.src = icon;
    weatherIcon.alt = condition;
    weatherLogo.append(weatherIcon);

    const weatherInfo = document.createElement('div');
    weatherInfo.classList.add('weather__info');
    const weatherRegion = document.createElement('p');
    weatherRegion.textContent = location;
    const weatherTemp = document.createElement('p');
    weatherTemp.classList.add('weather__temp');
    weatherTemp.textContent = temp;
    const span = document.createElement('span');
    span.innerHTML = ' &#176C';
    weatherTemp.append(span);
    const weatherCondition = document.createElement('p');
    weatherCondition.textContent = condition;
    weatherInfo.append(weatherRegion);
    weatherInfo.append(weatherTemp);
    weatherInfo.append(weatherCondition);

    weather.append(weatherLogo);
    weather.append(weatherInfo);
    return weather;
  }

  // static createGeolocationElement(data) {
  //   const { date, message, id } = data;
  //   const messageEl = document.createElement('div');
  //   messageEl.classList.add('message', 'geolocation');
  //   messageEl.dataset.id = id;

  //   const messageHeaderEl = document.createElement('div');
  //   messageHeaderEl.classList.add('message__header');

  //   const dateEl = document.createElement('span');
  //   dateEl.classList.add('message-date');
  //   dateEl.textContent = date;

  //   const messageTextEl = document.createElement('p');
  //   messageTextEl.classList.add('message__text');
  //   messageTextEl.innerText = `Твои координаты: ${message.latitude}, ${message.longitude}`;
  //   messageHeaderEl.append(dateEl);
  //   messageEl.append(messageHeaderEl);
  //   messageEl.append(messageTextEl);
  //   return messageEl;
  // }

  /**
   * Создает элемент новостей
   * @param {*} data -
   * @returns - html элемент
   */
  static createNewsElement(data) {
    const { id, news } = data;
    const newsEl = document.createElement('div');
    newsEl.classList.add('news', 'message');
    newsEl.id = id;

    const title = document.createElement('h4');
    title.classList.add('news__title');
    title.textContent = news.title;
    newsEl.append(title);

    const desc = document.createElement('p');
    desc.classList.add('news__description');
    desc.textContent = news.description;
    newsEl.append(desc);

    const link = document.createElement('a');
    link.href = news.link;
    link.textContent = 'Подробнее...';
    newsEl.append(link);

    return newsEl;
  }
}
