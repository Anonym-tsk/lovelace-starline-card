declare type StateValue = number | string | boolean;

interface Entity {
  entity_id: string;
  name?: string;
  icon?: string;
  device_id?: string;
  area_id?: string;
  labels: string[];
  hidden?: boolean;
  entity_category?: EntityCategory;
  translation_key?: string;
  platform?: string;
  display_precision?: number;
  has_entity_name?: boolean;}

type Context = {
  id: string;
  user_id: string | null;
  parent_id: string | null;
};

type HassEntityBase = {
  entity_id: string;
  state: string;
  last_changed: string;
  last_updated: string;
  attributes: HassEntityAttributeBase;
  context: Context;
};

type HassEntityAttributeBase = {
  friendly_name?: string;
  unit_of_measurement?: string;
  icon?: string;
  entity_picture?: string;
  supported_features?: number;
  hidden?: boolean;
  assumed_state?: boolean;
  device_class?: string;
  state_class?: string;
  restored?: boolean;
};

type HassEntity = HassEntityBase & {
  attributes: { [key: string]: any };
};

interface Hass {
    language: string;
    states: Record<string, HassEntity>;
    entities: Record<string, Entity>;
    callService: (event: string, action: string, data: { [key: string]: StateValue }) => void;
    formatEntityState: (stateObj: HassEntity, state?: string) => '',
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
