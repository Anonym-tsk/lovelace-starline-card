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

        this._clickTimeouts = {
            left: null,
            center: null,
            right: null
        };

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
        this._hass = hass;
        if (!this.$wrapper) {
            this._render();
        }
        this._update();
    }

    _render() {
        const card = document.createElement('ha-card');
        const style = document.createElement('style');
        card.header = this._config.title || '';
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

        this.$toast = this.$container.querySelector('.toast');
        this.$gsmLevel = this.$container.querySelector('.gsm-lvl');

        this._initHandlers();
        setTimeout(() => {
            this._setSize();
            this.$wrapper.style.opacity = '1';
        }, 10);
    }

    _update() {
        this._setDarkMode();
        this._setAlarmState();
        this._setCarState();
        this._setInfo();
        this._setControls();
    }

    _getState(entity) {
        let state = this._hass.states[this._config.entities[entity]].state;
        if (state === 'on' || state === 'off' || state === 'unlocked' || state === 'locked') {
            return state === 'on' || state === 'locked';
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
        // TODO: Починить отъехавшие картинки
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
        this.$container.classList.toggle('__disarm', !this._getState('security'));
        this.$container.classList.toggle('__key', this._getAttr('engine', 'ignition'));
        this.$container.classList.toggle('__door', this._getState('door'));
        this.$container.classList.toggle('__trunk', this._getState('trunk'));
        this.$container.classList.toggle('__hood', this._getState('hood'));
        this.$container.classList.toggle('__smoke', this._getState('engine'));
        this.$container.classList.toggle('__out', this._getState('out'));
        this.$container.classList.toggle('__webasto', this._getState('webasto'));
        this.$container.classList.toggle('__offline', !this._getAttr('gsm_lvl', 'online'));

        // TODO: Нарисовать состояние датчиков удара и наклона, ручного тормоза
    }

    _setInfo() {
        this.$infoBalance.textContent = this._getState('balance') + ' ' + this._getAttr('balance', 'unit_of_measurement');
        this.$infoBattery.textContent = this._getState('battery') + ' ' + this._getAttr('battery', 'unit_of_measurement');
        this.$infoInner.textContent = this._getState('ctemp') + ' ' + this._getAttr('ctemp', 'unit_of_measurement');
        this.$infoEngine.textContent = this._getState('etemp') + ' ' + this._getAttr('etemp', 'unit_of_measurement');
        this.$gsmLevel.icon = this._getAttr('gsm_lvl', 'icon');
    }

    _setControls() {
        this.$controlLeft.classList.add('control-icon-' + this._config.controls[0]);
        this.$controlLeft.classList.remove('__inprogress');
        this.$controlCenter.classList.add('control-icon-' + this._config.controls[1]);
        this.$controlCenter.classList.remove('__inprogress');
        this.$controlRight.classList.add('control-icon-' + this._config.controls[2]);
        this.$controlRight.classList.remove('__inprogress');
    }

    _initHandlers() {
        this.$controlLeft.addEventListener('click', this._onClick.bind(this, 'left', this.$controlLeft));
        this.$controlCenter.addEventListener('click', this._onClick.bind(this, 'center', this.$controlCenter));
        this.$controlRight.addEventListener('click', this._onClick.bind(this, 'right', this.$controlRight));
        window.addEventListener('resize', this._setSize.bind(this));
    }

    _onClick(position, $element) {
        let _showToast = () => {
            this.$toast.style.opacity = '1';
            setTimeout(() => {
                this.$toast.style.opacity = '0';
            }, 2000);
        };

        let _stopTimeout = () => {
            clearTimeout(this._clickTimeouts[position]);
            this._clickTimeouts[position] = null;
        };

        let _startTimeout = () => {
            this._clickTimeouts[position] = setTimeout(() => {
                _stopTimeout();
                _showToast();
            }, 500);
        };

        let _run = () => {
            let btn = null;
            switch (position) {
                case 'left':
                    btn = this._config.controls[0];
                    break;
                case 'center':
                    btn = this._config.controls[1];
                    break;
                case 'right':
                    btn = this._config.controls[2];
                    break;
            }

            let entity, event, action, state;
            switch (btn) {
                case 'arm':
                    entity = 'security';
                    event = 'lock';
                    action = this._getState(entity) ? 'unlock' : 'lock';
                    break;
                case 'ign':
                    entity = 'engine';
                    event = 'switch';
                    action = this._getState(entity) ? 'turn_off' : 'turn_on';
                    break;
                case 'webasto':
                    entity = 'webasto';
                    event = 'switch';
                    action = this._getState(entity) ? 'turn_off' : 'turn_on';
                    break;
                case 'out':
                    entity = 'out';
                    event = 'switch';
                    action = this._getState(entity) ? 'turn_off' : 'turn_on';
                    break;
            }

            if (entity) {
                $element.classList.add('__inprogress');
                this._hass.callService(event, action, {
                    entity_id: this._config.entities[entity]
                });
            }
        };

        if (this._clickTimeouts[position]) {
            _stopTimeout();
            _run();
        } else {
            _startTimeout();
        }
    }

    _setSize() {
        let width = this.$wrapper.clientWidth,
            classList = this.$wrapper.classList;
        classList.remove('__w07', '__w08', '__w09');
        classList.toggle('__title', !!this._config.title);
        if (width >= 440) {
            classList.add('__w09');
        } else if (width >= 370) {
            classList.add('__w08');
        } else {
            classList.add('__w07');
        }
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
        this._config.title = config.title;
    }

    getCardSize() {
        return 3;
    }
}

customElements.define('starline-card', StarlineCard);