'use strict';

// prettier-ignore

let map, mapEvent;

class workouts {
    date = new Date();
    id = (Date.now() + ' ').slice(-10);

    constructor(coords, distance, duration) {
        this.coords = coords;
        this.distance = distance;
        this.duration = duration;
    }
    _setDescription() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
            'August', 'September', 'October', 'November', 'December'];

        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)}
         on${this.date.getMonth()} ${this.date.getDate()} `;
    }
}
class running extends workouts {
    type = 'running';

    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.clacPace();
        this._setDescription();

    }
    clacPace() {
        // min/km
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}

class cycling extends workouts {
    type = 'cycling';

    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        this.calcSpeed();
        this._setDescription();
    }

    calcSpeed() {
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
}

// const run1 = new running([39, -12], 5.2, 24, 178);
// const cycling1 = new cycling([39, -12], 27, 95, 523);
// console.log(run1, cycling1)
// -----------------------------------------------------------------
// APPLICATION ARCHITECTURE

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
class App {
    #map;
    #mapEvent;
    #workout;
    constructor() {
        this.#workout = [];
        this._getPosition()
        form.addEventListener('submit', this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleElevationField);
    }

    _getPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function () {
                alert(`Coudn't get you location`);
            })
        }
    }

    _loadMap(position) {
        console.log(position);
        const { latitude } = position.coords;
        const { longitude } = position.coords;
        console.log(latitude);
        console.log(longitude);
        console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
        const storePosition = [];
        storePosition.push({ latitude });
        storePosition.push({ longitude });
        console.log(storePosition);

        const coords = [latitude, longitude];
        //Code from  Leaf Leat Libirary
        // Used for implementing a MAP
        // The CODE below will only be executed if the HTML code contails LeafLeat Libiraiy
        this.#map = L.map('map').setView(coords, /* ZOOM*/ 13);

        //DARK MAP THEME
        // basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png
        //tile.openstreetmap.fr/hot/{z}/{x}/{y}.png' light map

        L.tileLayer('https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);
        L.marker(coords).addTo(this.#map)
            .bindPopup('Your Current Location!')
            .openPopup();

        //Adding event listener to the map
        this.#map.on('click', this._showForm.bind(this));
    }

    _showForm(mapE) {
        this.#mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();
    }

    _toggleElevationField() {
        inputType.addEventListener('change', function () {
            inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
            inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
        });;
    }


    _newWorkout(e) {
        const validInputs = (...input) => input.every(inp => Number.isFinite(inp));
        e.preventDefault();

        // Get data from Form
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const { lat, lng } = this.#mapEvent.latlng;

        let workout;
        // if workout running , create running object
        if (type === 'running') {
            // Check if data is valid
            const cadence = +inputCadence.value;
            if (!validInputs(distance, duration, cadence)) {
                return alert('Inputs have to be POSITIVE numbers!');
            }
            workout = new running([lat, lng], distance, duration, cadence);
        }
        if (type === 'cycling') {
            // Check if data is valid
            const elevation = +inputElevation.value;
            if (!validInputs(distance, duration, elevation)) {
                return alert('Inputs have to be POSITIVE numbers!');
            }
            workout = new cycling([lat, lng], distance, duration, elevation);
        }
        this.#workout.push(workout);
        console.log(workout);
        this._renderWorkoutMarker(workout);

        this._renderWorkout(workout);
        // if workout cycling , create cycling object
        inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = ' ';
    }
    // Add new object to workout array

    _renderWorkoutMarker(workout) {
        L.marker(workout.coords).addTo(this.#map)
            .bindPopup(
                L.popup({
                    // ---- These all properties are of LeafLet and do not exist in JS ----
                    maxWidth: 250,
                    minWidth: 100,
                    autoClose: false,
                    closeOnClick: false,
                    // -- Here the class is taken from the CSS --
                    className: `${workout.type}-popup`,
                })
            )
            .setPopupContent('Workout')
            .openPopup();
    }

    _renderWorkout(workout) {
        let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}
    </span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div >
    <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">min</span>
    </div>
`;
        if (workout.type === 'running') {
            html += `
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>`;
        }
        if (workout.type === 'cycling') {
            html += `
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>`;
        }
        form.insertAdjacentHTML('afterend', html);
    }
}


const app = new App();

