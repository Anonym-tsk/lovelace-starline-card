export type ConfigEntity = 'battery' | 'balance' | 'ctemp' | 'etemp'
    | 'gps' | 'gsm_lvl' | 'fuel' | 'hbrake' | 'hood' | 'horn' | 'trunk'
    | 'alarm' | 'door' | 'engine' | 'webasto' | 'out' | 'security'
    | 'location' | 'handsfree' | 'neutral' | 'moving_ban';

export type ConfigInfo = 'balance' | 'battery' | 'ctemp' | 'etemp' | 'gps' | 'fuel'; // TODO: Extract?

export type ConfigControls = 'arm' | 'ign' | 'horn' | 'webasto' | 'out'; // TODO: Extract?

export interface Config {
    title?: string;
    controls: ConfigControls[];
    info: ConfigInfo[];
    entities?: {[key in ConfigEntity]: string};
    entity_id?: string;
    device_id?: string;
    dark?: boolean;
}

export interface UIElement {
    element: HTMLElement & {icon?: string} | null;
    value?: StateValue | null;
}

export type ClickPosition = 'left' | 'center' | 'right';
