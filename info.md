# Lovelace StarLine card

Special card for Home Assistant [StarLine integration](https://www.home-assistant.io/integrations/starline/)

<img src='https://raw.githubusercontent.com/Anonym-tsk/lovelace-starline-card/master/screenshots/white.png' /> <img src='https://raw.githubusercontent.com/Anonym-tsk/lovelace-starline-card/master/screenshots/dark.png' />

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

| Key                 | Required | Type     | Description
|---------------------|----------|----------| -----------
| title               | False    | _string_ | The heading to display. Don't set to hide header
| dark                | False    | _bool_   | Dark mode
| controls            | False    | _list_   | List of used controls (select 3 from `arm`, `ign`, `horn`, `webasto`, `out`)
| info                | False    | _list_   | List of information tiles (allowed values: `balance`, `battery`, `ctemp`, `etemp`, `gps`, `fuel`, `mileage`)
| entity_id           | False    | _string_ | Automatic card configuration by one entity_id (e.g. `device_tracker.audi_location`)
| device_id           | False    | _string_ | Automatic card configuration by device_id
| entities            | False    | _map_    | Map of used entities (see below)
| entities.alarm      | True     | _string_ | Alarm _binary_sensor_ entity_id
| entities.balance    | True     | _string_ | Balance _sensor_ entity_id
| entities.battery    | True     | _string_ | Battery _sensor_ entity_id
| entities.ctemp      | True     | _string_ | Interior temperature _sensor_ entity_id
| entities.door       | True     | _string_ | Doors state _binary_sensor_ entity_id
| entities.engine     | True     | _string_ | Engine _switch_ entity_id
| entities.etemp      | True     | _string_ | Engine temperature _sensor_ entity_id
| entities.gsm_lvl    | True     | _string_ | GSM signal level _sensor_ entity_id
| entities.gps        | False    | _string_ | GPS satellites count _sensor_ entity_id
| entities.fuel       | False    | _string_ | Fuel volume _sensor_ entity_id
| entities.mileage    | False    | _string_ | Mileage _sensor_ entity_id
| entities.hbrake     | False    | _string_ | Hand brake _binary_sensor_ entity_id
| entities.hood       | True     | _string_ | Hood _binary_sensor_ entity_id
| entities.horn       | True     | _string_ | Horn _button_ entity_id
| entities.location   | True     | _string_ | Location _device_tracker_ entity_id
| entities.out        | False    | _string_ | Additional channel _switch_ entity_id
| entities.security   | True     | _string_ | Security _lock_ entity_id
| entities.trunk      | True     | _string_ | Trunk _binary_sensor_ entity_id
| entities.webasto    | False    | _string_ | Heater _switch_ entity_id
| entities.handsfree  | False    | _string_ | Handsfree _binary_sensor_ entity_id
| entities.neutral    | False    | _string_ | Programmable neutral _binary_sensor_ entity_id
| entities.moving_ban | False    | _string_ | Moving ban _binary_sensor_ entity_id

## Example configuration

#### Automatic configuration by device_id

```yaml
type: 'custom:starline-card'
title: Audi
device_id: 64884ef9115861f9c9ad36ed71f0a8f8
dark: false
```

**Where to get device_id:**

Open _Integrations_ page, select _StarLine_ integration, find your device and select.
Then copy the device_id from the browser address bar.

<img src='https://raw.githubusercontent.com/Anonym-tsk/lovelace-starline-card/master/screenshots/device_id.png' width='600' />

#### Automatic configuration by entity_id

```yaml
type: 'custom:starline-card'
title: Audi
entity_id: binary_sensor.audi_alarm
dark: false
```

You can use any entity of StarLine security system

#### Manual configuration

```yaml
type: 'custom:starline-card'
title: Audi
dark: true
controls:
  - ign
  - arm
  - webasto
info:
  - battery
  - ctemp
  - etemp
  - gps
entities:
  alarm: binary_sensor.audi_alarm
  balance: sensor.audi_balance
  battery: sensor.audi_battery
  ctemp: sensor.audi_interior_temperature
  door: binary_sensor.audi_doors
  engine: switch.audi_engine
  etemp: sensor.audi_engine_temperature
  gsm_lvl: sensor.audi_gsm_signal
  gps: sensor.audi_gps_satellites
  fuel: sensor.audi_fuel_volume
  mileage: sensor.audi_mileage
  hbrake: binary_sensor.audi_hand_brake
  hood: binary_sensor.audi_hood
  horn: switch.audi_horn
  location: device_tracker.audi_location
  out: switch.audi_additional_channel
  security: lock.audi_security
  trunk: binary_sensor.audi_trunk
  webasto: switch.audi_webasto
  handsfree: binary_sensor.audi_handsfree
  neutral: binary_sensor.audi_programmable_neutral
  moving_ban: binary_sensor.audi_moving_ban
```

---

Enjoy my work? Help me out for a couple of :beers: or a :coffee:!

[![coffee](https://www.buymeacoffee.com/assets/img/custom_images/black_img.png)](https://yoomoney.ru/to/410019180291197)
