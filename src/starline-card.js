class StarlineCard extends HTMLElement {
    constructor() {
        super();

        this._config = {
            controls: ['arm', 'ign', 'webasto', 'out'],
            entities: {
                'battery': 'Battery',
                'balance': 'Balance',
                'ctemp': 'Interior Temperature',
                'etemp': 'Engine Temperature',
                'gsm_lvl': 'GSM Signal Level',
                'hbrake': 'Hand Brake',
                'hood': 'Hood',
                'trunk': 'Trunk',
                'alarm': 'Alarm Status',
                'door': 'Doors Status',
                'engine': 'Engine',
                'webasto': 'Heater',
                'out': 'Additional Channel',
                'security': 'Security',
                'location': 'Location'
            },
            dark: false
        };
        this._hass = {};

        this.$wrapper = null;
        this.$container = null;

        this.$controls = null;
        this.$controlLeft = null;
        this.$controlCenter = null;
        this.$controlRight = null;

        this.$info = null;
        this.$infoBalance = null;
        this.$infoBattery = null;
        this.$infoInner = null;
        this.$infoEngine = null;
    }

    set hass(hass) {
        console.warn(hass);
        this._hass = hass;
        if (!this.$wrapper) {
            this._render();
        }

        const entityId = this._config.entity;
        const state = hass.states[entityId];
        const stateStr = state ? state.state : 'unavailable';
    }

    _render() {
        const card = document.createElement('ha-card');
        const style = document.createElement('style');
        card.header = this._config.title || 'StarLine';
        style.textContent = `{%css%}`;
        card.innerHTML = `{%html%}`;
        card.appendChild(style);
        this.appendChild(card);

        this.$wrapper = card.querySelector('.wrapper');
        this.$container = card.querySelector('.container');

        this.$controls = card.querySelector('.controls');
        this.$controlLeft = this.$controls.querySelector('.control-left');
        this.$controlCenter = this.$controls.querySelector('.control-center');
        this.$controlRight = this.$controls.querySelector('.control-right');

        this.$info = card.querySelector('.info');
        this.$infoBalance = this.$info.querySelector('.info-balance');
        this.$infoBattery = this.$info.querySelector('.info-battery');
        this.$infoInner = this.$info.querySelector('.info-inner');
        this.$infoEngine = this.$info.querySelector('.info-engine');

        this._setDarkMode();
        this._setAlarmState();
        this._setCarState();
        this._setInfo();
        this._setControls();
    }

    _getState(entity) {
        let state = this._hass.states[this._config.entities[entity]].state;
        if (state === 'on' || state === 'off') {
            return state === 'on';
        }
        if (state) {
            return state;
        }
        return 'unavailable';
    }

    _getAttr(entity, name) {
        return this._hass.states[this._config.entities[entity]].attributes[name];
    }

    _setDarkMode() {
        this.$wrapper.classList.toggle('__dark', this._config.dark);
    }

    _setAlarmState() {
        let states = this._hass.states[this._config.entities.security].attributes;
        for (let name in states) {
            if (states.hasOwnProperty(name) && name !== 'friendly_name' && name !== 'icon') {
                this.$container.classList.toggle('__alarm_' + name, states[name]);
            }
        }
        this.$container.classList.toggle('__alarm', this._getState('alarm'));
    }

    _setCarState() {
        this.$container.classList.toggle('__arm', this._getState('security'));
        this.$container.classList.toggle('__key', this._getAttr('engine', 'ignition'));
        this.$container.classList.toggle('__door', this._getState('door'));
        this.$container.classList.toggle('__trunk', this._getState('trunk'));
        this.$container.classList.toggle('__hood', this._getState('hood'));
        this.$container.classList.toggle('__smoke', this._getState('engine'));
        this.$container.classList.toggle('__out', this._getState('out'));
        this.$container.classList.toggle('__webasto', this._getState('webasto'));
    }

    _setInfo() {
        this.$infoBalance.textContent = this._getState('balance') + ' ' + this._getAttr('balance', 'unit_of_measurement');
        this.$infoBattery.textContent = this._getState('battery') + ' ' + this._getAttr('battery', 'unit_of_measurement');
        this.$infoInner.textContent = this._getState('ctemp') + ' ' + this._getAttr('ctemp', 'unit_of_measurement');
        this.$infoEngine.textContent = this._getState('etemp') + ' ' + this._getAttr('etemp', 'unit_of_measurement');
    }

    _setControls() {
        // const controls = ['arm', 'ign', 'webasto', 'out'];
        this.$controlLeft.classList.add('control-icon-' + this._config.controls[0] || 'arm');
        this.$controlCenter.classList.add('control-icon-' + this._config.controls[1] || 'ign');
        this.$controlRight.classList.add('control-icon-' + this._config.controls[2] || 'webasto');
    }

    setConfig(config) {
        Object.keys(this._config.entities).forEach((key) => {
            if (!config.entities[key]) {
                throw new Error('You need to define an entity: ' + this._config.entities[key]);
            }
        });

        Object.assign(this._config.entities, config.entities);
        if (config.controls) {
            Object.assign(this._config.controls, config.controls);
        }
        this._config.dark = !!config.dark;
    }

    getCardSize() {
        return 2;
    }
}

customElements.define('starline-card', StarlineCard);