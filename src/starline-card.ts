declare type ConfigEntity = 'battery' | 'balance' | 'ctemp' | 'etemp'
    | 'gps' | 'gsm_lvl' | 'hbrake' | 'hood' | 'horn' | 'trunk'
    | 'alarm' | 'door' | 'engine' | 'webasto' | 'out' | 'security'
    | 'location' | 'handsfree' | 'neutral' | 'moving_ban';

declare type ConfigInfo = 'balance' | 'battery' | 'ctemp' | 'etemp' | 'gps'; // TODO: Extract?

declare type ConfigControls = 'arm' | 'ign' | 'horn' | 'webasto' | 'out'; // TODO: Extract?

declare interface Config {
    title?: string;
    controls: ConfigControls[];
    info: ConfigInfo[];
    entities?: {[key in ConfigEntity]: string};
    entity_id?: string;
    device_id?: string;
    dark?: boolean;
}

declare interface UIElement {
    element: HTMLElement & {icon?: string} | null;
    value?: StateValue | null;
}

declare type ClickPosition = 'left' | 'center' | 'right';

const STARLINE_ENTITIES: {[key in ConfigEntity]: {name: string, required: boolean, regex: RegExp}} = {
    'battery': {
        name: 'Battery',
        required: true,
        regex: /^sensor\.(.+)_battery(_[0-9]+)?$/,
    },
    'balance': {
        name: 'Balance',
        required: true,
        regex: /^sensor\.(.+)_balance(_[0-9]+)?$/,
    },
    'ctemp': {
        name: 'Interior Temperature',
        required: true,
        regex: /^sensor\.(.+)_interior_temperature(_[0-9]+)?$/,
    },
    'etemp': {
        name: 'Engine Temperature',
        required: true,
        regex: /^sensor\.(.+)_engine_temperature(_[0-9]+)?$/,
    },
    'gps': {
        name: 'GPS Satellites',
        required: false,
        regex: /^sensor\.(.+)_gps_satellites(_[0-9]+)?$/,
    },
    'gsm_lvl': {
        name: 'GSM Signal Level',
        required: true,
        regex: /^sensor\.(.+)_gsm_signal(_[0-9]+)?$/,
    },
    'hbrake': {
        name: 'Hand Brake',
        required: false,
        regex: /^binary_sensor\.(.+)_hand_brake(_[0-9]+)?$/,
    },
    'hood': {
        name: 'Hood',
        required: true,
        regex: /^binary_sensor\.(.+)_hood(_[0-9]+)?$/,
    },
    'horn': {
        name: 'Horn',
        required: true,
        regex: /^(button|switch)\.(.+)_horn(_[0-9]+)?$/,
    },
    'trunk': {
        name: 'Trunk',
        required: true,
        regex: /^binary_sensor\.(.+)_trunk(_[0-9]+)?$/,
    },
    'alarm': {
        name: 'Alarm Status',
        required: true,
        regex: /^binary_sensor\.(.+)_alarm(_[0-9]+)?$/,
    },
    'door': {
        name: 'Doors Status',
        required: true,
        regex: /^binary_sensor\.(.+)_doors(_[0-9]+)?$/,
    },
    'engine': {
        name: 'Engine',
        required: true,
        regex: /^switch\.(.+)_engine(_[0-9]+)?$/,
    },
    'webasto': {
        name: 'Heater',
        required: false,
        regex: /^switch\.(.+)_webasto(_[0-9]+)?$/,
    },
    'out': {
        name: 'Additional Channel',
        required: false,
        regex: /^switch\.(.+)_additional_channel(_[0-9]+)?$/,
    },
    'security': {
        name: 'Security',
        required: true,
        regex: /^lock\.(.+)_security(_[0-9]+)?$/,
    },
    'location': {
        name: 'Location',
        required: true,
        regex: /^device_tracker\.(.+)_location(_[0-9]+)?$/,
    },
    'handsfree': {
        name: 'Handsfree',
        required: false,
        regex: /^binary_sensor\.(.+)_handsfree(_[0-9]+)?$/,
    },
    'neutral': {
        name: 'Programmable neutral',
        required: false,
        regex: /^binary_sensor\.(.+)_programmable_neutral(_[0-9]+)?$/,
    },
    'moving_ban': {
        name: 'Moving ban',
        required: false,
        regex: /^binary_sensor\.(.+)_moving_ban(_[0-9]+)?$/,
    },
};

