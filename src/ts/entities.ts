import type {ConfigEntity} from './types';

export const STARLINE_ENTITIES: {[key in ConfigEntity]: {name: string, required: boolean, regex: RegExp}} = {
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
    'fuel': {
        name: 'Fuel volume',
        required: false,
        regex: /^sensor\.(.+)_fuel_volume(_[0-9]+)?$/,
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
