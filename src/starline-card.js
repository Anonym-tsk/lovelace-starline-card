class StarlineCard extends HTMLElement {
    constructor() {
        super();

        this._config = {
            controls: ['arm', 'ign', 'horn', 'webasto', 'out'],
            entities: {
                'battery': 'Battery',
                'balance': 'Balance',
                'ctemp': 'Interior Temperature',
                'etemp': 'Engine Temperature',
                'gsm_lvl': 'GSM Signal Level',
                'hbrake': 'Hand Brake',
                'hood': 'Hood',
                'horn': 'Horn',
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
        this._inProgressTimeout = null;

        this._info = {
            balance: {
                element: null,
                value: null
            },
            battery: {
                element: null,
                value: null
            },
            ctemp: {
                element: null,
                value: null
            },
            etemp: {
                element: null,
                value: null
            }
        };
        this._gsm_lvl = {
            element: null,
            value: null
        };
        this._controls = {
            security: null,
            engine: null,
            out: null,
            webasto: null
        };

        this.$wrapper = null;
        this.$container = null;

        this.$car = null;
        this.$security = null;

        this.$controlLeft = null;
        this.$controlCenter = null;
        this.$controlRight = null;

        this.$toast = null;
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
        this.$container = this.$wrapper.querySelector('.container');

        this.$car = this.$container.querySelector('.car-cnt');
        this.$security = this.$container.querySelector('.car-security');

        this.$controlLeft = this.$container.querySelector('.control-left');
        this.$controlCenter = this.$container.querySelector('.control-center');
        this.$controlRight = this.$container.querySelector('.control-right');

        this._info.balance.element = this.$wrapper.querySelector('.info-balance');
        this._info.battery.element = this.$wrapper.querySelector('.info-battery');
        this._info.ctemp.element = this.$wrapper.querySelector('.info-inner');
        this._info.etemp.element = this.$wrapper.querySelector('.info-engine');

        this._gsm_lvl.element = this.$wrapper.querySelector('.gsm-lvl');

        this.$toast = this.$wrapper.querySelector('.toast');

        if (this._hass.language === 'ru') {
            // Ugly?
            this.$toast.textContent = 'Нажмите дважды для выполнения';
        }

        this._setControls();
        this._initHandlers();
        setTimeout(() => {
            this.$wrapper.style.opacity = '1';
        }, 10);
    }

    _update() {
        this._setDarkMode();
        this._setHasTitle();
        this._setAlarmState();
        this._setCarState();
        this._setInfo();
    }

    _getState(entity_id) {
        let entity = this._hass.states[this._config.entities[entity_id]],
            state = entity ? entity.state : 'unavailable';
        if (state === 'on' || state === 'off' || state === 'unlocked' || state === 'locked') {
            return state === 'on' || state === 'locked';
        }
        if (state !== 'unavailable') {
            return state;
        }
        return null;
    }

    _getAttr(entity_id, name) {
        let entity = this._hass.states[this._config.entities[entity_id]];
        if (!entity || !entity.attributes.hasOwnProperty(name)) {
            return null;
        }
        return entity.attributes[name];
    }

    _setDarkMode() {
        this.$wrapper.classList.toggle('__dark', this._config.dark);
    }

    _setHasTitle() {
        this.$wrapper.classList.toggle('__title', !!this._config.title);
    }

    _setAlarmState() {
        let entity = this._hass.states[this._config.entities.security],
            states = entity ? entity.attributes : {};
        for (let name in states) {
            if (states.hasOwnProperty(name) && name !== 'friendly_name' && name !== 'icon') {
                this.$container.classList.toggle('__alarm_' + name, states[name]);
            }
        }
        this.$container.classList.toggle('__alarm', this._getState('alarm'));
    }

    _setCarState() {
        const controls = {
            security: this._getState('security'),
            engine: this._getState('engine'),
            out: this._getState('out'),
            webasto: this._getState('webasto')
        };

        const states = {
            '__arm': controls.security,
            '__key': this._getAttr('engine', 'ignition'),
            '__door': this._getState('door'),
            '__trunk': this._getState('trunk'),
            '__hood': this._getState('hood'),
            '__smoke': controls.engine,
            '__out': controls.out,
            '__webasto': controls.webasto,
            '__hbrake': this._getState('hbrake'),
            '__offline': this._getAttr('gsm_lvl', 'online'),
        };

        Object.keys(states).forEach((className) => {
            let state = states[className];
            if (className === '__offline') {
                this.$container.classList.toggle(className, !state);
            } else if (state !== null) {
                this.$container.classList.toggle(className, state);
            }
        });

        let carStateChanged = false;
        Object.keys(controls).forEach((key) => {
            if (controls[key] !== null && controls[key] !== this._controls[key]) {
                this._controls[key] = controls[key];
                carStateChanged = true;
            }
        });

        if (carStateChanged) {
            this._stopBtnProgress();
        }
    }

    _setInfo() {
        Object.keys(this._info).forEach((key) => {
            const state = this._getState(key);
            if (state !== null && state !== this._info[key].value) {
                this._info[key].value = state;
                this._info[key].element.textContent = state + ' ' + this._getAttr(key, 'unit_of_measurement');
            }
        });

        const gsm_lvl = this._getState('gsm_lvl');
        if (gsm_lvl !== this._gsm_lvl.value) {
            this._gsm_lvl.value = gsm_lvl;
            this._gsm_lvl.element.icon = gsm_lvl ? this._getAttr('gsm_lvl', 'icon') : 'mdi:signal-off';
        }
    }

    _setControls() {
        this.$controlLeft.classList.add('control-icon-' + this._config.controls[0]);
        this.$controlCenter.classList.add('control-icon-' + this._config.controls[1]);
        this.$controlRight.classList.add('control-icon-' + this._config.controls[2]);
    }

    _initHandlers() {
        Object.keys(this._info).forEach((key) => {
            this._info[key].element.addEventListener('click', () => this._moreInfo(key));
        });

        this._gsm_lvl.element.addEventListener('click', () => this._moreInfo('gsm_lvl'));

        this.$car.addEventListener('click', () => this._moreInfo('engine'));
        this.$security.addEventListener('click', () => this._moreInfo('security'));

        this.$controlLeft.addEventListener('click', () => this._onClick('left', this.$controlLeft));
        this.$controlCenter.addEventListener('click', () => this._onClick('center', this.$controlCenter));
        this.$controlRight.addEventListener('click', () => this._onClick('right', this.$controlRight));
    }

    _onClick(position, $element) {
        this._fireEvent('haptic', 'light');

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
                case 'horn':
                    entity = 'horn';
                    event = 'switch';
                    action = 'turn_on';
                    break;
            }

            if (entity) {
                // У "сигнала" нет стейта, поэтому ждем меньше
                this._startBtnProgress($element, entity === 'horn' ? 5000 : 30000);
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

    _startBtnProgress($element, timeout) {
        $element.classList.add('__inprogress');
        clearTimeout(this._inProgressTimeout);
        this._inProgressTimeout = setTimeout(() => this._stopBtnProgress(), timeout);
    }

    _stopBtnProgress() {
        clearTimeout(this._inProgressTimeout);
        this._inProgressTimeout = null;

        this.$controlLeft.classList.remove('__inprogress');
        this.$controlCenter.classList.remove('__inprogress');
        this.$controlRight.classList.remove('__inprogress');

        this._fireEvent('haptic', 'success');
    }

    _moreInfo(entity) {
        this._fireEvent('haptic', 'light');
        this._fireEvent('hass-more-info', {
            entityId: this._config.entities[entity]
        });
    }

    _fireEvent(type, detail) {
        const event = new Event(type, {
            bubbles: true,
            cancelable: false,
            composed: true
        });
        event.detail = detail || {};
        this.$wrapper.dispatchEvent(event);
        return event;
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