import './styles/main.css';
import { App } from './components/App.js';

const root = document.getElementById('app');
const app = new App(root);
app.mount();
