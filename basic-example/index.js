// Import stylesheets
import './style.css';

import { RatingsComponent } from './rating-widget.js'

const container = document.querySelector('.ratings-wrapper');
const instance = new RatingsComponent();
instance.init(container);