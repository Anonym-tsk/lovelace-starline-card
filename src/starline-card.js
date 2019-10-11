class StarlineCard extends HTMLElement {
    constructor() {
        super();

        this._config = {};

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
        if (!this.$wrapper) {
            this._render();
        }

        const entityId = this._config.entity;
        const state = hass.states[entityId];
        console.warn(hass);
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
    }

    setConfig(config) {
        const entity_types = {
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
        };

        Object.keys(entity_types).forEach((key) => {
            if (!config[key]) {
                throw new Error('You need to define an entity: ' + entity_types[key]);
            }
        });

        this._config = config;
    }

    // The height of your card. Home Assistant uses this to automatically
    // distribute all cards over the available columns.
    getCardSize() {
        return 3;
    }
}

customElements.define('starline-card', StarlineCard);