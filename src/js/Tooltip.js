import { createPopper } from '@popperjs/core';

export default class Tooltip {
  constructor(container) {
    this.tooltip = container;
    this.errorTooltip = this.tooltip.querySelector('.error-tooltip');
  }

  showMessage(element, text) {
    const popperInstance = createPopper(element, this.errorTooltip, {
      placement: 'top',
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 6],
          },
        },
      ],
    });
    this.errorTooltip.querySelector('.error-message').textContent = text;
    this.errorTooltip.setAttribute('data-show', '');
    popperInstance.update();
    setTimeout(() => {
      this.errorTooltip.removeAttribute('data-show');
    }, 2500);
  }
}
