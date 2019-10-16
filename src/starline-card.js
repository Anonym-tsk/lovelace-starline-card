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

        this.$wrapper = null;
        this.$container = null;

        this.$car = null;
        this.$security = null;

        this.$controls = null;
        this.$controlLeft = null;
        this.$controlCenter = null;
        this.$controlRight = null;

        this.$info = null;
        this.$infoBalance = null;
        this.$infoBattery = null;
        this.$infoInner = null;
        this.$infoEngine = null;

        this.$toast = null;
        this.$gsmLevel = null;
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

        this.$car = this.$wrapper.querySelector('.car-cnt');
        this.$security = this.$wrapper.querySelector('.car-security');

        this.$controls = this.$wrapper.querySelector('.controls');
        this.$controlLeft = this.$controls.querySelector('.control-left');
        this.$controlCenter = this.$controls.querySelector('.control-center');
        this.$controlRight = this.$controls.querySelector('.control-right');

        this.$info = this.$wrapper.querySelector('.info');
        this.$infoBalance = this.$info.querySelector('.info-balance');
        this.$infoBattery = this.$info.querySelector('.info-battery');
        this.$infoInner = this.$info.querySelector('.info-inner');
        this.$infoEngine = this.$info.querySelector('.info-engine');

        this.$toast = this.$container.querySelector('.toast');
        this.$gsmLevel = this.$container.querySelector('.gsm-lvl');

        if (this._hass.language === 'ru') {
            // Ugly?
            this.$toast.textContent = 'Нажмите дважды для выполнения';
        }

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
        const states = {
            '__disarm': this._getState('security'),
            '__key': this._getAttr('engine', 'ignition'),
            '__door': this._getState('door'),
            '__trunk': this._getState('trunk'),
            '__hood': this._getState('hood'),
            '__smoke': this._getState('engine'),
            '__out': this._getState('out'),
            '__webasto': this._getState('webasto'),
            '__hbrake': this._getState('hbrake'),
            '__offline': this._getAttr('gsm_lvl', 'online'),
        };

        Object.keys(states).forEach((className) => {
            let state = states[className];
            if (className === '__offline') {
                this.$container.classList.toggle(className, !state);
            } else if (state !== null) {
                if (className === '__disarm') {
                    state = !state
                }
                this.$container.classList.toggle(className, state);
            }
        });
    }

    _setInfo() {
        const balance = this._getState('balance'),
            battery = this._getState('battery'),
            ctemp = this._getState('ctemp'),
            etemp = this._getState('etemp'),
            gsm_lvl = this._getState('gsm_lvl');

        if (balance !== null) {
            this.$infoBalance.textContent = balance + ' ' + this._getAttr('balance', 'unit_of_measurement');
        }
        if (battery !== null) {
            this.$infoBattery.textContent = battery + ' ' + this._getAttr('battery', 'unit_of_measurement');
        }
        if (ctemp !== null) {
            this.$infoInner.textContent = ctemp + ' ' + this._getAttr('ctemp', 'unit_of_measurement');
        }
        if (etemp !== null) {
            this.$infoEngine.textContent = etemp + ' ' + this._getAttr('etemp', 'unit_of_measurement');
        }
        this.$gsmLevel.icon = gsm_lvl ? this._getAttr('gsm_lvl', 'icon') : 'mdi:signal-off';
    }

    _setControls() {
        this.$controlLeft.classList.add('control-icon-' + this._config.controls[0]);
        this.$controlCenter.classList.add('control-icon-' + this._config.controls[1]);
        this.$controlRight.classList.add('control-icon-' + this._config.controls[2]);
        this._stopBtnProgress();
    }

    _initHandlers() {
        this.$infoBalance.addEventListener('click', () => this._moreInfo('balance'));
        this.$infoBattery.addEventListener('click', () => this._moreInfo('battery'));
        this.$infoInner.addEventListener('click', () => this._moreInfo('ctemp'));
        this.$infoEngine.addEventListener('click', () => this._moreInfo('etemp'));

        this.$car.addEventListener('click', () => this._moreInfo('engine'));
        this.$security.addEventListener('click', () => this._moreInfo('security'));
        this.$gsmLevel.addEventListener('click', () => this._moreInfo('gsm_lvl'));

        this.$controlLeft.addEventListener('click', () => this._onClick('left', this.$controlLeft));
        this.$controlCenter.addEventListener('click', () => this._onClick('center', this.$controlCenter));
        this.$controlRight.addEventListener('click', () => this._onClick('right', this.$controlRight));

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

        this._fireEvent('haptic', 'light');
    }

    _startBtnProgress($element, timeout) {
        $element.classList.add('__inprogress');
        clearTimeout(this._inProgressTimeout);
        this._inProgressTimeout = setTimeout(() => this._stopBtnProgress(), timeout);
    }

    _stopBtnProgress() {
        const CLS = '__inprogress';
        let hadClass = false;

        clearTimeout(this._inProgressTimeout);
        this._inProgressTimeout = null;

        if (this.$controlLeft.classList.contains(CLS)) {
            this.$controlLeft.classList.remove(CLS);
            hadClass = true;
        }
        if (this.$controlCenter.classList.contains(CLS)) {
            this.$controlCenter.classList.remove(CLS);
            hadClass = true;
        }
        if (this.$controlRight.classList.contains(CLS)) {
            this.$controlRight.classList.remove(CLS);
            hadClass = true;
        }

        if (hadClass) {
            this._fireEvent('haptic', 'warning');
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

    _moreInfo(entity) {
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