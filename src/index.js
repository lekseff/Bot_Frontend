import './css/style.css';
import Bot from './js/App';

const markup = document.querySelector('#bot');
const app = new Bot(markup);
app.init();
