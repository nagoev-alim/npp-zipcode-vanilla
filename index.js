// ⚡️ Import Styles
import './style.scss';
import feather from 'feather-icons';
import mock from './data/mock.js';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { showNotification } from './modules/showNotification.js';
import axios from 'axios';
import pinIco from './assets/images/pin.svg';

// ⚡️ Render Skeleton
document.querySelector('#app').innerHTML = `
<div class='app-container'>
  <div class='zipcode'>
    <h2>ZipCode App</h2>
    <form data-form=''>
      <select name='source'>
        <option value=''>Select Country</option>
        ${mock.map(({ name, value }) => `<option value='${value}'>${name}</option>`).join('')}
      </select>
      <input type='text' name='zip' placeholder='Zip Code'>
      <button type='submit' data-submit=''>Submit</button>
    </form>
    <div class='result hidden' data-target=''>
      <div class='info'></div>
      <div class='map' data-map=''></div>
    </div>
  </div>

  <a class='app-author' href='https://github.com/nagoev-alim' target='_blank'>${feather.icons.github.toSvg()}</a>
</div>
`;

// ⚡️Create Class
class App {
  constructor() {
    this.DOM = {
      form: document.querySelector('[data-form]'),
      formBtn: document.querySelector('[data-submit]'),
      target: document.querySelector('[data-target]'),
      map: document.querySelector('[data-map]'),
    };

    this.PROPS = {
      axios: axios.create({
        baseURL: 'https://api.zippopotam.us/',
      }),
      map: L.map(this.DOM.map, {
        center: [51.505, -0.09],
        zoom: 13,
      }),
      marker: L.icon({
        iconUrl: pinIco,
        iconSize: [30, 40],
      }),
    };

    this.mapConfig();

    this.DOM.form.addEventListener('submit', this.onSubmit);
  }

  /**
   * @function onSubmit - Form submit handler
   * @param event
   */
  onSubmit = (event) => {
    event.preventDefault();
    const form = event.target;
    const { source, zip } = Object.fromEntries(new FormData(form).entries());

    if (!source || !zip) {
      showNotification('warning', 'Please select country and enter zipcode');
      return;
    }

    this.fetchData({ source, zip });
  };

  /**
   * @function fetchData - Fetch data from API
   * @param source
   * @param zip
   * @returns {Promise<void>}
   */
  fetchData = async ({ source, zip }) => {
    try {
      const { data: { places } } = await this.PROPS.axios(`${source}/${zip}`);
      const { latitude, longitude, state, ['place name']: placeName } = places[0];
      this.renderData({ latitude, longitude, state, placeName });
    } catch (e) {
      console.log(e);
      showNotification('danger', 'Something wrong, look console :(');
      return;
    }
  };

  /**
   * @function renderData - Render result HTML
   * @param text
   */
  renderData = ({ latitude, longitude, state, placeName }) => {

    this.mapUpdate(latitude, longitude);

    if (this.DOM.target.classList.contains('hidden')) {
      this.DOM.target.classList.remove('hidden');
    }

    this.DOM.target.querySelector('.info').innerHTML = `
      <h5>About Place</h5>
      <div>
        <p>
          <span>Latitude:</span>
          <span>${latitude}</span>
        </p>
        <p>
          <span>Longitude:</span>
          <span>${longitude}</span>
        </p>
        <p>
          <span>State:</span>
          <span>${state}</span>
        </p>
        <p>
          <span>Place Name:</span>
          <span>${placeName}</span>
        </p>
      </div>
    `;
  };

  /**
   * @function mapConfig - Config map plugin
   */
  mapConfig = () => {
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(this.PROPS.map);
    L.marker([51.505, -0.09], { icon: this.PROPS.marker }).addTo(this.PROPS.map);
  };

  /**
   * @function mapUpdate - Update map latitude and longitude
   * @param latitude
   * @param longitude
   */
  mapUpdate = (latitude, longitude) => {
    this.PROPS.map.setView([latitude, longitude], 8, { animation: true });
    L.marker([latitude, longitude], { icon: this.PROPS.marker }).addTo(this.PROPS.map);
  };
}

// ⚡️Class instance
new App();
