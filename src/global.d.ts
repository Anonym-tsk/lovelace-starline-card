declare type StateValue = number | string | boolean;

interface EntityState {
    state: StateValue;
    attributes: Record<string, StateValue>;
}

interface Entity {
    entity_id: string;
    device_id: string;
}

interface Hass {
    language: string;
    states: Record<string, EntityState>;
    entities: Record<string, Entity>;
    callService: (event: string, action: string, data: { [key: string]: StateValue }) => void;
}

interface CustomCard {
    type: string;
    name: string;
    description?: string;
    documentationURL?: string;
}

interface Window {
    customCards: CustomCard[];
}
