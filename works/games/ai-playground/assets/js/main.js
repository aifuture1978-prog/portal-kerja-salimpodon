/* main.js — titik masuk aplikasi */
import { boot } from './ui.js';

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