class StarlineCard extends HTMLElement {
    private _config: Config = {
        controls: ['arm', 'ign', 'horn', 'webasto', 'out'],
        info: ['balance', 'battery', 'ctemp', 'etemp', 'gps'],
        dark: false
    };

    private _hass: Hass | null = null;

    private _clickTimeouts: {[key in ClickPosition]: number | null} = {
        left: null,
        center: null,
        right: null
    };

    private _inProgressTimeout: number | null = null;

    private _info: {[key in ConfigInfo]: UIElement} = {
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
        },
        gps: {
            element: null,
            value: null
        }
    };

    private _gsm_lvl: UIElement = {
        element: null,
        value: null
    };

    private _handsfree: UIElement = {
        element: null
    };

    private _neutral: UIElement = {
        element: null
    };

    private _moving_ban: UIElement = {
        element: null
    };

    private _controls: {[key: string]: StateValue | null} = {
        security: null,
        engine: null,
        out: null,
        webasto: null
    };

    private $wrapper: HTMLElement | null = null;
    private $container: HTMLElement | null = null;

    private $car: HTMLElement | null = null;
    private $security: HTMLElement | null = null;

    private $controlLeft: HTMLElement | null = null;
    private $controlCenter: HTMLElement | null = null;
    private $controlRight: HTMLElement | null = null;

    private $toast: HTMLElement | null = null;

    constructor() {
        super();
    }

    set hass(hass: Hass) {
        this._hass = hass;
        this._updateEntitiesConfig();

        if (!this.$wrapper) {
            this._render();
        }

        this._update();
    }

    _render(): void {
        const card = document.createElement('ha-card') as HTMLElement & { header: string };
        const style = document.createElement('style');
        card.header = this._config.title || '';
        style.textContent = `{%css%}`;
        card.innerHTML = `{%html%}`;
        card.appendChild(style);
        this.appendChild(card);

        this.$wrapper = card.querySelector<HTMLElement>('.wrapper')!;
        this.$container = this.$wrapper.querySelector<HTMLElement>('.container')!;

        this.$car = this.$container.querySelector<HTMLElement>('.car-cnt')!;
        this.$security = this.$container.querySelector<HTMLElement>('.car-security')!;

        this.$controlLeft = this.$container.querySelector<HTMLElement>('.control-left')!;
        this.$controlCenter = this.$container.querySelector<HTMLElement>('.control-center')!;
        this.$controlRight = this.$container.querySelector<HTMLElement>('.control-right')!;

        this._info.balance.element = this.$wrapper.querySelector<HTMLElement>('.info-balance')!;
        this._info.battery.element = this.$wrapper.querySelector<HTMLElement>('.info-battery')!;
        this._info.ctemp.element = this.$wrapper.querySelector<HTMLElement>('.info-inner')!;
        this._info.etemp.element = this.$wrapper.querySelector<HTMLElement>('.info-engine'!);
        this._info.gps.element = this.$wrapper.querySelector<HTMLElement>('.info-gps')!;

        this._gsm_lvl.element = this.$wrapper.querySelector<HTMLElement>('.gsm-lvl')!;
        this._handsfree.element = this.$wrapper.querySelector<HTMLElement>('.handsfree')!;
        this._neutral.element = this.$wrapper.querySelector<HTMLElement>('.neutral')!;
        this._moving_ban.element = this.$wrapper.querySelector<HTMLElement>('.moving-ban')!;

        this.$toast = this.$wrapper.querySelector<HTMLElement>('.toast')!;

        if (this._hass?.language === 'ru') {
            // Ugly?
            this.$toast.textContent = 'Нажмите дважды для выполнения';
        }

        this._setControls();
        this._initHandlers();
        setTimeout(() => {
            this.$wrapper!.style.opacity = '1';
        }, 10);
    }

    _update() {
        this._setDarkMode();
        this._setHasTitle();
        this._setAlarmState();
        this._setCarState();
        this._setInfo();
    }

    _getState(entity_id: ConfigEntity): StateValue | null {
        const entityName = this._config.entities?.[entity_id];
        if (!entityName) {
            return null;
        }

        const entity = this._hass?.states[entityName];
        const state = entity ? entity.state : 'unavailable';

        if (state === 'on' || state === 'off' || state === 'unlocked' || state === 'locked') {
            return state === 'on' || state === 'locked';
        }

        if (state !== 'unavailable') {
            return state;
        }

        return null;
    }

    _getAttr(entity_id: ConfigEntity, name: string): StateValue | null {
        const entityName = this._config.entities?.[entity_id];
        if (!entityName) {
            return null;
        }

        const entity = this._hass?.states[entityName];

        if (!entity || !entity.attributes.hasOwnProperty(name)) {
            return null;
        }

        return entity.attributes[name];
    }

    _setDarkMode() {
        this.$wrapper!.classList.toggle('__dark', !!this._config.dark);
    }

    _setHasTitle() {
        this.$wrapper!.classList.toggle('__title', !!this._config.title);
    }

    _setAlarmState() {
        const entity = this._hass?.states[this._config.entities!.security];
        const states = entity ? entity.attributes : {};

        for (const name in states) {
            if (states.hasOwnProperty(name) && name !== 'friendly_name' && name !== 'icon') {
                this.$container?.classList.toggle('__alarm_' + name, states[name] as boolean);
            }
        }

        this.$container?.classList.toggle('__alarm', this._getState('alarm') as boolean);
    }

    _setCarState() {
        const controls: {[key: string]: StateValue | null} = {
            security: this._getState('security'),
            engine: this._getState('engine'),
            out: this._getState('out'),
            webasto: this._getState('webasto')
        };

        const states: {[key: string]: StateValue | null} = {
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

        const icons: {[key: string]: StateValue | null} = {
            '__handsfree': this._getState('handsfree'),
            '__neutral': this._getState('neutral'),
            '__ban': this._getState('moving_ban'),
        };

        Object.keys(states).forEach((className) => {
            const state = states[className];

            if (className === '__offline') {
                this.$container?.classList.toggle(className, !state);
            } else if (state !== null) {
                this.$container?.classList.toggle(className, state as boolean);
            }
        });

        Object.keys(icons).forEach((className) => {
            const state = icons[className];

            if (state !== null) {
                this.$wrapper?.classList.toggle(className, state as boolean);
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
        for (const [key, data] of Object.entries(this._info) as [ConfigInfo, UIElement][]) {
            let visible = false;

            if (this._config.info.indexOf(key) > -1) {
                const state = this._getState(key);
                visible = state !== null;

                if (state !== null && state !== data.value) {
                    this._info[key].value = state;
                    const unit = this._getAttr(key, 'unit_of_measurement');
                    this._info[key].element!.querySelector('.info-i-cnt')!.textContent = `${state} ${unit}`;
                }
            }

            this._info[key].element!.classList.toggle('__hidden', !visible);
        }

        const gsm_lvl = this._getState('gsm_lvl');
        if (gsm_lvl !== this._gsm_lvl.value) {
            this._gsm_lvl.value = gsm_lvl;
            this._gsm_lvl.element!.icon = gsm_lvl ? this._getAttr('gsm_lvl', 'icon') as string : 'mdi:signal-off';
        }
    }

    _setControls() {
        this.$controlLeft!.classList.add(`control-icon-${this._config.controls[0]}`);
        this.$controlCenter!.classList.add(`control-icon-${this._config.controls[1]}`);
        this.$controlRight!.classList.add(`control-icon-${this._config.controls[2]}`);
    }

    _initHandlers() {
        for (const [key, data] of Object.entries(this._info) as [ConfigInfo, UIElement][]) {
            data.element!.addEventListener('click', () => this._moreInfo(key));
        }

        this._gsm_lvl.element!.addEventListener('click', () => this._moreInfo('gsm_lvl'));
        this._handsfree.element!.addEventListener('click', () => this._moreInfo('handsfree'));
        this._neutral.element!.addEventListener('click', () => this._moreInfo('neutral'));
        this._moving_ban.element!.addEventListener('click', () => this._moreInfo('moving_ban'));

        this.$car!.addEventListener('click', () => this._moreInfo('engine'));
        this.$security!.addEventListener('click', () => this._moreInfo('security'));

        this.$controlLeft!.addEventListener('click', () => this._onClick('left', this.$controlLeft!));
        this.$controlCenter!.addEventListener('click', () => this._onClick('center', this.$controlCenter!));
        this.$controlRight!.addEventListener('click', () => this._onClick('right', this.$controlRight!));
    }

    _onClick(position: ClickPosition, $element: HTMLElement) {
        this._fireEvent('haptic', 'light');

        const _showToast = () => {
            this.$toast!.style.opacity = '1';
            setTimeout(() => {
                this.$toast!.style.opacity = '0';
            }, 2000);
        };

        const _stopTimeout = () => {
            clearTimeout(this._clickTimeouts[position] as number);
            this._clickTimeouts[position] = null;
        };

        const _startTimeout = () => {
            this._clickTimeouts[position] = setTimeout(() => {
                _stopTimeout();
                _showToast();
            }, 500);
        };

        const _run = () => {
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

            let entity: ConfigEntity;
            let event: string;
            let action: string;
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
                    // TODO: удалить switch когда button будет добавлен в ха
                    if (this._config.entities![entity].startsWith('button')) {
                        event = 'button';
                        action = 'press';
                    } else {
                        event = 'switch';
                        action = 'turn_on';
                    }
                    break;
            }

            if (entity) {
                // У "сигнала" нет стейта, поэтому ждем меньше
                this._startBtnProgress($element, entity === 'horn' ? 5000 : 30000);
                this._hass!.callService(event, action, {
                    entity_id: this._config.entities![entity]
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

    _startBtnProgress($element: HTMLElement, timeout: number) {
        $element.classList.add('__inprogress');
        clearTimeout(this._inProgressTimeout as number);
        this._inProgressTimeout = setTimeout(() => this._stopBtnProgress(), timeout);
    }

    _stopBtnProgress() {
        clearTimeout(this._inProgressTimeout as number);
        this._inProgressTimeout = null;

        this.$controlLeft!.classList.remove('__inprogress');
        this.$controlCenter!.classList.remove('__inprogress');
        this.$controlRight!.classList.remove('__inprogress');

        this._fireEvent('haptic', 'success');
    }

    _moreInfo(entity: ConfigEntity) {
        this._fireEvent('haptic', 'light');
        this._fireEvent('hass-more-info', {
            entityId: this._config.entities![entity]
        });
    }

    _fireEvent(type: string, detail: any) {
        const event = new Event(type, {
            bubbles: true,
            cancelable: false,
            composed: true
        });
        // @ts-ignore
        event.detail = detail || {};
        this.$wrapper!.dispatchEvent(event);
        return event;
    }

    _updateEntitiesConfig() {
        if (!this._hass) {
            return;
        }

        if (this._config.entities?.alarm) {
            // already set
            return;
        }

        if (!this._config.entity_id && !this._config.device_id) {
            return;
        }

        // Чтобы каждый раз не обходить весь список, сделаем копию и будем удалять элементы
        const entitiesToAdd = {...STARLINE_ENTITIES};
        this._config.entities = {} as {[key in ConfigEntity]: string};

        const deviceId = this._config.device_id || this._hass.entities[this._config.entity_id as string].device_id;
        const deviceEntities = Object.values(this._hass.entities).filter(({device_id}) => device_id === deviceId);

        for (const entity of deviceEntities) {
            for (const [key, data] of Object.entries(entitiesToAdd) as [ConfigEntity, any][]) {
                if (data.regex.test(entity.entity_id)) {
                    this._config.entities![key] = entity.entity_id;
                    delete entitiesToAdd[key];
                }
            }
        }
    }

    setConfig(config: Config) {
        this._config.entity_id = config.entity_id;
        this._config.device_id = config.device_id;
        this._config.dark = !!config.dark;
        this._config.title = config.title;

        if (!config.entity_id && !config.device_id && !config.entities) {
            throw new Error(`You need to define entity_id, device_id or entities`);
        }

        if (config.entities && !config.entity_id && !config.device_id) {
            for (const [key, data] of Object.entries(STARLINE_ENTITIES) as [ConfigEntity, any][]) {
                if (data.required && !config.entities[key]) {
                    throw new Error(`You need to define an entity: ${data.name}`);
                }
            }

            this._config.entities = config.entities;
        }

        if (config.controls) {
            Object.assign(this._config.controls, config.controls);
        }

        if (config.info) {
            this._config.info = config.info;
        }
    }

    getCardSize() {
        return 3;
    }
}

customElements.define('starline-card', StarlineCard);

window.customCards = window.customCards || [];
window.customCards.push({
    type: 'starline-card',
    name: 'StarLine',
    description: "Amazing card for Starline integration", // Optional
    documentationURL: "https://github.com/Anonym-tsk/lovelace-starline-card",
});
