import './styles/main.css';
import { App } from './components/App.js';

// Mobile viewport height fix: tracks real visible area (excludes browser chrome & keyboard)
function setAppHeight() {
  const h = window.visualViewport?.height ?? window.innerHeight;
  document.documentElement.style.setProperty('--app-height', `${h}px`);
}
setAppHeight();
window.visualViewport?.addEventListener('resize', setAppHeight);
window.addEventListener('resize', setAppHeight);

const root = document.getElementById('app');
const app = new App(root);
app.mount();
