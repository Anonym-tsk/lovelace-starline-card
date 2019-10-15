# Lovelace StarLine card

Special card for Home Assistant [StarLine integration](https://www.home-assistant.io/integrations/starline/)

![White example](/screenshots/white.png) ![Dark example](/screenshots/dark.png)

## Installation

Use [HACS](https://github.com/custom-components/hacs) to install this module.

## Manual installation

1. Download the `starline-card.js` from the [latest release](https://github.com/Anonym-tsk/lovelace-starline-card/releases/latest) and store it in your `configuration/www` folder.
2. Configure Lovelace to load the card:

```yaml
resources:
  - url: /local/starline-card.js?v=1
    type: module
```

## Available configuration options:

| Key                  | Required | Type                 | Description
| -------------------- | -------- | -------------------- | -----------
| title                | False    | _string_             | The heading to display. Don't set to hide header
| dark                 | False    | _bool_               | Dark mode
| controls             | False    | _list_               | List of used controls (select 3 from `arm`, `ign`, `horn`, `webasto`, `out`)
| entities             | True     | _map_                | Map of used entities (see below)
| entities.alarm       | True     | _string_             | Alarm _binary_sensor_ entity_id
| entities.balance     | True     | _string_             | Balance _sensor_ entity_id
| entities.battery     | True     | _string_             | Battery _sensor_ entity_id
| entities.ctemp       | True     | _string_             | Interior temperature _sensor_ entity_id
| entities.door        | True     | _string_             | Doors state _binary_sensor_ entity_id
| entities.engine      | True     | _string_             | Engine _switch_ entity_id
| entities.etemp       | True     | _string_             | Engine temperature _sensor_ entity_id
| entities.gsm_lvl     | True     | _string_             | GSM signal level _sensor_ entity_id
| entities.hbrake      | True     | _string_             | Hand brake _binary_sensor_ entity_id
| entities.hood        | True     | _string_             | Hood _binary_sensor_ entity_id
| entities.horn        | True     | _string_             | Horn _switch_ entity_id
| entities.location    | True     | _string_             | Location _device_tracker_ entity_id
| entities.out         | True     | _string_             | Additional channel _switch_ entity_id
| entities.security    | True     | _string_             | Security _lock_ entity_id
| entities.trunk       | True     | _string_             | Trunk _binary_sensor_ entity_id
| entities.webasto     | True     | _string_             | Heater _switch_ entity_id

## Example configuration

```yaml
type: 'custom:starline-card'
title: Audi
dark: true
controls:
  - ign
  - arm
  - webasto
entities:
  alarm: binary_sensor.audi_alarm
  balance: sensor.audi_balance
  battery: sensor.audi_battery
  ctemp: sensor.audi_interior_temperature
  door: binary_sensor.audi_doors
  engine: switch.audi_engine
  etemp: sensor.audi_engine_temperature
  gsm_lvl: sensor.audi_gsm_signal
  hbrake: binary_sensor.audi_hand_brake
  hood: binary_sensor.audi_hood
  horn: switch.audi_horn
  location: device_tracker.audi_location
  out: switch.audi_additional_channel
  security: lock.audi_security
  trunk: binary_sensor.audi_trunk
  webasto: switch.audi_webasto
```

---

Enjoy my work? Help me out for a couple of :beers: or a :coffee:!

[![coffee](https://www.buymeacoffee.com/assets/img/custom_images/black_img.png)](https://www.buymeacoffee.com/qcDXvboAE)
