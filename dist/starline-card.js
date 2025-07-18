/**
 * lovelace-starline-card v1.2.1
 * Fri, 18 Jul 2025 14:49:05 GMT
 */
const STARLINE_ENTITIES = {
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
    'mileage': {
        name: 'Mileage',
        required: false,
        regex: /^sensor\.(.+)_mileage(_[0-9]+)?$/,
    },
};

class StarlineCard extends HTMLElement {
    constructor() {
        super();
        this._config = {
            controls: ['arm', 'ign', 'horn', 'webasto', 'out'],
            info: ['balance', 'battery', 'ctemp', 'etemp', 'gps', 'mileage'],
            dark: false
        };
        this._hass = null;
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
            },
            gps: {
                element: null,
                value: null
            },
            fuel: {
                element: null,
                value: null
            },
            mileage: {
                element: null,
                value: null
            }
        };
        this._gsm_lvl = {
            element: null,
            value: null
        };
        this._handsfree = {
            element: null
        };
        this._neutral = {
            element: null
        };
        this._moving_ban = {
            element: null
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
        this._updateEntitiesConfig();
        if (!this.$wrapper) {
            this._render();
        }
        this._update();
    }
    _render() {
        const card = document.createElement('ha-card');
        const style = document.createElement('style');
        card.header = this._config.title || '';
        style.textContent = `@keyframes smoke{0%{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAeUExURUdwTCyv5iyv5iuv5Syv5iyv5i2v5+ZSDi2t5y2v5n88/tMAAAAJdFJOUwDkxh14k1siOgN7sEkAAABeSURBVDjLY2AYBYMeFFAmOApGwSgYBVgBs2sDppjmzCmOU9EEmWaCQAA2wcmogmxgwYkGqKKSYFEFVEFNsKAAihgHWGxmAoog68yZkzwnOaPqZgGax4zh+kRRYvwNAC2qHg3J7D+FAAAAAElFTkSuQmCC")}33%{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAhUExURUdwTCyv5iyv5iyv5iyv5iyt6Cyv5iyv5iyv5iyv5i2v5vmKsu4AAAAKdFJOUwDzknAsE7PXSsb1qK5EAAAA7UlEQVQ4y2NgGAWjYBQMVRCAKcSRuDAFXYx11qpVCw0QXBeQPsNVQLAYKsSivmrVSgOGsFVg0ABRlgViLzeSgghOAAuyrUIBBWDBLlRBBbCgForY8gAsgiIMWAQhljNYIYstgzrTC1kQ5nZObIIs2LQzSCEJLoQF3iwstqO6SQGb9ROggkzYBFmB+sUSoYLwkGdRsmBgrQKLLUKNIUewMxtQBVlmrVqugRHFkNijEmAxcsAQA8a7sLkQmiA7SkCghLwoqiAzJL7RzJVCCR4ogASFAGr6hUQOalAAU91Kw+WmGBYlsGKERbsQMf4GAHBGx9PCaPebAAAAAElFTkSuQmCC")}66%{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAqUExURUdwTCyv5iyv5Syv5iyv5iyv5i2u5iyt5yyv5jSs6yyv5iyv5iyv5i2v5tsG8O0AAAANdFJOUwCwJl2V+D4TyAV61+5U4e19AAABxElEQVQ4y7WUvUsDQRDF10TuDGlEsAgkEFIbiKVoIJBGkBQGQRACQVCwEM4ihdgELKwCEcGPTiTGQgQF24CKNsoVUQ+OnPu/uLm93czsLmKhU/7Yvdn35s0R8nMdL768lduYWT3K6hXRxAYN6wDCmMuhD4+O0ahKAG4LWAUwI+AA9BaM+iN4KqE36lSRkGYF26EKTOQ2Z2sKtFoU1xAWFUbrTF5NhSUgT9YDIQ0NvgPNsj4MfeinCfZNcJmQvOl60tQorsFVaLmocwYPFcbHcQORd889hl/tbwnbwdGCnE8DPlELx9AgUXFopQycK2ATREYOfdIULpi4Cf1FLO1CjkP0HA7QEuxxmELQDqOzr+zQUfrr7oL8T+3qyJr2plQWYw/zRkrt3FDgAlRlLdWoPyc2pM6PhcqDjguN5iPyhH232GJodAWxwDHAJ2KA0TuLSuDDqef1IIJZIkGG64TAlZU/i5ahO853ydReBG/cBM+Ypsc02CL+qE63bfd46vFfdSbc4Lo2tqDsqMM8WXf+LkCxTlZnGbp2vaLAJFYCna9iyPc1wN+N9rWJj/bUtZaD8woIstT5l8GV1ihla17MP7d/ofsbhICtlunAZFoAAAAASUVORK5CYII=")}100%{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAeUExURUdwTCyv5iyv5iuv5Syv5iyv5i2v5+ZSDi2t5y2v5n88/tMAAAAJdFJOUwDkxh14k1siOgN7sEkAAABeSURBVDjLY2AYBYMeFFAmOApGwSgYBVgBs2sDppjmzCmOU9EEmWaCQAA2wcmogmxgwYkGqKKSYFEFVEFNsKAAihgHWGxmAoog68yZkzwnOaPqZgGax4zh+kRRYvwNAC2qHg3J7D+FAAAAAElFTkSuQmCC")}}@keyframes smoke_dark{0%{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAkUExURUdwTP///////////////////////////////////////////xR6XWcAAAALdFJOUwAd07l4943qWwk5bvGMVQAAAFlJREFUOMtjYBgFo2AUjIJRMCIBo9sCTDHr3SFOYWiCTLtBIAGbYCCqIAdYcLsAqmg1WNQAVVAbLFiAIsYFFtvagCLIvHv3ZtdNjhgWWTJOQHd9U9kEIvwNAGj0I/KGs5sCAAAAAElFTkSuQmCC")}33%{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAqUExURUdwTP///////////////////////////////////////////////////4sGkswAAAANdFJOUwAsE8L3dtRIjLHrm2OtYyNqAAAA8ElEQVQ4y2NgGAWjYBQMVaCAKcQ+5cpEdDFG27t3rxyAc5kEQfqO3AWCqzAV23zvXj7AoHkXDAogyuaC2Nci1kIEDcCCnHdRQAJYsBZVsAEs2Isidg3i1L0oggsZsKiEWM5wFlnsMtSZssiCMLczYxNkRBa8CfO5L5LgFVjg2WKxHdVNG7BZbwAV5MYmCPLo4llQwQB4PHSHMzDlgsVuo8aQFNiZBRjRdmsPRhRDYo9KgDFCAEMMGO+uYR5ogmxIMYsm6IQqyAMWvIVm7lrU4IEASFAsQE2/kMhBDQpgqrscci0Iw6IJTBhhUbaCGH8DANm5BKsD7c6CAAAAAElFTkSuQmCC")}66%{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAzUExURUdwTP///////////////////////////////////////////////////////////////8/RimEAAAAQdFJOUwD4I60FEjRhS3jXye6Mm7touDybAAABqklEQVRIx9VWSXLEIAy02Hf4/2vD2DOxjQVSVXJIdO4SWrpbbNsPQrkSE6RQrFrBTGifSH6OdNAuEfUEJlK7RZxklG2IjBc3whoIVrrWPCtdrxCZXERw8OykNCzGArVEYc18PyeEcVZCW+JcbOs43rWNij2fARKXJ4MdI716pNPtBToGrFlOF0eBLJxkvttxgoMrveHA64NTIGjeoA9CK8mC9fCLJ0O+sHRWo3QD5fO0zYHxMJkaQ7anLK7mg7PuoVuVOPJGlSuZ/oP71BbpqaCdwMxIJe1mx6xvTJRzA9dnidEu74atqTNEerH9i9CKAXLdXkEaAiXqeyvIgLQQn13ZNNmLKQGOAavR9x1+EILPd87WE1dXMg8rcaB8zct0mrhqb9WJjZXv0u3KAuuVdoLhacRcPHntUbFPj9dw8yOr39Vk7iY47zhyPhpPnDqAqcpE2IfJxRs12keZS+n82EFdysjsUwrFaUqTwhj9t6xE+GwYqJd+wfsAeYkL5NV40ApWnnsVUlgAb1cw8gpE7yliMODmuMPWoofuaprqo6pNU9t3IWX1G3v9AiQ0YpqsujbEAAAAAElFTkSuQmCC")}100%{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAkUExURUdwTP///////////////////////////////////////////xR6XWcAAAALdFJOUwAd07l4943qWwk5bvGMVQAAAFlJREFUOMtjYBgFo2AUjIJRMCIBo9sCTDHr3SFOYWiCTLtBIAGbYCCqIAdYcLsAqmg1WNQAVVAbLFiAIsYFFtvagCLIvHv3ZtdNjhgWWTJOQHd9U9kEIvwNAGj0I/KGs5sCAAAAAElFTkSuQmCC")}}@keyframes smoke_alert{0%{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAbUExURUdwTOZPDuZPDuVPDuZPDuZPDudPDudRD+ZQD4gAJgEAAAAIdFJOUwDB4h14jVs6xlRyqQAAAFBJREFUOMtjYBgFo2AUjIJRMDKBSTimmGFHh4tGAJqgRAcQtGIT7DBAFcwACyqjCjKBBRuxCTahClaABdswLBLpEMGwqJHBAN3xbEoBRHgbADX/GYf9Vgw7AAAAAElFTkSuQmCC")}33%{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAhUExURUdwTOZPDuZPDuZPDuZPDuZPDuZODulOEeZQDuZPDuZQD5H2hDMAAAAKdFJOUwDoSWvHjBsNMq5mCBCOAAAA80lEQVQ4y2NgGAWjYBQMVVCOKcQeuEoYQ9Bw1apVbghuRgKQyASKrVqYANVlKbVqYRgDkxRIcJUDRFARzAn2AlOrFoHFmFahgMVgQRZUwWVgwSpUQQOwYBaK2FIGLCqhljOiCCpABDlRBKG+QXHSQpgfZyGLNkAFrZAFA6CCWlhsR3XTMgYs1i+CCnJgE2RoXLVqyRSooDg8bkyDE6BuWNiAEkGsYLFwtGgLXLXKuQEjgjsSqJeA2FUNGLCkliWWS9DshQSyGDbBpWjapVBCFyXkF6EKaiGlITiAJDd3FDFQGIcsnITmdimgeRhhUSnSQIS/AZjXy8m2/dYiAAAAAElFTkSuQmCC")}66%{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAqUExURUdwTOZPDuZPDudQDudPEOZQDuZPDuZPDuZPDeZPDuVPD+ZPDuZPDuZQD0sdWJoAAAANdFJOUwDqjRsLr/ZvQcQtVdjACGY7AAABv0lEQVQ4y7XUvUvDQBQA8FNTrNatCjoU6mJVWohIF1HoIIKD0FGHDuqioFA/6laoi5sgWnAS4tZF0KKj4KRThqiN1fr+F5PcR+7dRXHQN/5Icu/eRwj5OXoqj6unFjYjB160sC5CEB2EOYpwLVk/M1iXMMbxWcIrjm4hxBJH6aMJYW5a4KVAKIoHUypON5o2YDRGAUcxvB7Gkoov0vVEvBHSrWGLkD4NHUK6NIRvcCAKY1GYiDqI2Cr6pT9SMelhPIXtM+j8LLKhWzoaF9Ihe7zsUyGeif6ENXFNfTj8AomwpVKKqHLsRI3MR9RwvUooivIgDyxPP030jzqmjL0Uh/FqHPi2Zio7lIWR8QL5l5jXycjCk4Y3qPbGjJ9iPmgmS9aopMCZ5BtyEr4FboZVpR1YHA8Drb4yy3S1lzCWA5zTZk57sk4RT31N6WWQGbtOPArxdlrq1MhdPpaRz8OCstj68W0+tNsRSA692q4wHBSF382YLAenhhoUrIOzr7RtDNxzS2tww/q7ATKaZR134P1uC+fHipzEmNB+2uG+pjFWcXlo3GtrLZawjsz7MbgTzrKSuw0bxFSTz2/WfnHvL9DMq8wiVQ4oAAAAAElFTkSuQmCC")}100%{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAbUExURUdwTOZPDuZPDuVPDuZPDuZPDudPDudRD+ZQD4gAJgEAAAAIdFJOUwDB4h14jVs6xlRyqQAAAFBJREFUOMtjYBgFo2AUjIJRMDKBSTimmGFHh4tGAJqgRAcQtGIT7DBAFcwACyqjCjKBBRuxCTahClaABdswLBLpEMGwqJHBAN3xbEoBRHgbADX/GYf9Vgw7AAAAAElFTkSuQmCC")}}@keyframes smoke_alert_dark{0%{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAA5UExURUdwTPYREcwLC+oQEO0PD8wKCuwPD9cMDMwKCvoSEuEODsoMDMYJCfkUFPkREdcMDO4REegQEOEPD+gA3W8AAAAPdFJOUwD+/sgfvo1SdXboDuIy2qSYKHIAAABiSURBVEjH7dE5DoAwDETRhOwL6/0PCwmFaRgooJsnufuSrUQpIiIiIiL6jU1+fFEZfUhp0h52PTvB0CzCgi6sIqMwb8KgxbPIYO8lm8N954bGxTbovNizokp5eOhQq//iW3fsCATABIW+QwAAAABJRU5ErkJggg==")}33%{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABXUExURUdwTN8NDecPD98NDeoQEN4ODtkMDN0GBu8QEPgSEucODswKCuwQEOMODs0KCt4NDckJCcoKCuwQEOcPD/YSEvMREfkSEvAREeIPD80LC8kKCt0NDd8ODvlcO1EAAAASdFJOUwBJG4wOZjIFx+Z0wqz13+bxqLrqyIIAAAEdSURBVEjH7ZTLdoQgDEANkbfvKjPY+f/vrDpHhbZBFz1dcVca7gkQCEWRyWQymUzmV8ryjoTaOW3khcYXa0WxH0OSiT3IlNvRkVjyakugqzUM2p2oQAM9Oje+QaPG/XsDTi0Mu0ha/vnhqTHBdCywfEw0oznSsYQ2YbDZB40KC61pD8LqVQPBo45OAihviD064SAiz3xQYDwx6an4stWU94zvVfWkiApTiPqeV0D7WlGVekW033uk5Ih8XQz/DGgF2RkST8ukOk5ivTi1NeKqJ6UQTN7rcflPTwmguTEVb7z3lve+Se4R/EHH7nkeU0VoTm9OiTxIOAOdD+YATuezgWbpsxeb0KGdux5SVW5WDZYX9aLOrO+sKP7ghnwB1l4yqjRrGksAAAAASUVORK5CYII=")}66%{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAA/UExURUdwTOINDeINDd4PD+ANDdcMDNkMDOMODvEQENELC/IQENsNDecODtILC/EREfUSEtkNDfoSEucPD+wQEMgKCud5Tj8AAAANdFJOUwAbMwtPxWyH6+uzndfgXqO6AAAB30lEQVRIx9WVaXODIBCGw80CKZDw/39rxXhxujPth/bVyTj6ZA/38PH4iYg0TkdtFJ1RzMZDZkwyE6/iI07FiAFprEW6nGk4izMXI0OZ60bIO1hUrVe93Pbr8TnXqyZArtf/+wvj88s+C0Uo5crl+6ui/2Drld84pnR+FHeo1uaXOT8Adn3sGX+rXBF6j3mZy47gsmOB4PTC6S+EGJJbEnEYbul+g7THEVjOA+NYfXrphnprsjXdeyq3zzBxY0gbeY4HEwNIVjNJeq6/RDu5qmeuM+C0pV6mN9/u1Uh2t0+DvbsLiLT2+qvPNBzrcrzG3GA/iopTA46WmCajhStf4Tz0ZNXLi1My/W4ot1gSirPHfxDDhMmUC8HJO4xDWN5iCJ2eZoTuN4lYofzjCpBJA/kBWLIZOyQqL7usFKHQWUEaZjpzEVPuCJAhzZEZdvm4zeyJa01gzBXtap8jQVmkZxgcUM3a0GA5JnLIqcrxSKJslSH3LPtqnHG5tSjguA1Mwiypp/NMUM8Ik1at6z3nfpAwWR/2wEBNJ07BGoKktzNJKfljq4QricAkpLQkaJOb5sjTISA4LtmZQbiAahbfhUsc5zhNEhcXTIxrT7fIRALLZ28Ztrjuqk8sCPobdf0GakVg/dr+STYAAAAASUVORK5CYII=")}100%{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAA5UExURUdwTPYREcwLC+oQEO0PD8wKCuwPD9cMDMwKCvoSEuEODsoMDMYJCfkUFPkREdcMDO4REegQEOEPD+gA3W8AAAAPdFJOUwD+/sgfvo1SdXboDuIy2qSYKHIAAABiSURBVEjH7dE5DoAwDETRhOwL6/0PCwmFaRgooJsnufuSrUQpIiIiIiL6jU1+fFEZfUhp0h52PTvB0CzCgi6sIqMwb8KgxbPIYO8lm8N954bGxTbovNizokp5eOhQq//iW3fsCATABIW+QwAAAABJRU5ErkJggg==")}}@keyframes blink{0%{opacity:1}50%{opacity:0}100%{opacity:1}}.car{width:332px;height:197px;position:absolute;top:0;left:-100px;right:-100px;margin:0 auto -60px auto;transform:scale(0.6);transform-origin:top center}.car *{position:absolute}.car-cnt{top:67px;left:24px;cursor:pointer}.car-door{display:none;top:28px;left:15px;width:63px;height:91px;background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD8AAABbBAMAAAA2FECgAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAqUExURUdwTC6t4y+t5C6x4y+u5C+u5C+u5C+u5C+u5C+u5C+u5Dyp1AC5/zCu5ONFfq0AAAANdFJOUwAkyxFxPVmUs/HiBgGXtyD+AAACWUlEQVRIx42Wz0sbURDHR6upmj0k9FAsBmouLRShJb30IHjIoZeALeRSCAiWgNCA0EJPAVso9NCARfS24FkQcu0torQIXhKt28TO/+LbzY+d2Tf7xrkku++z7735zryZB3Any3z+VC6X39fr1Wo1vyQAr5BY/6MNVCiAgw/JcW+FAdjLJYBZxLVs6UXe7KBef+0jXrU5cB9x9M0FePDSEMsc+IX/yFPnodnoxuQxnKyB1+yDd4gBW6SFl2zPpy2+SNbHHb7mmfF1nehonOBAZwvxQHIidtx4Eu9zAQeWdItINl7AwBL/5JhMUUl4GW38EeLf2MuuHb8TH7+N1/Px0AYual+80d8pTMowdGSi5YwlA1ixXHcCC4jPncCqrRMXrcayAaSMDZzj2aYgJLOVWFN5BpSUJmaEvHECvxH3SqHlx1Z9M/x9UGqPhHTYY4A5J2CCMO0avzJLzLuAH1Eo0m1gougVHMB+6EUtPO33Qi/fWkCY114DcTs6+HDqJ8ajILYrcca1EsCz6G1zOINQifq5MXA9OcTMhq89A+DRUbH49HtigvHErTQfe20F+DlJqBRbU4BeRwG6oADbCtDPKUAACtAlZVa0HQ3Y0IC4ZDRlmUABgrSGxnPBAZAD3xAB0mFqIrALpNZLdkiroALMp9UFUmjdwJwG/NGAGQ3IaMCsBmQ1AI4VoeSUIrGQM+Y/KPGmF4qCkjBwLgG0x0wrOSn3Awpk0so86UnOcyFLGYAiZZB+WbQ3KXYM1krPlXCLacuuHBm3DJIQ5DoZ2dcityebyjXb68Dd7RY4PvkTz269PAAAAABJRU5ErkJggg==") no-repeat center}.__dark .car-door{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD8AAABbCAMAAADz5K2hAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAzUExURUdwTP///////////////////////////////////////////////////////////////8/RimEAAAAQdFJOUwAizBFlvzDxQ6qRVnriB9Px52U1AAACE0lEQVRYw7VY2YKDIAwEuQ+t//+1i9C1LeVKsjuPLaNkJiFBxv4OwXsfL8iEkGCt1Vpzzpfohzl7MP6Y8+U5wB6m/Mc5hNJjur0WxRSGECKFnAJP4ScRZHTPwOIwCH8taSslYnnCxifqqd6/whUd+yqE6385CG/PT+gakV8gBvE9t9CJYbz9siQWJ/VI/XGCZhmN7amvZyliiw8NmS519nmO6s4D+PWrWygSXWwIrdyXK1XGywNsw721Ms0huIpv1sJ/WqXqN+nV8Mvqo1n6EX9yuYYkEOyz5B9DnAD5esnv8PxcWJ4on8TzHzT5j3M9e5v5lPkHmp+PTiNe4DV0aYNvSKuOD/lxeNzy45BF39D0eBc/Cu6V/Rjs4s0+OIx+q56Uv8mP2z27oIn8mDuq8hFmLfjb/rp81Mz5Kn08bJox/LP11S1FTl4fquq/7Eh4bAlKqZl8nn3zAdgOgFLD4FF8yUh8xWh8DXJ6qD2m/Dkj7f+rzyja64F81e5eSO/hfNEePfHbh/F9p/uvIgDvXZPcvdsnXr7f83ut8lsTMaTl9KY3SL+uQeXvpPQBFZDq3lwJ/EjkByIfMEBs/fkT7x/AwL0/f6PzH2QgIxrQvCRxwukPnEDbtwxFOf9AAkqigO1LLqec/6AM9IyWgR7x7W6u33oJ9z7xGEL9AwSwqI+XE/dXM8CMruhuG0M5ib8h/x9+APekt4F6xMFtAAAAAElFTkSuQmCC") no-repeat center}.__alarm_door .car-door{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD8AAABbBAMAAAA2FECgAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAnUExURUdwTOdQD+ZPDuROD+ZPDuZQDuZPDuZPDuZPDuZPDuZPDjOq3eZQD9YGOTIAAAAMdFJOUwAkyxFvPZJYsvHiD5UIEVkAAAIiSURBVEjHrZY/SwNBEMXXaP5ZJYiCkkIjiIVFJDaCRcAUFimikEYsBMXKwiIQBAsVBIsUERGbFNaSwo/gxXgx4X0oL3e5ZHZvd8fC14Rjf9mdeTs7u0L8ScmL83K5XG80arVaNqMBdkE0OIsCFQpgeBUBtiQAXXWVOFASxe2sF0GjftAGXAVIAOQ/Ox6xJgNp/NDPJS9QOYwb9KXvY3WRJr6k79mmskgbt/Kac16uVeLjKAlZ18CrKYkgcS+TaZzzGEasWwYJPBcxRoiZDpmiomTpawX4nmbpRIGZNh6mWb5pSuDkbsJCtSFIhLpSstZbCqhagXmgYAX2ND7J4crVoKtY1w5comcHtqae6gWd09R04NN+LoHn4kjZUIuHwe9CcTT+kYBNq77TFnmbELON9/xjZdGtvxVmDQt+yZr1EuyVt9LsKMujCFAKTi5Ox0eyrYy7YfspTcpb1vp4M8MZ1E40yIRAf1K9kvphOQDv7/n85qMyQThx05RjVzDAkz4yxQQL0BUM4HDAKQMMMgzgCgZwSJs11pIVuOKAAjm7VptMgGu60JRaMAMOvW50+qItSqeWIL1epzfaBRkgbeoLpNHagRQHJDhgjgOSHBDnAMECHcYofUm1BFMxn4LZb/qgyDEFo98tesfEmJrUb0ZPMF735DvJei70VrqCsdI1PxajMWidcgTj1KrywtDddtaqdNXLWe2Byqv2Pi9rY1/8o34BfUKKCMAlrpQAAAAASUVORK5CYII=") no-repeat center}.__dark .__alarm_door .car-door{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD8AAABbCAMAAADz5K2hAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABCUExURUdwTO0PD+kPD8gKCu4PD+YPD+oPD+UODvEQEPQREfAQEM4KCtgMDNELC8wLC94ODuMODukPD8kKCuwQEPkSEscKCn+xiUQAAAAMdFJOUwAmX8sRxH+jQ/Df46VDIwwAAAJHSURBVFjDtZiLdoMgDIYbyk2sVUv7/q86KLpeCCHC9vfsnNn55UYUstPp7yT0JpFkg8ACgGThcriXNGiGCXEn5ESVd3dSCmjcxpt0zEPKkHPIPCiWQZstMU3yJt6Cpyn1UA8h3qKKtTWpjoKuHlEkm8pjGsLfQlBkDmT4STrlYMnqkx0yFA08w4dai9i0DgJvHlfvUSgYALK2dQO6snqZAZul7+vp7wb83dh89RzzNWHzHoBgkpV+MoA1r6+uPvns+awkR+R8kGzGpQ/+Xbt764MB1c7rgPue8oXsed1HlK+j/DF9D804RPe+Y9+L+CBfglz28zLe9Vb+oNW3yO3lb9P6LLpq5tOaD2ubfHriZSO+ulRCaOW3jrHpSqStO62eVXV8b3jxvDLfh5ka/gvoD2u7agGo3/7RS9T321MtlObh9biY9NXn8yeWZaUMvIW78evonFO7Flrv0ZpXVPP+SwVXZKY1+j35Lz5EMEcDtAlRqvS81OFl/npTq/mgoI/POuUgL/v4bJtXXdkf5C/5NmkOuc+3OXM5ItnHI7u8PsLrTh7Z5cURHjp55JBluewUfrDtP/yB84kGRuz0xvUeTGD8aWLrcsb4cWJmME3oIVHxA0D9Gz6P+ted/kUnD528vPbxYQG5GvHz95UrnNds/oofgPk8OiQBn8dP+Wz8hk8ZZ7YB21fABz4liRtX+JQGXPxRmPJGroHCkG46/YsHU4UpE7h8aUocefi5OALz+OKQyytAeUbnFGCkRnRzrsiI9n9w/J9+ANMostwYDwhIAAAAAElFTkSuQmCC") no-repeat center}.__door .car-door{display:block}.car-body{top:19px;left:63px;background:url("data:image/png;base64,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") no-repeat center;width:158px;height:113px;background:url("data:image/png;base64,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") no-repeat center}.__dark .car-body{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJ4AAABxBAMAAADWuQcfAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAwUExURUdwTP///////////////////////////////////////////////////////////0Q+7AIAAAAPdFJOUwCJVOO7DvIfZZt40KlBL1aB7KEAAAXCSURBVGje7VlraBxVFN422W7SJiHxVRuqiaViEUKKiRYV3ag/BCPuYDVVqrWSmiKIu1hLQYkuQSXGahvsj6YgaUAlXSpRskYhyEZb0IiQUHz8UExQ6gs0Jhvz2k2O986d2Z3Hua/5q+dHS2fu/fbOeXznO7eh0P9m254/L3Snarb0fUXsXvpHX29tqqvhr8P6UOHftrZGgWft6VPXacE9FwOZ3XytOtx27+YOap5nC5tV4b5n69PjtcRZRw4bhRcP7jlCXDpwfpghXq4G9zBd+9QbhmBJ5BrqkOykClwkQ872ljRgrxHAWRW8nwncOwrrviaAxxWOR9LkcyW/vKJ0wN0AS2p+po45LV0Vg4V6xTx4AGBVtmajwhrHb2cNyZIZgKQy3l6AMcmSDCyr11EkDnPiFWUAH2rU+THZB5PoTmvglQJUCxf0q+W844MPit5XAdyoRWxDkBe9rtCJroJ/ZiCnx+PrxRkzoZHMdn6tCdwL8L4mXqMoX9cB1GvibQJIIHG9fksv8WubrvtMB5IMfKiv9vViYodfihNunKPRX9LFC0XhCUoMADmb08NXmN1lPhQ232naEKyEKll/+qTAEtSylKuqtfHaSAmXWS00adUYM6ME9a3EygnMOgth0XwSt/6VeERcPLwSzU6WWwgrpvvshj8ZGloLoJpiH1GaMY2loo13IFE5FgDvB2Nj1Hm+gv/gtmCyLjxhAzzNOPkucMVH1/ba2z+wqabzzIj5YC0QHjte8yUu4nrmbJSmdACjyXzg5DcYl8JkADwa3Gm880KQ+E6RfS0oM9oJru++OVRogE4vd3AwYF14xtS4hjYeq13fB4dZjp8OwC/UlrDoEtupjXeMifdp9LF2e2PUDD7VU2WRVl6frtCNu+0aNAKFw+f5GP5Ybhvsjau+5DNNv59blk14aiZYQIqDY4t75oBAAYkU58NZl2goTI1GsHCAU6rUOZ7qcXSJY+cuJyMGDEijY+e8L/kApx6h/EM+jX7ulz3n2MOcjgMtobFwR/el5K+DxZK5m7aQN3HqEdi35o57Jtm0mS80ACvWf9BsmlfXMGW06p9kFxNVUbuNTBXn4gg99vzgNjV7labtnTb4L/anuabE7aBl2c1OX65Z7nMW2e86cLmXXbHOWynuyrln1eEWku7GaRZXibcmhpTxdnlrJckam8GtSbHzEt59Y+ZxcljSfyxKm311SCmR0WG/Kf+WEQUhkUaVcX/mR5i+yFiy0k1fsrF1CFFPbPqP+iiAVqVscGijA4bPT0umfF5FSFem3EoRsZOhdRtBekZUPoiUIxojRn8igsjcmBLeqn8bKZDIidbbEUknu+WoQI5xLv0F75ZDOgdv0hGfMblO2MBr1ZXt6fHahl+98ZXdFL7oadXhzh0DJ1qbCwJpIT0+2HCRvXtegfWnClon/MKOgfPDcbvFVbkqPP3p4LajcQVhSfVibpCcaTju2J93KQan/SPBq0N35R3jqtvW5CFDbNYxrrpNdjER5eLFuW9EMyp+ihXuL8n4j/9VGbzVSK9tMZvjelZSwBX4ptXCOOyzpLLu82RFP/7quKzcMFvkZqZEVzbim/4uTlp6BcL5qJ32oIqHSlGXFm3MOeG4bTlAOpuMU8qRTpJbRG6ScVJTOBmWA78IeL9VL+4e3G+q4uC1iP9Xg0N/XEIVMuCEIIZorJpPdX0nwPupZ+sIl+T8OvHkRYWm2vl2HKM/P6HeQqO+70J3KlWDW2qw60eqR+6fQPE8hHpDKPTo2RGp2G2+MhGK9GM15SbAvMGutxXk89VMpoJnuO/38Mq7yvr+Pg+ZLCLzQXJ9HzGF/08mq3oNN6/u91xGmLfQrEAzErjHDaTwWAk85nKKrYl6akT2noH1perChaVqnxT3zWk/+czq4YUxiov5Qh7kPqdI6Yd8LlC3Qx52Ng992WhT000dHU23pq/Svmw/Okq3tjc1jX4W+g/avyEAdobkAceTAAAAAElFTkSuQmCC") no-repeat center}.car-hood{left:90px;top:53px;width:103px;height:23px;background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGcAAAAXBAMAAADkTUwLAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAkUExURUdwTC+u4y+t4y+u5C+u5C+u5DCu5C+u5C+u5C+u5C6x4jCu5Ov3gOgAAAALdFJOUwC7d0xm4TMfpYkM6j9rSgAAAL1JREFUOMtjYKAULC9PSzY2NnFxUQICTRCh4uLibGycll6+CkUhV1myidPMDkHB0OjdeEFoqKBE5yQX47QqBgaW3aSCHUCboknVtA3ovtmkahIAaqomVZMBUBMHiXq2goKPjURNm8CBTmJIbAdr8iZNUwNY02rSw4HUkNgKSUjMJGnaCU1+0aSHAwODNqnpgYHUNGEA1cRBejiQFhI74RkxmvRwYGCwJl7TBLgmJqL1bEQqKDIbBYkCEpCwAwDFpalpPU0YJwAAAABJRU5ErkJggg==") no-repeat center}.__dark .car-hood{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGcAAAAXBAMAAADkTUwLAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAwUExURUdwTP///////////////////////////////////////////////////////////0Q+7AIAAAAPdFJOUwC7eExmNKqO3yMO8hrQy6g1e8wAAAC6SURBVDjLY2CgFKyZGRpsbGzi4qIEAyouLs7GxqGRc1ahKOSaGWziVF4m+K5j93984PeO3odi6UUuxqGzGBhY/pMKvgFt2k+qpq9A99WTqkkAqOk8qZoMgJrYSNTzAxR8rCRq+gQO9PukafoD1qRPmqYEsKbVpIcDqSHxA5KQmMkIBwaGflI0/YRq0ic1PTCQmiYMoJrYSA8H0kLiOzwj9pMeDgwM9sRrKoBrYiIl18JBeKIgUSAdEnYASy2ch9Yf0qMAAAAASUVORK5CYII=") no-repeat center}.__alarm_hood .car-hood{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGcAAAAXBAMAAADkTUwLAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAhUExURUdwTORSJeVSJOVRJOVRJOVRJOVRJOVSJOVRJOVRJOVSJQhQulYAAAAKdFJOUwBE7tijd74XMFPjMtVsAAAAt0lEQVQ4y2NgIBuwVzRKTg0NdXFxS0s2NlYCAq1VQLAIyFA2Nk5Lc3FxDQ2dKdhRDlXP6ZJmrLSKaKBsluLKwMCxilSwFGhVFqmaFICaZpGqKQCoiZlUTQVATawk6lkCDm4t0jQtBAe6F2maDMCapEgPB5JDogCsibSQWAZNeCRpWglNfl6kpgeSQyIAqomZ9HAgLSSWwbMgGeFAUkgYwDUVE61nUQOiiCDaqgzkgqVRkCjQDlEOAONmcr+Z3Sl5AAAAAElFTkSuQmCC") no-repeat center}.__dark .__alarm_hood .car-hood{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGcAAAAXCAMAAAAhvaEKAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABRUExURUdwTMoLC/sSEvwSEu4QEN8NDfMREfkREfMREekPD/EQENILC/oSEvMREfoSEtsNDdIMDM0LC8gKCu8REfcSEukQEOwQEOYPD+MPD98ODtYNDfN0heAAAAANdFJOUwBD78GqFnLajy5T2ekehKoOAAAAzklEQVRIx73WWxuCIAwGYJAJA4w8lvX/f2gzD4l52dd7qbL5KGxT6v/K0nutQ7CCmYnICGecc1WxSJvlQiV3zZs8L6tYFoegtfe+zKIHlnBTpARQTC9BZCWPT6lPIGvgKY8yPVo1f7gLGs9/yIHTdMuGsB0Wrft5uEHpdWvTADS67QjpO5L9nNU4Au3Kgn3g0L6yXXHCvsgRLE3Miql+gtSc94RYg+TNQVlMloaOPa7BCMdmyogsbfxu2rEF8CfTAf08S/Tng4hMIT+UzSEvfwiFeeRFtTUAAAAASUVORK5CYII=") no-repeat center}.__hood .car-hood{animation:blink 1.2s linear infinite}.car-trunk{display:none;width:128px;height:32px;left:78px;top:0;background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAAAgBAMAAAAoDG0WAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAqUExURUdwTDGv5S6t4y+w4i+u5C+u5C+u5C+u5C+t5C+t5C+u5C+u5C2u5TCu5GIyadUAAAANdFJOUwAzIRSQ3Xlh8cJLqAnAoDbJAAABsklEQVRIx2NgoA3gMZJaXpaW4uKye4uLi1taeZWgMvGa1T2nRtzFBDdaZ25bQ4x+67u4wdUFhPUzx+Ix4O41/JoNl3nvjLiLF7TOdquSwRpqWmU7Y+8SCVqnZAmj6FYkQTPckC1ZcJcw994lC1yBu8CXPAOaodqZGCzIMyCB6QDYAE4FNrL03zjAAkkWug48ZAXCNQaLDWADcpvJCwSgth6wAbFXGHTJMcCBufc6SD/j3RsG3OQYAAy62yADWIDByUWG/psMJ+7eNQAawHr3bg9DLOkGXGfIvXu3AGiALCg8c0k3oIcHaOsESDK8CjKFVLCBHUhcBmZDUBpYwAoX73SrElI2NjZSAgFBMAAzQWKCy7wRfi1ghZQP4PCbwAIV7S4iVN4smwtVaiALDkkGcAxeZockTkciijzmSkjpBkl9Cgxgx19nBovVEFfqSkPyMtg3BRADboN4VwuILbc1gVpuMUFCgoEd7p7NxJf8S2G+vgpMSYqggGaovXudhHqHae7dAGaQPkT5Knt3ASk118m7G9BEOG6RVvXNTUAT4XQgrfLUQHcw2wHSDGA3oLT6hjEA4wWI+/HBNikAAAAASUVORK5CYII=") no-repeat center}.__dark .car-trunk{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAAAgCAMAAADt/IAXAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAzUExURUdwTP///////////////////////////////////////////////////////////////8/RimEAAAAQdFJOUwA0IxB3YtuKGk3E9a2a6gfmanGzAAABoklEQVRYw9VX7ZKDIAyUQIDwJe//tBdRa1rvrp1WmLv94SA6k7CbhGSa/hW0B0WEaIxxjJxzSvzgJe8gEikFer7ersecgrWlvoZYbAjJ0FWe+FTfQ6FraLf1bZhPzq3IuIX5WD8Ai5GcQQL9qt0ZCB2brVcj2pQNKf3LidHkDobPnDAlpE4B6mMdCndiwA21Hx+kAA72MtIBTg8vVQh+msxA+4UJyKJKwCLJSAoWAmI6HDBNEzc0AlyNhwa2RaUfmQKasw53+2pTJY1yANaIS3cZaFZHRiBsAXfLxVb+yrwt+gP3lMNDgZUCNyoE57JTsSCv+3YepAFLj9vSt/tvz3/6VoMYMl+nCkA3wAElcOz69pvnz3ydJ/u9Alb2CyQ8yw8FKyF82s4oFx4c8AfTQSjQvqA8elaXtZTSBytjDSZJO4paZFFf2daqHEUVkiblW7q9FLy8s4ZwCzW4iwdBu931yLrHUEHlJLTVazO2Y/UmYqexxi8kFGnwPDlwfEbqNljNQVwAP/wSaz/7zYNno0JwXYdLeDotGd3Vgcn4vzZwfwE0rINYJGtingAAAABJRU5ErkJggg==") no-repeat center}.__alarm_trunk .car-trunk{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAAAgBAMAAAAoDG0WAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAnUExURUdwTOZQDuZPDuZPDuZQDudQD+ZPDuZPDuZQD+ZPDuZPDuZPDuZQD7ek0OYAAAAMdFJOUwCVqrs+JVr2EeDLdpQWYiYAAAGpSURBVEjHY2DAAzpaQ4EgooGBRNDili2oZLWy/AwMHK+cZawovS0lgCjtrJIwbWfQwXEzYgzYcwYPWEpIN0dIIj79Z05uc8UdIiHZQitrzhAEx2cpbvPAollrzhkSQJXitgikYBOefoYMUKUGN2HNGbLAEbgBPuQZYADVzs3ATJ4BDmyQlMWewEKW/sMMXBvABuQsIC8QjoB0goAOkEWOAUB7j4ITX81hBk5yDAD6/DTIADZgaHCTof8kMOxPggwARoEBRw3pBhwExb4D0ICeM2dKGHRIN+AoSJMAJPseIicUJ7CCCGg6DmhHzm1KgmCgBALKYFIRLCCkvBzJAAFGSGoGmXNmAzwtTtqCtwRsTTSHp8N2cEAwgCNgAjQailMJl1iOkHx/HOzt4wwMXOBEBUnMs4kqf1nUQWoPMdiA3QFJQwcZQPE4jchSm1UGqPg0JOoTIDnxMMi4aqLLfVYbuKMdGDiEjY2NjYCReSqA+JoDGGQFbEB9xmpIZYoFKXVP+pkFaCI9h0mqwFhqBNBEOGeQVv3tSUATYHIgzQBmdPWsJFbApKrHDQB8eDa8QFsXFAAAAABJRU5ErkJggg==") no-repeat center}.__dark .__alarm_trunk .car-trunk{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAAAgCAMAAADt/IAXAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAA8UExURUdwTN4NDd0NDdAKCuUPD+QODt8NDeEODvEQENUMDPgSEtELC/cSEvAREeoQEN4ODuIPD9kNDdELC+UPDxc5Dq0AAAAMdFJOUwCVq7xuTDIWxd/j9q4qdSAAAAGfSURBVFjD1ZftdoMgDIYFkgAi1tb7v9cFhkhnW88ccM6e/pDykTckUXEY/geaEAGEkNKYkZlewN3GGCkEACBSRXUSLwXPMFBJH6arjLpC5EFM1xkBiS54QSHf0ox+qoIfuTLYlXNPNAuXuj7+Lutua3d7HxzRgoXjEt+QbzdCRI4FanxX8OAAej/30zc/77QQgrkj/JjCshRmjgj1k/cybLgoA5xN3xDgppmQ6xq61k4scbvrml8Xellin106EXbLF5FLMHRSurZndayp+GpzBm6M4kjc+sA7p9hIOUi6lDxpT1ZKOYB7hG8NvPeAI0+5FVBpQA/avVmiJB90duSOKtrPU5R9Y433LVIzPpB1MaAO0hLwD6cKQqEObnAG3C7JGXgkbNEOOAW6zonOPpktZFzMQB6igfZ5to568kG6bFiWkiEHu3sckG2exdrHarGZBi61LAlPEVDbHwcNTvaktjjjowh68E0lZMqOpTYfF5DSjlnwxbEkBEK3+rxBF8P8MVWnM/7qgTiZYq1u6ABn4ay8FA1NObXfWL+5/d/zBcCqdRk7SobKAAAAAElFTkSuQmCC") no-repeat center}.__trunk .car-trunk{display:block}.car-frontlight-left,.car-frontlight-right{width:27px;height:15px;left:73px;top:79px;background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAPCAMAAAAiTUTqAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAA2UExURUdwTC+u5C+u5C+u5Dih8i2u5S+u5DOv5y+u5C+u5C+u5C+u4zCu4y+u5C+u5C+t4y+u4zCu5D45Zj4AAAARdFJOUwDm9K8DFWwKjdd/WjrNTaHAXPIe7AAAAHFJREFUGNOF0UkOgCAMBVDKUGah97+sYdCg1PgTwuJRGooQI9YKPho9EShMeiOraEYqNE+7afCxVEd6BcJVrD1tkTgsERfXzbFGsVnmDVpP4K3fKj/M/1hwpWbYT4RlcCYdEV1R1UN//zpbPVfbTP+VE8q1D8ilPMWnAAAAAElFTkSuQmCC") no-repeat center}.__dark .car-frontlight-left,.__dark .car-frontlight-right{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAPCAMAAAAiTUTqAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAA5UExURUdwTP///////////////////////////////////////////////////////////////////////308lk0AAAASdFJOUwCsCeQR7n9db9j3z7w6lYpNISwfQc4AAABsSURBVBjTfdDrEoAQGEVRH7kTnfd/2ETTKLT/LsY4jLU4Z4uMBQSZOAoPuJOkt7cRuhzljjQ+CfVcthhyplHErFQtTQ36Mj83eb0p5oa9mFyY/TFfTO0UvHCDqW64I2ZtUjloZf3/avytDnMCbEwQm4BUCsoAAAAASUVORK5CYII=") no-repeat center}.__alarm .car-frontlight-left,.__alarm .car-frontlight-right{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAPBAMAAADnvanrAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAqUExURUdwTOZPDuZPDuZPDuZPDupTFeZPDuZPDuVQDuZPDudQDuZQDuZPD+ZQDzUzRPQAAAANdFJOUwCvjPTmCHPWFF06TcfFdO7qAAAAbUlEQVQI12NgYGBgDWBAAmy1V8SWwnmssnfv3r0s2QDlMt4FA8MNEO5cCPfulQwwtxbKvXs5AcjjugsHl4BcJgT37gQGBh4krgcDA8tdFNXMSNzrGFw2RXFnZKOBoGP1NCWZkrtXVJG9wgF0NgB482aWeX1WAQAAAABJRU5ErkJggg==") no-repeat center;animation:blink 1.2s linear infinite}.__dark .__alarm .car-frontlight-left,.__dark .__alarm .car-frontlight-right{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAPCAMAAAAiTUTqAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABRUExURUdwTOISEvYREdYLC94ODs8LC9sLC/MREfYREdQLC80KCvEREeMODs8KCtALC8kKCskJCdgNDdMMDM8LC+EPD9wODvYSEuYPD8sKCuoQEO8REa7a19cAAAARdFJOUwAJr4RV5xXda5PV9Drzw6t2W2r33gAAAHJJREFUGNN10EkOgCAMQFGgTCo4W5X7H1RAQxzq235KkzJ24pz9sAbRCOu+hQu8NMLqZysJMcQsb0mGFwNl2OwfjT2TWylVbjCT8tZ2Iam0Uw2kJf3qR1qd2kRLra+6tlZ+e4Pb4bSTsof8MBYFf8fXORy51BM4wx0S4AAAAABJRU5ErkJggg==") no-repeat center}.car-frontlight-right{transform:scaleX(-1);left:183px}.car-smoke{display:none;left:222px;top:22px;width:39px;height:85px;background-repeat:no-repeat;background-position:center;animation:smoke 1.5s linear infinite}.__dark .car-smoke{animation:smoke_dark 1.5s linear infinite}.__alert .car-smoke{animation:smoke_alert 1.5s linear infinite}.__dark.__alert .car-smoke{animation:smoke_alert_dark 1.5s linear infinite}.__smoke .car-smoke{display:block}.car-key{display:none;top:30px;left:117px;width:54px;height:22px;background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAAWBAMAAAB5x3LYAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAtUExURUdwTC2s6C2w5Syt5y2v6Cyv5iyu5iyv5iyv5iyv5i2y5Syv5iyv5iyw4y2v5v+2g7kAAAAOdFJOUwAhQ0wskDiqxtwPWvQl/IBTuAAAAHtJREFUKM9jYMAD2GreAcGbEGxydu8goBaL3Dyo3LsoTLl3L3dDpF8qYMo9Y9gH0XgUU+4J3MpCQWQggCKHCl5ewC33LoC6cll1u/pwyTnUGeCVe5OALNekBAMLnBYkaSGHy4sFGOHyAhqeQPNxxkMb7vhrxh3vZQzUAwBJiP+3J6G7nQAAAABJRU5ErkJggg==") no-repeat center}.__dark .car-key{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAAWBAMAAAB5x3LYAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAtUExURUdwTC2s6C2w5Syt5y2v6Cyv5iyu5iyv5iyv5iyv5i2y5Syv5iyv5iyw4y2v5v+2g7kAAAAOdFJOUwAhQ0wskDiqxtwPWvQl/IBTuAAAAHtJREFUKM9jYMAD2GreAcGbEGxydu8goBaL3Dyo3LsoTLl3L3dDpF8qYMo9Y9gH0XgUU+4J3MpCQWQggCKHCl5ewC33LoC6cll1u/pwyTnUGeCVe5OALNekBAMLnBYkaSGHy4sFGOHyAhqeQPNxxkMb7vhrxh3vZQzUAwBJiP+3J6G7nQAAAABJRU5ErkJggg==") no-repeat center}.__alarm_ign .car-key{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAAWBAMAAAB5x3LYAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAtUExURUdwTOhSD+VOD+dQDehPEeZPDuZQDuZPDuZPDuZPDuVNEOZPDuZPD+NODeZQDzgc4XkAAAAOdFJOUwAhQ04skDiqxtwP9F4lI+LOcAAAAHlJREFUKM9jYMAD2KrfAcHrEGxydu8goBaL3Dyo3LsoTLl3L89ApF8qYMo9gxm7FVPuCdzKQkFkIIAihwpeXsAt9y6AunJZdaf6cMk51BnglXudgCzXpAQDC5wWJGkhh8uLBRjh8sJmHsxdOOOhDXf8NeOO9zIG6gEAu3T+RFTKYYQAAAAASUVORK5CYII=") no-repeat center}.__dark .__alarm_ign .car-key{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAAWCAMAAAC8N5/ZAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABFUExURUdwTNsMDPAPD+INDdkMDOcPD9ILC+YODtsODt4QEPUREekPD80KCuUPD94ODu4REeoQEMsKCtgNDfoSEtQMDPUSEs8LCwHAma8AAAANdFJOUwBGIiw5kMWoUw/fYduzHdg9AAAAs0lEQVQ4y83T2Q6DIBBAUdCRTVmKwP9/ameSphFMBX3qTUh44CQuA2MPA2n2b8s8qNReJ6chZva2RQ+wnLNZV5MPGT7EAB81Vy1d5r3Hz8B9nZwu+s0uMwhDCMTCnfAdrLXE7J2eM+ccMdcPtHRKC9zdYjOTjrMPizESi/2QRWS4wx+dUiKW6gQ/p9mMCzjQ8OEZmpJGdceylCLUupVj/dli26tNwMh9a5EavN3igCSwP+wNa/ciHb0Ix+UAAAAASUVORK5CYII=") no-repeat center}.__key .car-key{display:block}.car-hbrake{display:none;top:85px;left:117px;width:49px;height:31px;background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAfCAMAAAB55NVoAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAA5UExURUdwTCyv5i2v5yyv5iyv5iyv5iyv5iyv5Syv5i2u5iyv5iyu5jK5/yqt4Syv5iyv5iyv5iyv5i2v5hBQU/0AAAASdFJOUwD6L8tVaLkf8BHfRAIIlneEq/djywAAAAHOSURBVDjLrVTbdsMgDCtgAoQAIf//sUM2zmXdzvowXpqCJdnC+PX6l5Vyq7W2XD6Mz90csky3f4dvYTnuq4efw3ImIj6jyOSu92VlSMy8vTjnlitLjyP+z1/OJ94OHiBD4GTlXQEFBxEShAi/nVRlHyUZqCSOSTMnJvYgHSnFZ7E0IGuaZKeIG98riPsg/O4OIit4ERVF3k6JDR8NUt2tWL2BvA6aoCWyDa+G5JNIsJQ9vY0kqYInmTMt2LCgzCjVMGLZd1wk2IeIU7scI9aJzVOKEV42cIAf7O8QZavUKa8UingZLroYyZ8LATRpRYOjPxA0xUcSpP7Cg6CIKjYKovumdcD9gdieCBLEpXF5dWp4RZRjXkO714Fwx/fBAVYYD7OpV/3Nq4LG5HPsl3kLq96HwfXjiujhlbTdvA9YNtPetfQBddsbIpjLOc5e2onBNCMfiK3PLnda+Njjd2OlPdHsYbw3UkSbzPk4m2S2IjrL4jE8292PLVdmsx/Kk6L+83wH1xtMcJTfGFiPtdyV5YBdcCQnoUUdDdncJYZxLLmGmQXPktpllnCWacGqt2yDtTaExM65x7yq6dfJdn3ROeNitZ/OXZK5u/3PGP8Cu8gnAhu0M44AAAAASUVORK5CYII=") no-repeat center}.__dark .car-hbrake{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAfCAMAAAB55NVoAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABFUExURUdwTP///////////////////////////////////////////////////////////////////////////////////////1fUNLcAAAAWdFJOUwBXLrf79NEGDmZIliF6qeDFFzpuhepn9B/nAAAB2ElEQVQ4y61UybLDIAwraxa2kO3/P/UhGyjpzJvpoVxIDbIs2eX1+sma1+CcC+v85f1V6ZuXifsX9726x6X8P2lXIQSdCYN72saoLEGulcJqs1ZNHbDgaMPvA192YQH+SEALfBPz2QDThVwZqVD88eaeziJJQ8wMsMk1TokXJC0lXU+xa4GkuSbrJCjYVmrz6Q5uunbrYiWyUexlR0k+bjZdyaoDVbhSV25iyYZXQIUgjpVKdm9NUZ1LqaFEs+5lwQYFmYapCKHOE400nkgo0QZDCZEqthSl54YAdOUDbIifICVEk3HUXB3xKiSxcJdtb0IAnZuik84/OAIXIZq/GAzfEK7aSIi4HLHqgK8PRMaHYMSb4x6GqnJQo+HzdFfyMOqAyi3QVKDsnTPemlqIqYpc9uDV3Ae1xeFu6v24kEsz+9srXpHbgONa9tmkq6Hnb4TXPDsknOca49TKoptPhKoztDWratO15KApu7fWigYI1RfKuw1BmixZCrjkY9iXErJTHfa75ZlN+7XUee3PEBwFLWdN08jMB+TCJvjEBxhP/7FVjxSliUSZIOvQ3LzoVKI+JiTKCssN1WYppffUYWkf75X75l0U/Y0zTn75jmaBd/fYp98843+ACS4iFRllyAAAAABJRU5ErkJggg==") no-repeat center}.__alarm_hbrake .car-hbrake{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAfBAMAAAC8FDhpAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAwUExURUdwTOZPDuZPDudNDuZQDuhREOZQDuVPDuVPDuZPDuZPDuZQDuZPDuZPDuVPDuZQDw1u3boAAAAPdFJOUwDyaQrcKLZXGMl9R5Q2ptgyR1IAAAHFSURBVCjPjZM/SFtRFMY/omme2oogglLbJ7aDi+RJ3RwU/LOVpEvp6CQIggHBjsnm6qS4GN1KKySTjjo5Cc/FoYOkU9fy0mD7bM3X79xnJNAMHsi7N+9373e+c+59wCNi5ujiS9AJHFPx8vJ/8J4ubkpt7/pOPpaQ8cmd7znyObC5t5OoZhkHejReAd5rsoAn5IGBrhyHkWE05v5UeAfP3ihS5Bje8cW9tN8IUOStzbvZANajlqkiz9DDyBLVWMcz/bzVhYWlCTzlb5OpilQ4iH7OIW2mo4Ln38KjNkqIy5hSqjRvPq9zCKHEy9wWyclijYFIHX1KfcoSQg6ImLWs1hkBm5jlpar7CdOsImziYU+3ai3KRjtpjluedlK4J+at6kjWSJc1qRInZOQTXJ7Q8sDnN/lx3t5YE2xeVn1Wz4DWFRJvih+x6Sy7HvxR37dbxIaMVWJ9a8ptvUX61aweMu96raEc5dN7u3ASB0oV27TXRGtcTA4hxYYZ+GVzz9eYUpfdmYaqVWvnkeyP8nrEG1p1aLWeWvEW05SUDivaP9fdeQtvZWUtkfaurz4AX5P79rfDLd00MJrvdH23ji4mg8d8AP8AVCkUXpD+61oAAAAASUVORK5CYII=") no-repeat center}.__dark .__alarm_hbrake .car-hbrake{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAfCAMAAAB55NVoAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABvUExURUdwTNkMDOQODu4QEOAQENsNDeAKCt8NDdELC/MREeANDecPD+AODuMPD98NDfEQENMLC+0PD88KCvIREc0KCusPD9ILC/MQEMoKCvIREeYPD8oKCugPD/kSEtMMDPQREeIPD94ODu4QENoNDc4LC720MtQAAAAbdFJOUwAtWWkPegchy7RPRDgYp/Vq1vLmuIbiyJeV+tNezAIAAAIWSURBVDjLrVRJtqMwDASDwWYy85BPh6nvf8ZWyTZJFv1eFl8bySWVJoyD4FckzuSyLDKPv4zP9R8nRhdfxKd3PItO/5M2F0KwTxgOnHSlG7a6nGE9TZNObkLEQThHG1lNZAdIo45OmyAz4cqDJyTdtm1diVRkmOhVOxkAYJgYMab0JeiwIS41xPwcNgMUu2SbL9KQ3cDQLuEH5dy2BcaERuwk4UmCEoXTpZ6apusaHaGL5Ty5mwhhvIZAkmVQuDrP5k7BYjLim/OUyAPAtqXXddUY06wrTx0CGAb9WNcHrXxZV040ETwxoyML3IICYs8ANbcOKOADacOMnSzsPHK5bkZARSqqTaqwfkuNd5IMOfa9sgwCwMhIY4LG+gUCcTFSz1jeGVUkq8e+Yw4wxDujPEiADMfhGIeXFpmC8TigayDYcwIDxeVxqJtxUbiSfCsSsjHHDJg/4XhdF5JnpO2uyKiT+6LmDlekR0Z6Z8Wkxc143ZPqupRzX7Zt+STB5++fT24rpPOLkbqTeN5wAZPbctAng/K03BTC3B85wg4t2JJOlVKZJ6AD7CVHkPLgX5IeyUmP4cdlrwlSWIJCkPCPTetP8Lfi7RmaAYQ+63jvT/6QWAcsJawnlS1wLCUH/vPKlSicR4xVs6tV1dyPbHKXZQ+Z37otiyJMU/58BbNvmb95F7Peh7dz+OU7WmZynue6SH7nGf8HZNU/gB2+xg8AAAAASUVORK5CYII=") no-repeat center}.__hbrake .car-hbrake{display:block}.car-shock{position:absolute;top:0;right:15px;width:46px;height:40px;background-size:contain !important;animation:blink 1.2s linear infinite}.__alarm_shock_l .car-shock{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFUAAABLBAMAAADzB9aCAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAnUExURUdwTOZQEOZPDuVPDuZQDuZPDuZPDuZPDuZQDuZPDuZPDuZPDuZQD840AL4AAAAMdFJOUwANiR9O5DW50Gn0pB/NXhQAAAKDSURBVEjH7Va/SxxBFJ691dWLjYVgsLpGQsIVF4gQ0GI9MIVepxwErrgmEMQiFoZAttAErK64xkauCQRj4AoRO69RXO+yvj8q783u/didNzOrta/YnTu+fTvvfd/3ZoV4QrgXeCm8/vDWDnXeHOK1BgDn3ysW7AZQ3gCx8M8C/QzQFsIjKC1MsYoQH7dL0FtL2gZicJdLhC1ZsD2AEG8dhD7YuoCgfpL+iw27Jrc5hdD+vA07Kzs1g9gjKxPYgHuZfWBNS2+/EaIMsE0UXhofcLpwSJeQ6H0PO8bEAVJcBKjTO7oAX5MUW00GW0YKZiFqyiXGFSmv2pJ7ysYeUlyDM1wtSk3An+tvmB9CZusvkOIgQkl4DUgF08O5SLhwh4vTNJSjvDjAHqMY5yAbqpTcB7GEzLktBcso/6PoYIZPChQGKvZK/BDUYSX2Vey6dyGcngrlXDJfJHKViDTmI3KzUddooswUphkVi/kKo8iSa7L/Zv7CuN3qCpPGzFcYeiDIYn/pbfQyizWMCqeRs2MUK49IrHbYMIR283eCEc+2PnFtxNhJfA+bWuzIF3UvecWZcWYnDUhWdIroZ2vi84LexjEbiYL+TlKuOWo8X86SuKAV/eCRcSxPzp/xg10z08sVdNKQ2Y6ZkL0j4bSGGxyOtognZBoPuYXRr+Fs4wkpyMNe0d1vthEp506NZNHmz/A2Z9db3sx3rF1L7BET+ZyrOEKm08raNVkPFRNWGI1y1vMyJuuZrNeIPzrUmTHgp9oEH+7YgT7TiHQ3awY+nOpB6u9xdawo3r3aYarTeclVq4v8PJ+vXfPYVueL/UtsPAZKIl8EGrHz516/khcrqr54jsn4D+Q4uMJlN5b+AAAAAElFTkSuQmCC") no-repeat center}.__dark .__alarm_shock_l .car-shock{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFUAAABLCAMAAAA29zuDAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAA/UExURUdwTOMPD+QODugPD+EODuMODuEODuUPD/AQENILC9QLC/EQEMwKCuUPD+oQENoNDe8REdMMDPkSEvMREd8ODrdqXvAAAAAMdFJOUwAOj69VIztx0uXF7PQtIqIAAAKfSURBVFjD7ZjbsqMgEEUFmotiIoj//60DAjmiURt1pubh7FQqmsCi7ZuYpvk34iwfUSlBcPIAk9BRpUMYo7RSjN+Cgh7HbCsbP5J3mEItEPwZKKeRIZJXP1B6x1KdINGHRD8CzX7U8UxmKLsXfigo6hloDg8t0ordTle1CHhyh7pfAyHqLqYAd09B41U7khbwXJVLijB6mU+cc7FeifaHTmcoV/4ELjvWo+aYywIK8xojE6UNQAWKGmAy43WeQ10Wy/ZyoGq57nEf8CMhfRqRXeoW0h1jTOl8ioumHx6W9yCTzBLaFRrLUxSWmVCv3JgMBXMshyk9aUIKUGNkauF+3gkW0Xu4oSGtEpQrgxCi+SoZDKbJpRioUYii9ZFXESrfKCim/QBpBIsJ9UYJ1dL9whBdioNWlTFoFFOLqpb4fmGgqmaXgHVp1W1CqBdKVbdegWPWxamRKGhdnIJXEVBVvZsj3bmlF25i5Cxc08T+CvZ1Bcvb6Uzd/4MV+ow6XNnXiGk4w7YXHhZg2Ara5dn0CNZDRPHFNIh6rCwRc3jWS13YfNHlfPrlO6+6xxuyQnxmdyXV1jXE2WUsu/THgaRdWVuFjQGO2G4ZbLEy1tZUL52xpLObaWBXqigzEQd77OYSqR2Kl61I3NZ2cUv9pQOvrW3RiUv9pe82nw0W0C6wu2kj7EaAdoHt95Jcbqi9RLvA9nsmbFzbI+tB9EE7cSBtX8j6N+5Bug1j97JG+B9/XgmLSVzaH2FhZWrAYuohumB3KO23wmCT77q97cg3LMoFs9heMXzBAtYFfU9Pfl8IkbZESNYejJVbKrbR+Ef2bq/O2QVTlz7EFcPlvyYOItby5iFBXbKi+/BJolz9JzBePTwKjTXW8eZpgYTmV78q9AdGOGZ+n8/UdwAAAABJRU5ErkJggg==") no-repeat center}.__alarm_shock_h .car-shock{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFUAAABLBAMAAADzB9aCAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAnUExURUdwTOZQEOZPDuVPDuZQDuZPDuZPDuZPDuZQDuZPDuZPDuZPDuZQD840AL4AAAAMdFJOUwANiR9O5DW50Gn0pB/NXhQAAAKDSURBVEjH7Va/SxxBFJ691dWLjYVgsLpGQsIVF4gQ0GI9MIVepxwErrgmEMQiFoZAttAErK64xkauCQRj4AoRO69RXO+yvj8q783u/didNzOrta/YnTu+fTvvfd/3ZoV4QrgXeCm8/vDWDnXeHOK1BgDn3ysW7AZQ3gCx8M8C/QzQFsIjKC1MsYoQH7dL0FtL2gZicJdLhC1ZsD2AEG8dhD7YuoCgfpL+iw27Jrc5hdD+vA07Kzs1g9gjKxPYgHuZfWBNS2+/EaIMsE0UXhofcLpwSJeQ6H0PO8bEAVJcBKjTO7oAX5MUW00GW0YKZiFqyiXGFSmv2pJ7ysYeUlyDM1wtSk3An+tvmB9CZusvkOIgQkl4DUgF08O5SLhwh4vTNJSjvDjAHqMY5yAbqpTcB7GEzLktBcso/6PoYIZPChQGKvZK/BDUYSX2Vey6dyGcngrlXDJfJHKViDTmI3KzUddooswUphkVi/kKo8iSa7L/Zv7CuN3qCpPGzFcYeiDIYn/pbfQyizWMCqeRs2MUK49IrHbYMIR283eCEc+2PnFtxNhJfA+bWuzIF3UvecWZcWYnDUhWdIroZ2vi84LexjEbiYL+TlKuOWo8X86SuKAV/eCRcSxPzp/xg10z08sVdNKQ2Y6ZkL0j4bSGGxyOtognZBoPuYXRr+Fs4wkpyMNe0d1vthEp506NZNHmz/A2Z9db3sx3rF1L7BET+ZyrOEKm08raNVkPFRNWGI1y1vMyJuuZrNeIPzrUmTHgp9oEH+7YgT7TiHQ3awY+nOpB6u9xdawo3r3aYarTeclVq4v8PJ+vXfPYVueL/UtsPAZKIl8EGrHz516/khcrqr54jsn4D+Q4uMJlN5b+AAAAAElFTkSuQmCC") no-repeat center}.__dark .__alarm_shock_h .car-shock{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFUAAABLCAMAAAA29zuDAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAA/UExURUdwTOMPD+QODugPD+EODuMODuEODuUPD/AQENILC9QLC/EQEMwKCuUPD+oQENoNDe8REdMMDPkSEvMREd8ODrdqXvAAAAAMdFJOUwAOj69VIztx0uXF7PQtIqIAAAKfSURBVFjD7ZjbsqMgEEUFmotiIoj//60DAjmiURt1pubh7FQqmsCi7ZuYpvk34iwfUSlBcPIAk9BRpUMYo7RSjN+Cgh7HbCsbP5J3mEItEPwZKKeRIZJXP1B6x1KdINGHRD8CzX7U8UxmKLsXfigo6hloDg8t0ordTle1CHhyh7pfAyHqLqYAd09B41U7khbwXJVLijB6mU+cc7FeifaHTmcoV/4ELjvWo+aYywIK8xojE6UNQAWKGmAy43WeQ10Wy/ZyoGq57nEf8CMhfRqRXeoW0h1jTOl8ioumHx6W9yCTzBLaFRrLUxSWmVCv3JgMBXMshyk9aUIKUGNkauF+3gkW0Xu4oSGtEpQrgxCi+SoZDKbJpRioUYii9ZFXESrfKCim/QBpBIsJ9UYJ1dL9whBdioNWlTFoFFOLqpb4fmGgqmaXgHVp1W1CqBdKVbdegWPWxamRKGhdnIJXEVBVvZsj3bmlF25i5Cxc08T+CvZ1Bcvb6Uzd/4MV+ow6XNnXiGk4w7YXHhZg2Ara5dn0CNZDRPHFNIh6rCwRc3jWS13YfNHlfPrlO6+6xxuyQnxmdyXV1jXE2WUsu/THgaRdWVuFjQGO2G4ZbLEy1tZUL52xpLObaWBXqigzEQd77OYSqR2Kl61I3NZ2cUv9pQOvrW3RiUv9pe82nw0W0C6wu2kj7EaAdoHt95Jcbqi9RLvA9nsmbFzbI+tB9EE7cSBtX8j6N+5Bug1j97JG+B9/XgmLSVzaH2FhZWrAYuohumB3KO23wmCT77q97cg3LMoFs9heMXzBAtYFfU9Pfl8IkbZESNYejJVbKrbR+Ef2bq/O2QVTlz7EFcPlvyYOItby5iFBXbKi+/BJolz9JzBePTwKjTXW8eZpgYTmV78q9AdGOGZ+n8/UdwAAAABJRU5ErkJggg==") no-repeat center}.car-tilt{position:absolute;top:0;left:10px;width:46px;height:40px;background-size:contain !important;animation:blink 1.2s linear infinite}.__alarm_tilt .car-tilt{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFYAAABLBAMAAAAYMG2BAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAnUExURUdwTOZPDuZPDuZPDuZPDuZQDuZPDuZPDuZPDuRREOZPDuZPDuZQD0SLxQAAAAAMdFJOUwBv4vM1yRtVjQugtNz2J5IAAALOSURBVEjH7ZbLaxNRFMbv2Jj0sRmtCoUuLCKlMgsftbaaRRAU0SyKSLPJIkUEwSxCwYq1i0JoQcgiPkBwVVBQJAvFhQhZ2IyxYXL+KO977r0zJwl0J57NzCQ/5n73nO+cuYT8AzGxde7yt+ZIaO470JgbBX0cAJy/D7BGSGb3ys9B6F2AG5vsEvrZNkBvAPoUoMSl3oRog0rp4rs6CeGevC0z1XANQ7N16Myoh0mGdgs42q3Fjw3KvsTQFvTN13gAizga2Ss2MAlUQFSx9klTAr1KGjttCyCZOs/Dcgr8yFkv1wZA4GwQ+m6hZcy77GtWfqvQcfgO2+g27UIbceBIgCWr0DrCL1SMnTjPWChbN965Rt4DLFjscdASMm0D7dGfW44vxzqJXHEFPt+2LaLaV2jZ3NUh/wngq8kWI3F9F1gZEKYrw2+T3RaSXgUpycoFEJnsbC8FhX2+V6oqbLqsi0JFONUqXW6XpSWBhqwuItmrOqN0lSiJcnZD3P7RAuhD5CVQpuGWYwmP92sKCv49daemxDHA4qq9TVZfGCF8peHCZnkYq6p8m5BgGHs2dvdQDb/i/kaZzrS4XtTsOIrOeIY1ZFtgKHMku4mHRJUl8/OJZ6eTKCmKtovtC+EpvsdGAuVjeN4aiNL5UwYqR/FEAD9Mq7dVrrN5FyVk/Qyx2R011hTax4a/YjN6jKDfCaqXa1jXtlh+grKzsEI38UJrnWtW9zG2SKdG7oNGS3SlJYwdg/6d2Gof6Rr5A4ydNCuwxz3dwVjDZ93nsq9qGKwFXC/IoscjIZkIEZcqKuH2vLM/LSJWYk0RxnrmwBXeDyvYuUEKli97k/apMhysR5iSv4CxqosKcVoOh2V4R34hBp50Wka/TplrpMRD4/+i2+fuYY///cBcA7UaPwmVRAJl0+HHuPF8+MkuTAc/fr4tuMO7Nvzwua3YVfI/jhh/AbkISmqJqRKbAAAAAElFTkSuQmCC") no-repeat center}.__dark .__alarm_tilt .car-tilt{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFYAAABLCAMAAADdwICAAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABCUExURUdwTPkSEuYODuIODuYPD+kPD+YODuIODuEODuMODtYMDPIREd4ODuUPD+gQEOEODvIREewQEM0LC9kNDcgKCtMMDG76dIIAAAAMdFJOUwD+xXAekAxVN6fk4/kDic4AAAMSSURBVFjD7VjZkoMgEIwDw7kmavT/f3U5PABBxWzVvqS3aisO0vYc4ODj8cX/g3Gpm0ZLwv6QlMtmgSZ/xElRe0IA9wOoMwuEppF3xQsvVHLqueyFEUxn/XjPe3D6+CZKaPcQPccEbqSJuMlIYys0AXg1qQupzqQet/yJ6jx577ODCy9WJswnBIpaiGMVd0jl0Sw8fmw2pp0lpUcrbska0qusRHddd6TDrI6u6Tya7hoxBXPrESm3NzSd++f/LuSNGqkHi55aVxals9yu0We1y8wsoOVl3BVwsvugYWVl74toDnmpiQAtLeMsX4/oB45KjRTcodjnVdqAmXo00Ad5g65nuZD2nf3bY64Bx3uwQfa93pOCocyDrIm2V8Uw0L6HXZ76Iray4vZSFgsoGWNc91dYTfSsoVSY5qEYJb9/llnD3PrHl6JLnk8MSJ8HCN0SMBvZGe0JqQHdNtHVlitOjvaheI201esmGlghU0Z+BD1pe0bbLkENb23TpJF2hjTbbXsF1FVfbEujsLK2oNvXJVpiHNwZkyiobeQaqbkPSj7saK9SlhXEUSCvlzI9Frw+RbKAhVOvPqZVua3652Pan9xO81MPRVR0nXuR1XK+lGn7SGjJbY5QrZQl01Rmb2TveRAkIYRzAldITeyWee9sK8DfBoqIoBd7F6GCrne+TRV6VjsWv5BkgTTuepkyJlnqbCxHsqjpBVLXQpFyf2dop+S94XTEmGRlr2zVYtx07FmBPiqBVkrgGOyEKqRQewR5kGmaFFvOt9MONvl0ktWnRTuXu/PtnnPyecJpqj6MKjtboJqGHemcJ2Z+Vh+krcghw6nW44GJ06BuRSHjPYv8mfidKEQYhqhKubNVn53JkCA57kpvra0xphLamJXOVvmp3DiMmH9atdwx7nZXc3WN8VityruiqpcERGrHMDubJ2N1jYkxkouhI9tQ/fcZOYYIgguhvXofo2N+Oi097mrWtsnh5ooR7Vi9m68E0ZuUxazjjQ+CxLkp9rYA6sY3QCZ2KVEJbX2NnQR8ifv30/MX/4dfIP17pD0L7GUAAAAASUVORK5CYII=") no-repeat center}.car-security{display:none;top:0;left:0;cursor:pointer}.__arm .car-security{display:block}.car-security-1,.car-security-5{width:39px;height:112px;top:86px;left:0;background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABwBAMAAABvBnRJAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAqUExURUdwTK/ICa/ICa/ICa/ICa/ICavHAq/ICa/ICa/ICa7IC6/HCa/ICa/ICtfN2rwAAAANdFJOUwBmldjuUAm+J3wUPae3ViQLAAABoElEQVRIx23Tz0pCQRTH8dsfK7OFrUNwHQRuWgquhBaCLyAItQ1cthF8AcF1EPgCQY9wXyDI+6frn867pLfmzMyd71l+uM78zjljFNl6jcKqZc0QHyUdBtgSKWYVOxuISLL0sS6Hehh7+FSi3FePLOulemRZtxaPRGuheGKxoziiL7tqmWZt2A9/9MMrizvFOd1zZ7EZRheZQfRCf31ucUX3bOmeCd2jl9cELnf6SfXId4tJsIp95YpTi9/GLgUSOU1KG5oUfU7PDi5haSl1bhc0gME5m7RbqwtkdxN1KFEMiew7chLZuXcd/DALEujSjZlRzJRiauunAmtznoxsKPuKsuewXzs5Z8SyhqXr43Qb0hm7L0G+/vGY0O1SeuF/2qK7Id3bnHBE2CJ8I/wknBJ2KecA0HsKpndvnGZ0Fx6uYcYGax7uCHPYhnkMdQ83hAlhAcs0j9bHjFDGhDPCIeGCMCacEPYI14Q5YUJYEGaEf31WcUjYJuwQbglzwoQwJSyDBtgkjAn7hDlhQpiNAQ9zCjEm7BPur29cV+smwvoFiM+tpltojygAAAAASUVORK5CYII=") no-repeat center}.__dark .car-security-1,.__dark .car-security-5{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABwBAMAAABvBnRJAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAtUExURUdwTP///////////////////////////////////////////////////////81e3QIAAAAOdFJOUwCYZQ3ZUCLthTvDcbP30uf6VgAAAaBJREFUSMeF0z1OAkEUwPH1AwWxoLIkxM6G0FlpaGzJnoBwAmJiabLhBMQj0NoQEnvCCYwJvXFhl0WEdwblY9/M7vwTX/nLzr6vGc8z8ea5UUhqLp5K5DtYF1l3cnYSiEjYyGJZtvGcxdsdykMGx3uU1/wvd3Fl8Dg12fSsKjWaim2DI8WhOa61lsyHoX54afBbsUt5+pDHlC7ScUuXlZ6+MPhDeRaKVYMDxQCSFwSSW/1EevqOOq8bjBXfDU61yU+oyGpSepBcfEguDVhaRJ2H1PkMNmm2VrRwDmM3q7QrmkBFpiFr56KvpmXhSzojgWXYZW6ozIgGt07xXGAe1pWRJdU+o9pj911Yk7NGrPfwTGCcJcKyjV8HPCK0lyGP7ps2eC+wty5hm3BM2CesEg4JW1RnQCjQe2ac6eiyuIAZpzsq/I+x+y71MmRWlF6bYgZDwjVhBBuWhPDw3HPYIfQJR4QVwgHhB+GCMCZcEq4IE8J9n3n0CSuETcI5YUwYEkaEu0IdrBFOCKeEMWFImBBu5+RihfCJ8C996TofNx7GL+lZCtdI4VRFAAAAAElFTkSuQmCC") no-repeat center}.__alarm .car-security-1,.__alarm .car-security-5{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABwBAMAAABvBnRJAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAhUExURUdwTOZQDuZPDuZPDuZPDuVREOZPDuZPDuZPDuZPDuZQD2z56bAAAAAKdFJOUwBqldjuDFC6ITuST/u1AAABgUlEQVRIx43Tq1bDQBCA4XAr1BWBoCqSUxWFqCqipqoChYquqqUquopHoJs0LfOU0EBmJpv/HDryO9md2yZJLB6SfgyqUR+vpMx7OBY5FJHdLEQkLLt4Iad46eJrg/IcX9nEe3xlE0/xlaeoUlelRqa4MrTGpnZcax3ah0E/vDX8UtxSngnksdJFin7pcqA8O8pzpDxrxQUkHwgkd3lKPf1GnY8Na8WN4V6bFKjINSkpJJcckssSllZS54E638EmbWu+oj1VlFFFa6jIGppQQ1OHHzAjXYYvs2pPXwq07svUN3MtMA/3ZGweK0Jfew37tcm5Ees7vBNA35DO2M9dPqFLRd+lzPr/tKHfkO5tS7giHBNOzsYN4ZTqXBAK9N4ZZzu6Lh5hxu2OBv9jDdtoH8MZGGBv7VPsYklYEf797hEWhDnhiDAlzAhnhEfCmjAQHggrwt8+Y8wJU8KMcE9YEwbCkrAptIcjwjXhnLAmDIQV4WlOfUwJ54Q/6Yf3cTwmGN/jCZmqA5HcDQAAAABJRU5ErkJggg==") no-repeat center}.__dark .__alarm .car-security-1,.__dark .__alarm .car-security-5{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABwCAMAAACq9plIAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAA8UExURUdwTNcMDNcMDOMODuYODuoPD9sNDe8QEPYREdIMDNgNDcgKCssLC94ODvAQEOQPD84LC/kSEvQREeoQEHaWtB8AAAAJdFJOUwBolEkfutfr2RmG5GsAAAGpSURBVFjDrdjdboMwDAXg2k5IIaUQ8v7vunVaNfBPOZo43FWfHNuhvejt5obSDYm0Qoi7t9bucsqo/SSfHV7abzgB5V752GZpu8RtUjsmarM0HbdNak7Y353J3bkKL4SVawkrZ9vLrjM7TJujNjsFg1OUzYmdgrbmuGyn8KrZY5NbbjPHsttdxqbYzLHiMntsdpld8tN1bJfnQnO3+enGLO+5ecxshdxqtr3gWNNe953envjMbI99Z9orvtOXK92NGYP603l6N1vx65kxfNYz1l7X43Lg9LhD4ARrryesvQVqb+kDtL3FrKUsftRaUsD0+iRwi1ofR06tL4MuGmNJaowZcuEY6joIdOG4sxp3DlLUyxewSbnvjxYXHl+XFB2rnICOQMcXuwy6YQoyHvc3TXPwTMqFOaz5Ard/T+UCt/8e0QWO/uE4VOO4/33hMcyUMbcOmBvHq10CnYCOMLcy6AbQrTu3fkoCnYCOMVczWK9i7vE3CD8+hkDHoBswV2vC6j0Ec5XBeu8GuZ4kgY5Al0FXUSegY9BV1AnoGHQVda+Dhc5z/lfHO196aJH4+C8nvQAAAABJRU5ErkJggg==") no-repeat center}.car-security-2,.car-security-4{width:93px;height:84px;top:11px;left:22px;background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF0AAABUBAMAAAASUCY4AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAnUExURUdwTK/ICa/ICa/ICa/ICa/ICa/ICa/ICa3JAK/ICbDIDa/ICa/ICrWamWMAAAAMdFJOUwA883i9VdWbByAS51bacIAAAAHSSURBVEjHtZc9SwNBEIY3xMO7VCJio42I+EGKYKkWsRCipAhiZ2MTULjC0iJFwNiLio3NgaI/wPaafBc3P8oYY9xZZGfeIls/vMz3zhgzs/e4gNDhGV0DeLRPtKXHcw0i6qvxu3iEU0+L345xonsd/pr+4FTSqRcnOF2o8F91ojaG01DGg/gPp6wpxr1K9qsJeKHBcCoLNbPLcdrx88sOTl0v/uHi/ooIUhcf7AG+Em16G+bcxT8TyPi6N1k51/gjfygPHPzQjz9huGuNgIeONXWhzN44vi6UcRQzfJgI8qe8CKQxmGd4Jg4FXjfHEt5i+IaEF5izPclX82zjnZo4t1PIeLOib9dx4RTtUMof0KItf4LJy9YweTk2JrLlr2T5FyhTvI5vZPl3zNnQnvWKr20eKUs+cjqK1SKw5NcMlCuNvF3IGvkWJm93ueYbD4Bf1vFWkVpTSKHUmjloqWC5rWDeZomBGkWTK1PFgpnHgmlW1RuOO5IzzYppNVYfNKeEmdNrYuZsz8CcMNatZ/8kS2XOA2aOVTsDg5Wyps/taOrupaXp2ElU/HTR7Orw6RZ+qb7dGurOsq4I9TU2uVLaAP99Y5URfrReQ9ft6BqezZH9Bd2V39t7ybl/AAAAAElFTkSuQmCC") no-repeat center}.__dark .car-security-2,.__dark .car-security-4{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF0AAABUBAMAAAASUCY4AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAnUExURUdwTP///////////////////////////////////////////////w2imYoAAAAMdFJOUwDAThrsNwnbnmyB95onFT4AAAHMSURBVEjHtZe/S4JhEMffFCWbJKnJwSBoaTAIjNraCgeDoKElm6opCoLAIWjMwSGaG9pqKgpX65W07o/KNPLuGd77fgef+cPxfe73RdHE3nqNobMLckXg6QeRNxzP3IjIO4wfFge4dFD8uCHDV8bwk+oIlxaHyykk5h+XLoDnxrj0fDzVGOMSH7h+L4p+JS+qTYO7GXFrcflIxvcCXPqJ+FGIJ2dEqhrin3fEX0XaiQWzGOLbZUr8ZWKwMo0An0125VOAzyXjK5z10JUOHqo5c/C6xbecNE5b3/S8MreR6nhtMGfw2G0KNm+uI+qzm25jNRXbcVtahRNvfVlw+82uxr/8Pq8TJ65x5guceV+NMR+XOPPnvvlVHSm3F1vfA8O2wn02qzMHGG3TCn8GJpUq8m/fl6asEPP7nPl0lTNf58zrKkfM54gpG/y2j6xbKnXuAX6KWipMbOcBPKVmLLJ0qUJ5ReQUOWfOUHVinJ9HVuOx82Pkt6qwoJV3mYutkgM0HSPnhZTTIuVEXLAgORucHJU7kByVysi6rr2J3Us7VO4M3hLRF4YBeBzxF/Dt1oQrS10R8DX2d6V0Cf73aMozfLQm1HU7uIYnc2T/AH6D3yU8+Es0AAAAAElFTkSuQmCC") no-repeat center}.__alarm .car-security-2,.__alarm .car-security-4{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF0AAABUBAMAAAASUCY4AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAeUExURUdwTOZPDuZPDuZPDuVPDuZPDuZPDuZPDuZQDuZQD9CKlDsAAAAJdFJOUwDvFr9PdjWb2/Pl6xYAAAGoSURBVEjHtZcxSwNBEIWX5M60IkZIFxEx5RFEuO7ERrvELl1EBNPZprNQ4crjNMn8W89L0J0Vdt4rsvXH8PbNzO6Mc3s753MKv5EXgu5MRQ5x/GApIp8wnuQNLjWKp6W0ZwgaM9jiMuFweYXE/OKy4nBZA86Uf7hUtu+5+KewsrpUuGQGP9W4HMXx5wCXryh+EeLxilDWtGdzT9y1sT/aMNch3h9S4t/jiQrFX8atnAX4VRw/46InAwoP1bw5Sk3fqkrtzdpqc52p2noGU4VX5qOg62Zs4V2FH5sPq+rY2nzSRkp8YT4IJSXePeDt2ob3C6eac+HHXHhbjQpve6PDf9jhT6lM6ToGPtsRd1nnVw7wtfU8HPmaZ5SXLmGqvjkLLnxnwIXvcuH9LkfMSYlfNrgtklq/dCbcbYGhQuU2c1RuN8jQ5TXKieMqueDMR8z0zc848yvktj2udNwd9Sr4cqAJuQfPZ//kQAMyKScl5SxIOTknxyvlFekmti89UrXTnFumlHerGLydeJNvgfLbLQLexnaj+Irgf7agjOGb8Zrbbt3Tfpbsb05oJp9hv8+iAAAAAElFTkSuQmCC") no-repeat center}.__dark .__alarm .car-security-2,.__dark .__alarm .car-security-4{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF0AAABUCAMAAADXoMs5AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAA2UExURUdwTOIODuEODuUODucPD98NDeANDekODvUREdMLC+YODu0QEMwKCuQPD9sNDfQREfkSEtMMDNI2CAwAAAALdFJOUwBAG2a0i9IJ5/DvkWfgpQAAAeRJREFUWMPVmdmOwyAMRdnJHvj/nx26jVrFJlV8/dDL+5F17CyAMT8XF60WOvtQStQqeyi3ZAW2DeUZD2f7VP4T0LqH8h6HZMdPNlLNkV3KoOTkGczI02zMyFuG3dRkxHzvHF6oxoW97GyEI++HHrzhBWps6rMb3V+f8KZ7P0m4PCln5L0kn6928zTBqhU+RHfd+EmuKvmm8CB4iOLcj4Ttwjzv+8yuZEVvrIbgI2L3rbReir4RoQefvOh961IPHmXfaDupCW8v264U4Seo9XNlJ1z44/Lo50ouceGtnytXurTwBl+5iAs3blgZKau48DaJbOXyvyEePllFuNxKBw74R2ThACvGcfDk9OBbAGzn2kO0kSuajICr9dPktNGB7LXCRmqZIPBIFz5CNlqe0QKBW83K3ahYOTMumMq5joJ2zhS6VsyZgq2NdViYh6i9AG6sQ0CnXKFSAZ0TxXq0UmvKIOlUEuYMyo0UHDTojHTQ+ZavCwEHjQspfQGNS06kdIcaRsLLAuqoXahElJelHtYCeoxMpCpHSae9eJgXIqgzblUvTtOLCRQ8geCeLN1qWsfd6Nik1tKHnFGppa9Dxg9+Qt9FuajQ0nf9AT2Nn3pe7VW6YMz39gajlZt+tbvRO9/8Sv4AGRdhwuo3ZyQAAAAASUVORK5CYII=") no-repeat center}.car-security-3{width:114px;height:29px;top:0;left:110px;background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHIAAAAdBAMAAACEUSXBAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAtUExURUdwTK7ICa/ICa/ICa/ICa/ICa/HCa3JAq/ICa/ICa/ICa/ICa/ICa3JC6/ICgVz8UMAAAAOdFJOUwA/7J+3ciYIWIfcyvYVD4ISbAAAATdJREFUOMtjYBgkoEyidaaxi/fu1btdnC2ndogVEKXrYqfJpndo4NESy8YLBLQFY+iC694ckYBLG1un0zu84JFnGzZ9jCF67wgDlUB0PxdOOfeOOHB6IrJethBi9YHAkTC4Rsl170gDi8UhDjV6RzJ4ZAF0crLeO3LAYQGGvHfkgQAGbjJ1XmBgJU/jEwYG3nNk6XwBDFs/snSqA3X2kaXTAKizCIfcGyWtVUo6uHQKAHUyY4hqOU9tFLsOSV/s1wRbJ3tjxPkrcCZBz4bpmBmJPTHYC0XZU7AwUqpdHHgBT67fg1D4DCwUB7POVRx/icEuCk/iDmCBexCXWyQQUUplWEF0NoB5LKCAdE0gslxM9QEph+RujnfvlMWJL1LZgdn5MZR5aiJpxTHjrIdQVgLJRXkCRRUBAFWQQRJWfc+AAAAAAElFTkSuQmCC") no-repeat center}.__dark .car-security-3{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHIAAAAdCAMAAABBocjAAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAzUExURUdwTP///////////////////////////////////////////////////////////////8/RimEAAAAQdFJOUwDrt3EIOieiWtpIlcqC9hYxv/7NAAABM0lEQVRIx+2Wba+DIAyF1/JaoMj//7UXHXGSuYFT+XRPojFq8kix5/Tx+NdGUitnBXtjEDGEQPnIV8Z4FtYpLa9DTcqyR4LUEhAatmo6BXPChDbqDR2McMfB2jIeh1VgZKt7cUqcpG25QjX2WCrGmK5VDOw+YbW4HLdiUbwXWXlK94r8ZrHSeUgjBOZJ1WYMr5TYuIxMYyXyMsNY5GwSYigRF1+LI5F2+WNxIBGejWIHIn3py6NdEgGAiPL58J6o4gW+oyBzGC5RPNWGKacS3diTc7S6XSP9bGfkS+2E/xpDvL6776/0U9TOc0SO9v2Sv8ydfwi61oozF3absnxXbb79cd4cLuqAsptn+C3YTmJfMRy3hVtaE7yT98yjJR1NdTOCV7eOwYopuXr5A4bvEYwP+gOQZ296MP5hDAAAAABJRU5ErkJggg==") no-repeat center}.__alarm .car-security-3{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHIAAAAdBAMAAACEUSXBAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAkUExURUdwTOZPDuZPDuZPDuZPDuJRDeZPDuZQDuZPDuZPDuZPDuZQD5fVQ00AAAALdFJOUwDtuT6fCtQkclaHBPKDmwAAATFJREFUOMtjYBgkINxyxioXJbW0tDQlFa8VM80DiNIVPMspcTca2JjkNZmA7uIWxd04wMaUzgJc2thn4dQG1aw1HZs+5ibp3YSBUDO6q4MXEaMPBDYtRtbL3kSsPrC97XCNVtm7SQMpphCHOu4mGWz0BDq5RHo3OUDEgKF6N3mggYGNTJ0BDBzkadzEwMBKns6dwLDVJkunKFDnbLJ0OgB1BuKSFBRLE8QZZQZAnSwYomIqKyabl0LSF2u58YwlahgGbANnEtTUodJZipmRWCvRMu4OsDBSqk1pxp31g1uQFG4HC3XDrNMwxV9isFrAk7gCWKAamogLiCilKt0gOieAeUwgpkYBkeViBcjDGyGe4gSm/KnEF6msVtK7t0CZgotJK46Zl22GsgpILsoNKKoIALtLkASRbwn6AAAAAElFTkSuQmCC") no-repeat center}.__dark .__alarm .car-security-3{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHIAAAAdCAMAAABBocjAAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAA8UExURUdwTPEQEOUODuAODuELC+MODt4NDecODuEODtALC/UREdMLC+0QENgNDecPD+EODvkSEs8LC/MREd0ODtDn8bYAAAAMdFJOUwC/dj8LpiVYk9zm7nvem7kAAAFhSURBVEjH7ZbteoMgDIVLYvhUu+n93+sCagelKjrl1w5YFYG34VFOHo9/RWokKgWgiUSQnU5EGkAplM2FKFSghbVfe7JWECj8E1oikNhHZWhPlsdpCk7AUrAu53JsH2jDOS7sLXSDIAaefLhMPJXQq1gJoh1ukoB8kVHbduCyp2GpyzHf7YzhwybBel4NWVKBKol5va++bKhvl05LiS/ajcFzz3BJyMi+roDDFFWJT7+08KwpCh9jcfcx1Ox2zJ5sSIUXlsZ6ctOHorpSjaH4Op3iUiY9b3OuOyjnnDGGf48O7HDeCnQBxLAlsRuifPPihq0bg3Wbgj9gXrvP97pccL+mNHFgNzcbs8Grr+/VpZVlCE55PPsRzdz3SX83d8hiO0lLbTeLV0S+FbcbOpFGrCUXOsGq6JlYGgnkxZmhBHLL2sULp0KLxuaefBSnYClpdEbjrWmwp6YEWSH5rsFY0Q9X7meXvyU2bwAAAABJRU5ErkJggg==") no-repeat center}.car-security-4{transform:scaleX(-1);left:218px}.car-security-5{transform:scaleX(-1);left:294px}.info{position:absolute;left:16px;right:16px;bottom:11px;margin:0 auto;max-width:420px;text-align:center;white-space:nowrap;display:flex;flex-flow:row nowrap;justify-content:space-around;align-content:center}.info-i{cursor:pointer;height:30px;line-height:30px;vertical-align:middle;--mdc-icon-size: 20px}.info-i.__hidden{display:none}.controls{display:flex;flex-wrap:wrap;justify-content:space-between;width:330px;height:110px;position:absolute;top:134px;left:-100px;right:-100px;margin:0 auto;transform:scale(0.7);transform-origin:top center}.control{cursor:pointer;box-sizing:border-box;overflow:hidden;position:relative;margin:0 auto;z-index:2;width:110px;height:110px;border-radius:50%;border:3px solid #b0c80c;background-color:var(--paper-card-background-color)}.control:active{opacity:.8}.__dark .control{border:4px solid #000;background:linear-gradient(to bottom, #3c4042 0%, #141c22 100%)}.__dark .control{box-shadow:inset 0 2px 1px 0 #5d5d5d}.__offline .control{opacity:.4;pointer-events:none}.control.__inprogress{pointer-events:none}.control.__inprogress .control-icon{animation:blink 1.2s linear infinite}.control .control-icon{content:"";position:absolute;display:block;top:0;bottom:0;left:0;right:0;background-size:60px auto !important;background-position:center !important}.control-left,.control-right{width:90px;height:90px;top:10px}.control-icon-arm .control-icon{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5BAMAAABTxLEMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAnUExURUdwTK7HCa/HCa7ICa/JCq/ICa/HCa/IC67HCa/ICa7ICq/ICa/IClsek3sAAAAMdFJOUwBor+9YJUAOmYTd1n4m6zkAAAFiSURBVEjHY2CgPSjUPnNmkzhhdUFnwECVkLqiM1Cgjl8d2xqYwlMJeBUmn4EDE7wGItSdOYzPyGCQipVuKbNAtCkehTpA+SUghheQcQi/zYcKQCx2kBbcdnMDZRUgTCYEEwuIOXPmdAGEyQ4Mp6M4Fc45c+YYjJ1z5sxJfH7ZgOQM3L6xOXNmAozNCQxJXOrYgR5wgHFYgJwCHApZIUHC1tGRAAmqAPwKGc+cEaC3QvaZM2cGEKMQCkaWQjYlMFAEKRRSUgIqVMKexlkgue8ESGEPhC0wOBUugnhGi5DCQ7Dg0SGg8Airi8eZMy0uATkEFJ5ktQGXUAFzCLkxwAdiMEHPLOcAkQ1VBBUeYt8DKlh0CIejALCQNGUkIsCPAmmHGCIUni7oOcG+hgiFZxSqtzOdIUbhQdYAGaIUHg6ABDpBhWcsJ58hTiECDCuFDtiLRxt0dYdxlPZBxmiAYHuBIgAAIQnoLvIbwwcAAAAASUVORK5CYII=") no-repeat center}.__dark .control-icon-arm .control-icon{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5BAMAAABTxLEMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAhUExURUdwTB8/VylScCRJYx49VRs3ThczSyNEXydPah06UStVc6M9+VoAAAAKdFJOUwBq7q1YNRiT10a46eVnAAABWklEQVRIx+XWvU/CQBgGcAgUytZo4sCmiSYyYRoNYeqA0Tg1sjFVXRwZTGqYSDCadCLGia2thPL8lb7HcdAg95EYjdFnaN+mPzjuvXJQKHx/blrAaE/vuljkVOfusMyZ2lkNARNfCV+xyrHK1ZDLWAFvGXg5f3tk5yMFbNP9J1ZcUpGqR07XL5GPbdPdJi9LVA6lsAdkoo6AqRTWgbmoJ0AshVFuODv37p9Cy9IXdZUWR+YqNAFPXJTpIlBAWuFaGI55qzSwCDj0ePwsDMMwMIHL/C9ouYucMLjrugTd7c94mX/5ZgwOeO38Tjjik2npYCra09bAudW5AB46/kQDY77xJX5d9xn9K3Z8t7STea6yY/9eC1O2DWR8Luo+OtfAYdGg4VM6ez0DmAWDWSUygGjawxJMYGzxJmph4q9+bdQQ+zswg+v8Keht3x4bmy6RbBXdg41o/y98KR8nE5pZ51F5lwAAAABJRU5ErkJggg==") no-repeat center}.__arm .control-icon-arm .control-icon{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5CAMAAACWNFwNAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAzUExURUdwTP///////////////////////////////////////////////////////////////8/RimEAAAAQdFJOUwBp71kqD4etmHfF3Ejp9156u/ilAAABG0lEQVRYw+2X2Q6DIBBFUWcERwb4/69tLUuxtWlYkj6U+4QYTu4sGVGIoQ/CjizY5O6cM6RsD6wm95RR0Oouxz20NrlcjHvT3mBycldi6MurJ0KKl1YN2ipOUdflcY+4ZMhG5FrD2y4OYyx6RdDIV2YiUVV0jD8pY0JD2nD2HV6eRXmOjehc+qUYyCeDKsWOpi5m9EZsZmvJrVPxTMgj9h1pIKs+VwIxL7jvZ5/EuQWYJg71AapsdvUA2nwuLO1A2O96dDMfK+iRQyHWYz3lnf1roJahsvKQjkB7PKU3unwyBG0RqE7b0wAO4AAOYF+gEgh3YTfgHO4j2nQChs8Jv2y2AC81gP8ALLkVI3/ncdG9HWj+Imr90R36qBsY+E8HkngydwAAAABJRU5ErkJggg==") no-repeat center}.__dark .__arm .control-icon-arm .control-icon{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5CAMAAACWNFwNAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABOUExURUdwTCqu+Cmt9yeq9lPO8TzX+iqu9y7Q+TPQ9ySo/yqr+TK06EzH7zTN9Cy7+T/Z+i7K+zq56i7O+kzW9i/B7izP+C3B+S2v5kO+6y6w52L13l4AAAAXdFJOUwAUPBz4rkKgyAcs/fvUTrx0/o3i6bFiH/VPBwAAAclJREFUWMPtl9lyhCAQRdOgIA0iiFH4/x+NLGavSUBfkvI+WKPWnLq92LZPT7e+SlAkTDOCCOICGqB5Hpdt2+Qyco1wkgc4R9ghOxoUp4I173EJOeh2kwJ52D4rOEObec/bd/KtRHrwgvVeeW+L3aBMU9Qwh4JTbuLz3A+qIKXSDZURbCn/djOhIIAi65UslcHmgKWaGLwWfXWypBHqDcqcryk3nkhH0C7kfqy2CDxbcaSQSPIEq03X67OIYwq4y7EBWwq5ZMLz2phJitg6zB05xkJEotCyKWax5sh6etgKltPCjtZdLdBkoImuaO7IXFo6pGJ1pLarM3AVsRC54EGtcCSxGajfOjzGuRfmFDDsQIHDu9mF4qxDQbmUMuUwSOk5PetQaNd1yqaHsOs6p087BCREx6h9rwlBaAMCpicv+BURKWAG7j8QWQaqlVa8A4UZy+wao+YCRB7PXu9UTJwyGY6RP5EMJMOHyz1tBrIMZBcB7dXA2+Ht8Hb4y+EwKaU6ftVwsAMh6y5CxmuAwc8s6eOC3A6Mr6dll/y0GZ8Afr9q38C/Dgw/A1XFViy0kuGxpO9q9nYw+4r0WK7uUyWuSI91+lP8/+gFQCF4nr9gFrsAAAAASUVORK5CYII=") no-repeat center}.__arm .control-icon-arm.control{border:3px solid #b0c80c;background-color:var(--paper-card-background-color);background-color:#b0c80c}.__arm .control-icon-arm.control:active{opacity:.8}.__dark .__arm .control-icon-arm.control{border:4px solid #000;background:linear-gradient(to bottom, #3c4042 0%, #141c22 100%)}.__dark .__arm .control-icon-arm.control{box-shadow:inset 0 2px 1px 0 #6ecaf1,inset 0 0 0 6px #2bafe5}.control-icon-ign .control-icon{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA6BAMAAADVUMOiAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAtUExURUdwTK/JCa3KB67HCa/ICa7NC67ICa7ICa/ICa/ICa/HCa/ICa/GC6/ICa/ICoBFFDMAAAAOdFJOUwBVHuh6DLzYP2iwmC3LRjiRSwAAAfxJREFUSMfllb1KA0EQx9doYj4sEgtJFWJE7MTCYCOHxTUihAM5UgliYSkhIHYhgnXIE0hqRRFLC7EXJC9gMLmgCdF9Bnd2b3O3s3d+gBbiNDc397u9/87MzhHyqzax77e7cDBB/Vb/J2C0UCjMA1NlTsH6OJdxACtfSPr3wPZPrXhimuYWgKvMMTfzYdwUVW03DDxFYDesyRBHHZzJ+B6/5CRQJcQiB8y5Qit1euPtckvL5V9VrkYZaNsNyb1AdBu8NwWcpgAaaA+33G36wSQGK56OIgA3Z+dpN3sqCNGycEcAGK7YOAK5xJKvJ9mjPsQiCOyKmLC2APnLzFFAkBiTN0MBUl72S9o3TQ9s+nPv5AWY9uvxJEa919aOjsZ5yikgfCyFq043AFxWQiCxoYG86pNKCD5S00DemjFFoqU3sDxESSwxAqe6owli4MhLz2Hg0KArAnz1Ei775eET0Fm0bZvJjKL9PGkruq/jTAaDV7gIYWCdRAwapvHicfzMQalVQUJ2ZHCE+wSB440OfCdXqUzKPb8LVJ6ocnCtyf06v8wYctOXGtgSZbDFxe2ueoIG9yOaUo61rIPNgLk3inbUbqrpvxLeiIMU1UE8AGHiFBs6+IxnKfTwtaGDQ+3XxeTNUR3saeN5iTqlALCl/w0z2Yxis4QcZ7Lkb9g7j+/RMBA43Q8AAAAASUVORK5CYII=") no-repeat center}.__dark .control-icon-ign .control-icon{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE0AAAA5CAMAAABEZFZVAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABUUExURUdwTCZHZBo0SBgwQyJDXCpUciVIYidOaiNGYBw8TihRbilTcB07URgyRCpUcx05TydOaydQbB8/Vxo3TRozRylRbhs1ShkzRxgwRCtVcyJDXCdNabfeNDUAAAAZdFJOUwAR/Ykz7qW6Qgnid+Zj+lTTZGscd4rEoc0Nu4B6AAAB/0lEQVRYw+2X2ZKDIBBFQ9xQESVuA/z/f44LICo0mpmHqancp7jUsbu53ZDH46Mucqt7i0aEW81btIS79aHBKpJFVFMSpewnRmGahn7Ddq9/T8vRKkNrkdZ9WPRUEpr2NCJ3eZHgfsno5vyAYJyLOASorUlTHWF9rFSs10OA9fVM/bAi1wssVa4VwKqIkDzVK3mC8VK91xJ9B1oIMn9yoY32Kp5CG7d7o5+Wck1LXUXXodXSsRD116TBHu8lSNOh5cS+O5hSzhJ4o2GQpkOL5M501a7zLAu2EC1RocWHeqqFULTCnowATYc2HB+MNk22Gy2br+cWlN7QqtMj0VWT1PdpvdH6+XqRL7SWOBpskbqw/Fx7W1KHNvKAusMycMBrWIRo6YXtToWWE36HVsChIaxUeGnZntaUkxp31czck1dpmcNv5R4WA9VrgjSK1ZBcrYmg6oVpZmdZzTRKgFaEaTpG5BzJd2OzK9zCLnHRMGOsP73JZssNsN9ca2q69pRoJN+kHfPNrrSW3QtxSi1anh0TbYOt1e+cifDDg5sTHYJ9+gJ2WNTsEu1kkFZDm3+bWIn6OopNbVKq3/DRJKYmUe88wtugpTl8NMFUJ+rtKIsWPKmr0zirveawaCx4iltKQmOvOehGoxeOm/2UbAaYw9Bof+co7ZF5Jf/8nf9D+gYvMq4ulbKqCgAAAABJRU5ErkJggg==") no-repeat center}.__smoke .control-icon-ign .control-icon{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA6BAMAAADVUMOiAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAwUExURUdwTP///////////////////////////////////////////////////////////0Q+7AIAAAAPdFJOUwDveAuYvSiJYThURN+m9rQi6AcAAAGrSURBVEjH3ZSvU8MwFMcLHGPFzeHKTWBXMOCYmB/cbnrFYBDMTSLAb9yhOQymZiDA9I7bf8CfwJ8wOtYbcLBH0pdCury3YDB8RdMfn3wuzUviOH+bs5qW6hywDlqe/x3olkTWDPAoiiIJJ6KNbuSbS9llnbRWxJfP7MEdiqeRYwdveWEOdD1emAM5oRuKPMmfkTdhwApP9NmBxD9nhCs5DhqssGIVXqTXolV495E2XZvwGlJw1SYsgAQ3S551hJ4Ed4EVbnc6GynYIkBdeAw4NjHNJojCiXOKIPQk2DdBJWwXRwpso9oAM2F3GiA4kOACxGHYJYUAewi+SHAZAOgRit5Js9kS92/EWsgJs7wTNc4Js7yq0tiEqpRDqxDGqoY2odpE3rRWq88VZmCsTTgphMQESSEB0kICbBQooQkm/gEl1EC1FRih9td4IHHCHOg88EJVmcdYHQCsUPSV2dlXRworzPZ3AZtFVojrUTsLOCGu8J9QwvvD7z0zXxiktRiYwurMCBFsG8Lx7AgR7FmFCMaEsE+BE1O4VJ6J72yVy1em0B4U2rlfC635Ag7yd9dtbTP7AAAAAElFTkSuQmCC") no-repeat center}.__dark .__smoke .control-icon-ign .control-icon{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE0AAAA5CAMAAABEZFZVAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAACxUExURUdwTC+g/yqs+Sys/yit8yit+Cay9iqx9yus+iqt+SbK+ims9jS6+RPl+WvY9lLH+iyw+R/b/CKn/zvA+Suu+BPp+ier9yPM+1LK72fW9Azz/zW5+i62+R/O+zTD7xXh92zZ9jXQ91vQ9h3n/E3U81HR8jS6+ULQ+WDR+UvH+C3X+1fL+lPO9Bzx/T7X8i2v5iuy50vD7TGz5yq16EG96z676hna9US/6zK36Qz0/iLJ8Pw60kUAAAAvdFJOUwAFKQsWahsSM1KSOoD76YRKrg6KQfYhm/7x92ZfpOX848bJ2Obxc6m4onhu1tf50GJAQgAAA21JREFUWMO92OtimjAYBuAmQZIQbBFj8EBrUavVtkNQK/P+L2wJJ7GCiG57f4nC00AOfOnDw38JAKg8ANyA2QKSskCBm3NIGJ3yOBA11jCbfpenx3FjTbNe/PL0Le1valT/FxpAmi5UdIxqOkbjdXcKNEjdkYxLuV6jYTLrqwS7FImCfpIBwwnGjOHvJF913Yx0Hv9hc5lqwdIcxS2xBEqx9lr9EO5frbq2PSCsHgrkTq5xGD8kTT2kE8yF9pWDGBqZZhRupyEGENZ0GXFsm8GF+kbXMEINMQ1yi6q0Mm3rtOIvLA51vSHGnGGadjYy2tk3XxavxcBxpZHY83iTZp1p6+R4P5hTJ8dGpZgc1roNji0bryvG7u7RbF3G5BSBfNQR6Ed/lWLdOsyGvDsdTuUYB7amy4M7MLkwrqbDQzizNIAhp67R2zTAgI1ljtPeJtOD/FlqCHbkrBtWYoNzDOmEcc6glg1tm3l+otnE86vzAyM4nmHuVKXDtLR1iCwyjXlXYo9zC6rrgVgdVMb52wJA8wrtFDNdo0OwurabrFfT/G0haKg0F0LqXYm1nsffc4iBTdJV4Zcriqt2ODNdOvcuYEYvGTgJto6mLoOEOvkSkz44zBUSqTl4uBrz/UPn2XGeO+mi0CGo2A3raBNtNhew5Ldthvn+d1vmOz3FY3bWDfGjXPtrvwl2kq137AY3rBlndZgfzXJNpy93YvEAO+nU3W4XhTdifvhGi1oYTGRebsR8/y0vKGLtbU6tlncrVihPcKy5UFjerVhBS9pGz+ZpA+ysbWfaGdauxkraJldL1bG3YOF52+Rq9S47NmqOqctzjaeaLMQZd2OuGSYvz0cvZi9hfCg3CbYs8iZhU0zOrFxD4ukzSKs8dUQ/tw2x4jxVb76RIVBeZtGJ2Qzzt5/Hwh8UKwfVOkaLmFOOhdsg2KeV7HbC7JOq5qRG6tZj/m6yXC4X6Uq+IBW1L8DEvALz9wvKsvdC34TgLkxqTEvfWdGgYk9yNSY1gtO6WD42XI9R40Jv7hfQTl4pYb9bumU4weZ81Quq05eDSqziT69cA3UYEdbHU3U+OJbnqzM+mECl+4N5AcMIC1gdtYsGWI8/ld+n29tvVQKFAVVbX0hWfoOqwbFavCdx4Q3797PNGiRMhkBh340V/m9xk/UHbfGTBtgmXj8AAAAASUVORK5CYII=") no-repeat center}.__smoke .control-icon-ign.control{border:3px solid #b0c80c;background-color:var(--paper-card-background-color);background-color:#b0c80c}.__smoke .control-icon-ign.control:active{opacity:.8}.__dark .__smoke .control-icon-ign.control{border:4px solid #000;background:linear-gradient(to bottom, #3c4042 0%, #141c22 100%)}.__dark .__smoke .control-icon-ign.control{box-shadow:inset 0 2px 1px 0 #6ecaf1,inset 0 0 0 6px #2bafe5}.control-icon-out .control-icon{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA6BAMAAADVUMOiAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAtUExURUdwTK/ICa/ICa7ICa7ICa7JCa3HCa/ICbHJCa/ICq3JCbDICa7ICa/HCa/ICpfP4N4AAAAOdFJOUwCb3vHJPhmBK2ANUW+0zmTnFQAAAjNJREFUSMfdVs0rBVEUv+PjGc9HrJ4UsZSysvE1KbFQXk+kbCR7elY+kpSFbCTZ2Ij8A6/HwkISC2UhNpbKjOfb/Rucc+6dMc87d97eXczc2/zu+fydc0aIf73ikwv1KxPFcRtJias1VQR3IvVybyJx4zJY7nYE7lCG1vO0EWd3hIGyxwgco+99iesmdePCgCt34KPXQLIvEfgVIdDznc0ikvcnhvoecJfGxyqcciywxldmv/uGuAcccB+AGdxYLp3X4VzH5RgkkCixpWyzHV53RSCgWbbQ+1zKbwZ4BCapsPuSLbi6xpqY87+rGzGHNRLo1U+buSCAEKHuwij6PoOJoSufBcAqyAq4vjk/gCnxRpYmKLJPnNNP4sQJkaczXQ1c4/LyRckJ8dEmLX9WCTndHAIOCQHPAvaWSvmiQucLhDx3MIGslfJDhEUOCwKmDEArLJAFKtW/IlEgq7pEZ1A7rpjIOVOjqVCmJWp6FIbH0lko1UBUWckFvFJzZk4DM8KQQiQFejilgWkTKZBmd/C6BRA2tDsTzRCRU+EZtB8lVkOcJ+6Rsjwp26FUHzH6lmTirYoLDHPaqKiTb2TuM9coHDTd7tU8bjOWKxrppeJ+b4iJGUMDoJy85zdLl+2lqFs2BscrY5OiWAedezyik1YRbRZJ+i7uX02t+ViNmJW9+WSQRr435zf7LvP4mM0r17WIQZP9xXkXkaNrJxhcy0WG4aiyszVTdLzGzurvE6f/+1fjB0WB+ouKPHkOAAAAAElFTkSuQmCC") no-repeat center}.__dark .control-icon-out .control-icon{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFEAAAA5CAMAAAB59jczAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAByUExURUdwTCw3Vxw6Uh89VypUcR46VRkyRh47UipTcCpUcSpRbxs2SxkxQypUcipUcxgxRBo1ShkzSCpVchs2SyZPaihRbilTcxkyRSpUcBozSBw3TBgyRCVLaCRHYSFCWyBCWytVcyhQbSBBWSRIYxs2TCpUcpVEk5YAAAAgdFJOUwAFJg/ZF2g2kMRS3kXp8sugWnnyQWmjg7CTuHzy0+uy8dU4BAAAArVJREFUWMPtV2lvozAQNZe5jwDhSNItGPj/f7HBxiektclqpZU6X9pY1uPN9WYMwK/9v+YksO37voWJ9zfg7DafZ4SmaUJonuPefxMvyWc0LgO1ZZzmGFpv4Y2DaiOKL2fDVxzgYaIot08FMJ6GVzZVyQmPK04wC4OyLIPO5TwRNAek+UgDnl67ZKDobgboU8D0qmQ2ophmLL14A+wcetRSZKukkCaledtieOX+CpTqjMQydrQB4ZbliB8VQ8zdt1NSmYV2If7ZAdrTMAp1bROWk67fdxLEAIgUB5EkiMg3b0YUXUuiOEgkQWNCEhKKtUgRH8ViNRC/9SJ5w3dDoFBUSAY43Q8dHfImNS0bRYUkqSCd/r6QXsEfd/zLvcgrKhnjnN+Yknf4qNdA7PHN5gmdV1i9ZcVdlbzKWwCu+ORDA/GTdovVLcdatozuk6aP/39oIH7wTDcv5NFd288i6BrD7IFv2uA1ZEj6ORUufmvEVUeokWNAQGRNo8YHEfEAkgLqI2ayMypkyGpa22v1050EmDJAi2ioRmZCfBEqv9m0Zog2DnimUT2BIgEPuRaZl3DX/t93IZMATynzi9wJgY5SYCpMAhIlMy1V0b2g/BDIm+Tcs0+2v5+S0Gdaw+sqyXNBwlUDuxOlYRP6Rm8qkIrMLdbmLvHND3my+73Q/5jtsd1S7fK1og63Sk0m7UwLMwQleDTLa0rkrsm2q8GEIo3ksK503i703roILgZRxA1G0r1Ux8usH5MGTA0WfS/dtsT+oDog3SxrYGA1XWbji6Xu5mjrotJsgYzYzh3fuWB5kO/6ATC0KGNvgzkuWgjhc84+nyK0G0tgbD7futeZitY5yzfzCJwwr3v5VnBPvT7EnVu2rDz/6rKue8y0dMBb5gciaNpEFnjfvKgMmq4JysgGv/av7AuNI4hqWyxqywAAAABJRU5ErkJggg==") no-repeat center}.__out .control-icon-out .control-icon{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA6CAMAAAAQoC6jAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAzUExURUdwTP///////////////////////////////////////////////////////////////8/RimEAAAAQdFJOUwCdFNeGB+hhTvLIPXK0LiI8We9ZAAACGUlEQVRYw+1X27arIAwk3EFA//9rT1tQAqg72POy19p5arvqmEwyQ2DsL35lqMVICVKGhf8HtFX6rYaA5Ts4i9EKZlCP4ZYR7h3aPKQOtqvw6wO8JLbrcHa+XIcejyBDkFEjyPAYT8tUWx7EQ8QDT/c9tQfkTGv4Xlw8RlnuwEruiBMjGYeyEkpoT1+ThWMKHmolbKLWnkoBMFkwImltvyY3VXQhSTKc4EtzuDWFYppCcoKoxE+CbVuLitIEg8vwOE6ROzqLucWe9Qm2KWZeHMF5+NDhvb42xfFvVxaYZ+zzap6MBF9V7USUpvh2HDp322N4m6u+8hr/wgkDM7cUvuhS8dK9BH9r54P9M6CoPYYbPKby55/llxlb2TWizyCaOInNi+EaD5dCBzxB9IrNAeKSq7CPiMcoU0vuX9z2Wh945KbETmXd2ayq5RLHRnaqdy1gaj3EU81Gd5o9wraVwLQ52A5QTptDIW0347CrY2tNmm5fncHmQfSWpYgtrJw7JIMtZuxrviIXliEVHvhl/pByr+1N4f0uIWY98Rh1lfC120WsMJ9f53aHUHc2PrC+VjzqQV/Vcb4P7YsDfRWpyxKcjEVwG30GD/brPq2u9u65BbEKRMi6UHPjB8mQER2+nchgTABxIsGJpV3fLe1Pbhb85hhN7FHY85uFe36XUmaE1OG7K+TStEKDVezr4DYARIBgE/uL3xj/AO0MRSFH4birAAAAAElFTkSuQmCC") no-repeat center}.__dark .__out .control-icon-out .control-icon{background:url("data:image/png;base64,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") no-repeat center}.__out .control-icon-out.control{border:3px solid #b0c80c;background-color:var(--paper-card-background-color);background-color:#b0c80c}.__out .control-icon-out.control:active{opacity:.8}.__dark .__out .control-icon-out.control{border:4px solid #000;background:linear-gradient(to bottom, #3c4042 0%, #141c22 100%)}.__dark .__out .control-icon-out.control{box-shadow:inset 0 2px 1px 0 #6ecaf1,inset 0 0 0 6px #2bafe5}.control-icon-webasto .control-icon{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5BAMAAABTxLEMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAqUExURUdwTLDNB67HCa/ICa7ICa/ICa/IB6/ICa7ICa/ICq/ICa/ICa/ICa/IClFJ2M0AAAANdFJOUwAL2jPCpx5d8Pl2jkqTiWx6AAACIUlEQVRIx71WzWrCQBDeNBpFLUhpDz0U9NST4LE9CL6A4AsIObaUgi/goRdvHorgpRV8ASF9gIL3kosojdZ5l2ZnM2NiNkug0DkN7Jed+b752QjxD2Z95ARedXMCB0Pynoy44q4eec6tEbjckHfxasKV4IdI9YzJ3sOecoC+SZsWA0dGYBEotDOHhgE4AtjyJwYy1gQgUK4P8J0NrEJobXR7AOts4KMEIgdbeotM4Kc8nvHdY1OKEZuC9DbZZUGTXVGGrNhWHyWhiOfoTTXAgkfXYGzlruuaNgxVeQaOfaY8T6Ng+HEnAs4i1rrYI1kQAoZsa+wlzZnsYjdKtq2jAgkqWDnKUUb0lXfaQT7eUibgpk5SHU6AYaAm64ixrRZLFTOZ+p4ro3jfKSVTjQ2BG9U6yTspOcrbjboHbRUOLjpuAngDKvYDAxuUcfJG1GXXFhUGvgtFJxDpGyXvHgG3OOOp0qgWeAvXCAGDuhJhrxkqGdueE7KtBmyWBNrqsIuDfSyyD6lt0aN6VQnoYUaBq5tTmblFdORVldMUuXjukY6HlU1vvgElRnQk0E5FFuKST0fcu6Km2T7OhIBVLrYoedpVGwFVI+LKtzK3xIIV2BreF9p4Fd0IxOyC2hnbt2l6OEjepXE1ygF7Uc61funEtuiQh/xgeot8YlrRLaeYdcY8vMbIorPi7pwa39WvYxsv8j3t9jbnP0CpmRPouH/4d/kFM5/sDR450QUAAAAASUVORK5CYII=") no-repeat center}.__dark .control-icon-webasto .control-icon{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFEAAAA5CAMAAAB59jczAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABLUExURUdwTCA/VyA/Uh4tSxw7UB88UiNHYSBCXB49Ux05UCpUcipUch48Ux05UCpUciFBWBw3TR49VCZMaShSbypTcRw5TyNGXytVcyhPbICkqrIAAAAXdFJOUwB2EggeSP4uVmXQtvHZ6TyrmpGF9sTWE7J1NwAAAi9JREFUWMPtV9mWgyAMdQFxX6pt+P8vHRUUSJwR0TMPcyaPaXN7k9yENIr+jOXpw4BF8zRgFmMXi2+lXAPDgE1+A7CroUSupJluFJbVAJXrSt+yCgdMGwkwuL4hw54r1s+AKD7P4AbiEg3QO0WcywCfUMA1GsUPC2uZBCKu0XO8pR6xsoZAPepoJ35QniZMPr0GBDOFqf4RGdQbtlEEWWw+vrkyHoAYw241I77mSnO4KtLHIMpNQC/q8gFUZWPSIEJWYETIvLcFr1Vrc7BN5x3brsR7NXRqLTqI8FabCOBq3mkDQOksSSrmre3ivmMijhAhW92j7fJ5LfiiwfygjtucJDZJo9PvrTG7RmBEGTsaN8X98ZFaFZMxUjLVXIEE5OyQY3urL/ZYew6lyvKcaXITtRIvSRvk6rdLebbVcle8FRw2JxKTN2LsiveAZIFkUHhvGzXHI4H8oPHmvlnrOU5LQlKpf//gbLSZFbvmzYiCdOF0Qc4vgRIvqw4juovyfLBz0tf4uJAqndJjrkvSVySh1v6m8NmOLZ4Q1J0pMmmPfhvcIpmSH4GpNUorPd9sS4OdviAnC3IvXdwy33fGFI7TZ9ZcZS//MzcpEUenOzvOlTNlXwTsoF9hR1mBSma9i6HnsspyPNBpF4i4Tu3EKO3wi34h+XKecVVbEYw4U2oTWogxGHBZOR0Vfnnjf5EgdOatNIXnPHMkdHjwNa8lndDNWUXPWtEmDyNyEf3bL9oXTrxZkQdpvtsAAAAASUVORK5CYII=") no-repeat center}.__webasto .control-icon-webasto .control-icon{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5BAMAAABTxLEMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAtUExURUdwTP///////////////////////////////////////////////////////81e3QIAAAAOdFJOUwD2DDggUsPmmq7WZ3mKzk0xqwAAAiZJREFUSMe9VktOAkEQbWdAQdSFsCa6kcSFwQuQYefKcAEnnIAYolsyJzCewBgPQDyB8QTEE5hMCAh+6gx2VXfX/Ho6JCbWqqDfdNWrelUzQvyHRRvi6sMNgQ8D4104cbX4SHuVWydwtjTe6aELV4WV9ryRM9lz+Dak4N6B86YMfHEC6wA/mkobHh3AEGDNjzjIeBOAD37kqxy4D9K65I4APsuBfQRSr330nkuB73jc4rtbpSm28ZjYbKO3LG8LGapii7xX220RlQTtRv48IK9pK7UE7ijgmm/8PLLIUFblUgGR7a7y3iwVlA/3NFCyrUFJ7DAWCXCp62jhXWmngch2mlQgbdvUOZMjRgyVd11UzSuzpi7rUi1yQBlozIcU25tyqXItkcpuMLClBWJExzMq/4oD3WvNVvczW3JKbqjVY9jOyAkywDNQsfsMHJqMszdSXeJuKsm5UHRiUbwRnmgAlK203nOtURKQg9oxQLypofLJs6bYPvPuqgHLTYPPDF4gkRr2Pr9VR6ZfNQN8o4ziwDanlLmhE5FICztA1yVI6ETU2eLmuzOJGToY2i9EFuKET8OEjL8ozlZlYuLVkvJUI+uq1TcqIdLK92xbosFbqW8RbJ4Obbw92wikrGPkjNu0MFTZ2FoBM+dqFGKC84V27Fy2OAcDHvK5CxgapntF0WSsd8PDa1t3KeCA1dl0vlevuJ3WlWwxf73hN0B1vCGwEvzh0+UXbYgK10jZSokAAAAASUVORK5CYII=") no-repeat center}.__dark .__webasto .control-icon-webasto .control-icon{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFEAAAA5CAMAAAB59jczAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAACxUExURUdwTCqq/yqy+Sqq/yqs+S6u/yus9imt+Sqs9ymu9Cuu+imt9iqr9ymu+Cu3+SOm/zbE+jPM+iuy+S22+VzX9y+6+SjV+ifJ8F7S8h3p+0G87DbM+y3G+iXa+x7j+yrT+hzr+1fa+lXW9R/Y9DnV80vD8FPN+DfX+ynd9k7H8x/g/CDn/EvG9UK+7Tna+y3i+mXV+T/F8i2v5i+x5ze36TC06FDH70O+6zu66Sy/7DvM8PPJrvkAAAAydFJOUwAGEgwpCRwvIhc1PERKXw55mFVQ2Guz/fbk9IyDvNeo77Pp/Pzdp5n9ysPMv+tn343Lc4lG0AAAA8ZJREFUWMPFV9eS4jAQxIrOAROXfMsum4NkY9j//7AbGYNl1x0YH1Xnx4FpTU/okTqd//IZFNPbAiJmW/SmgPxjSYKKjeLgH45AdrhccaybMOMfyGgNyMPlNiR6SNh0XzesLWJA+stk1GU6ZdN7XXfbImLTH6dJz7O0vDL3ZdjzWMuqMG++F7uei7Q0OIt7sFjtEC1nNhQi0RExn94rSzvE3FtU/A3WHUuR/vKsdpyVtwD/mJWcB3swrX2zTWWQM1PeQvz0j/6G2VdRi2xhB9cD0sJb9w+cWaos6Web9kHOS3pATD/jwp/Fw4NpOHDQ1Vk0/cIbaEeHIA0yLQ6RTyHBzelSFRC2B+kRUY59k+bFHxxNyThuzDtgNgN3y52LE+L+xbWMPI0n23DmNOwgRLpjRcj096L8niY8qCKKpynHzaTBz8XLIJEGKORS8YZMlKZ03G3SlBSk4WfCaYfyhY4o9q/Am5KNZgLeqJk0gBwa1XDUdx/ZCOqf6Kmo6uZfenAwFNvpnxDlsk8wcp41UzK/ON6UhDAm2QbyWGcNvOceC0i400zryaUgLW8O0pC8gHoZZFJDFOuFjSznLdWDdNGFECM1JjJXFlZJWf4Bb2R2H6R2iH9ey1HR1PsZ1BW5D3VEVW9E+nelJYvI2QY6TbJqXswjWYe8n/IA2dMyldmA0/OkZdm8mHXf64jp2GPUch5P+chmNj67BE4NM4Q5RnaU1iF/Io6hZ5+PP2Sr84haC8IcI+Y91Hmnn7ByaFkdaLSzrLUWVHNcLUJRXLUgMC9+SLfh2dGGFixjUvpl2dGuhgilwGq0HnPeyaWdyOK7ilghy32rNWXyqtQBtmTeWtvzaVRHv8lKXbEZ11JZbGpsq7ZIRpeWLEjLnV5XgjHx3yuQchRbx3/K7ePFHQsNk2hDCwQDHt79ARF2xrfI4D51SXINy30u19VaXfKQU6mO/HVABNlLRv0G65DqQgCtkR+iV+dYXcwX2y+7ycrGWg9mEyUDtFKdXe+wCbC5WtlWo/WK+EkItjli5ZDT2BkoJg0fEEYpBDnrvF6TI2+Z76DDcwE3vQAoIchZpqPikqfqVfDetbo4woJ911OmZK7grToQX4+oulIq73ItIfetqHS7N4KRa22mvRBgR6ZFiC0uoof5hizq1zkWq0Q0GZK/CWUktyun8uT4VsJwzZ2xJpRh1qtcD7G9UJyvv9eeEvkx8ivhYL6R7TkrkvGHiWp52MEh7Z/AOEDViYBr3ijkQed2H2WbL24ZN0TsBBZDNwWEat0Y739+vwHMXNtx+i3H8gAAAABJRU5ErkJggg==") no-repeat center}.__webasto .control-icon-webasto.control{border:3px solid #b0c80c;background-color:var(--paper-card-background-color);background-color:#b0c80c}.__webasto .control-icon-webasto.control:active{opacity:.8}.__dark .__webasto .control-icon-webasto.control{border:4px solid #000;background:linear-gradient(to bottom, #3c4042 0%, #141c22 100%)}.__dark .__webasto .control-icon-webasto.control{box-shadow:inset 0 2px 1px 0 #6ecaf1,inset 0 0 0 6px #2bafe5}.control-icon-horn .control-icon{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5BAMAAABTxLEMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAnUExURUdwTK/ICa7JCK/ICa/HCa7HCK/ICa7ICa/ICbLJDK/ICa/ICa/ICn7a1dUAAAAMdFJOUwChU2Z2JL+I8A493ZeNuloAAAF2SURBVEjH1dW/S8NQEAfw2BqhuuigIDgJChUHMYMOHfwFDjqIgwh2iODgjwwOgoNL3TN0EAedzNKCi39ABkXSVnN/lJc2vr68dy+5Ub9TST8kcHfvnmX95XjfTBhyoc+EFYh4sMSFI1z4zIU1JrR9JhwDJpwD+OK4I+DBB58HW4mjoB3MiywFa+fQz7vmXnygosFHABa0QwNsKPAEmNAD3qdLwITYVOidTkm5omEdH11kHz3dUXAZX9hUK7ZIdKYG8KH3al2H+wBdoqkhE1rH8uAu5MBxGXpnjuPgKHcckdWD4YhHuT3pTYuyRQXNu/5tRBHsDKpaLoQwOShQMfzU1p4Bph2VFql3j7OCOh5OzkwiV9TVvEUUvI3Q7f8KqrktLCN8Iw+7AivkgabGzAhxcGPlCDVIWBclFofXJeEE/hPf7KTZTLbLBglHTQXXLh5to3QNy7CtQtd4RWUTN0379TULZ83X457sLvN29uHubZrtqvX/8gOqotobc9imiAAAAABJRU5ErkJggg==") no-repeat center}.__dark .control-icon-horn .control-icon{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5CAMAAACWNFwNAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABLUExURUdwTBkxRB4/VypUchkyQypUcipVcyNFXh89VhgxQyBBWRw6UShRbR48UiBCWRo0SBo1SSFEXSpUcxgxRCtVcydNaSA/VypTcCNGYOL8p08AAAAUdFJOUwDMCe5mVcyKPO55JLNZSpz+aN+4pXLEdgAAAZJJREFUWMPtl9t2gyAQRcNoBAEFdVD//0trImnTKAJm1mofsl/VLZdhPF4uH/4DpbWSVCgRaYWcWqiJhVAgdpTCdiIWGqQVqnkRNoQryJBWaBypEMxtwnRCxVYftjQ6Yx1SCUFIZv3wEoXQmIGFqO04OvxBxHVlPc4uyIS/iQphGF+fOUREq9UhUgqHTF9M2MxIK2SP+4o9+r4v8oTKT1ir8CKrK++fhMd12Kw3VRBZaaEThRJTD7yokoQ8tfqXqeuUl2cI75+8gFCoU0KoQkJumSzvrC+deLlDs9l5ERSiG1d8Wc/jHrY2ajvpLrxyESac5pdo1L4lvDMaSEgOGUKceUK2yRHiLOLpK0uILJ4POeruesdXv7zuIH2jcU9b3e0LVVphr4WM05MCFt44eu161eRF3AMhrCPUeSH8oIMo330zhL7BMgjmywWek1n8Rg5qL8+ciUe+Dztbb3jkmQJyhO13K9jwuJL5H6FjB6WCPCFUx75CZce/wzFW2b7bAe2Dw5NwOQMIrqsNmrfndB/+kC/Ha1TSqFg5QgAAAABJRU5ErkJggg==") no-repeat center}.toast{z-index:3;position:absolute;left:6px;right:6px;top:155px;background:rgba(0,0,0,.86);color:#fff;height:42px;line-height:42px;text-align:center;border-radius:5px;pointer-events:none;transition:opacity .2s ease-in-out;opacity:0;max-width:300px;margin:0 auto}.__dark .toast{background:hsla(0,0%,100%,.9);color:#444}.icon-btn{display:inline-block;text-align:center;cursor:pointer;width:28px;height:28px;--mdc-icon-size: 22px}.gsm-lvl{float:right}.handsfree{display:none}.__handsfree .handsfree{display:inline-block}.neutral{display:none}.__neutral .neutral{display:inline-block}.moving-ban{display:none}.__ban .moving-ban{display:inline-block}.version{position:absolute;bottom:5px;right:5px;opacity:.3;font-size:.7em;line-height:.7em}.wrapper{overflow:hidden;position:relative;height:270px;padding:20px 16px 0 16px;opacity:0;transition:opacity .1s linear;font-size:15px;line-height:20px;color:#00aeef}.wrapper.__dark{color:#fff}.wrapper.__title{padding-top:0 !important}.container{position:relative;margin:0 auto}`;
        card.innerHTML = `<div class="version">1.2.1</div><div class="wrapper">
    <div class="container">
        <div class="car">
            <div class="car-cnt">
                <div class="car-body"></div>
                <div class="car-door"></div>
                <div class="car-hood"></div>
                <div class="car-trunk"></div>
                <div class="car-frontlight-left"></div>
                <div class="car-frontlight-right"></div>
                <div class="car-smoke"></div>
                <div class="car-key"></div>
                <div class="car-hbrake"></div>
            </div>
            <div class="car-security">
                <div class="car-security-1"></div>
                <div class="car-security-2"></div>
                <div class="car-security-3"></div>
                <div class="car-security-4"></div>
                <div class="car-security-5"></div>
            </div>
            <div class="car-shock"></div>
            <div class="car-tilt"></div>
        </div>

        <div class="controls">
            <div class="control control-left">
                <div class="control-icon"></div>
            </div>
            <div class="control control-center">
                <div class="control-icon"></div>
            </div>
            <div class="control control-right">
                <div class="control-icon"></div>
            </div>
        </div>

        <div class="toast">Double tap for action</div>
    </div>

    <div class="info">
        <div class="info-i info-balance">
            <ha-icon icon="mdi:sim"></ha-icon>
            <span class="info-i-cnt"></span>
        </div>
        <div class="info-i info-battery">
            <ha-icon icon="mdi:car-battery"></ha-icon>
            <span class="info-i-cnt"></span>
        </div>
        <div class="info-i info-inner">
            <ha-icon icon="mdi:car"></ha-icon>
            <span class="info-i-cnt"></span>
        </div>
        <div class="info-i info-engine">
            <ha-icon icon="mdi:engine"></ha-icon>
            <span class="info-i-cnt"></span>
        </div>
        <div class="info-i info-gps">
            <ha-icon icon="mdi:satellite-variant"></ha-icon>
            <span class="info-i-cnt"></span>
        </div>
        <div class="info-i info-fuel">
            <ha-icon icon="mdi:fuel"></ha-icon>
            <span class="info-i-cnt"></span>
        </div>
        <div class="info-i info-mileage">
            <ha-icon icon="mdi:counter"></ha-icon>
            <span class="info-i-cnt"></span>
        </div>
    </div>

    <ha-icon class="gsm-lvl icon-btn" icon="mdi:signal-cellular-outline"></ha-icon>
    <ha-icon class="handsfree icon-btn" icon="mdi:hand-back-right"></ha-icon>
    <ha-icon class="neutral icon-btn" icon="mdi:alpha-n-circle-outline"></ha-icon>
    <ha-icon class="moving-ban icon-btn" icon="mdi:car-off"></ha-icon>
</div>
`;
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
        this._info.gps.element = this.$wrapper.querySelector('.info-gps');
        this._info.fuel.element = this.$wrapper.querySelector('.info-fuel');
        this._info.mileage.element = this.$wrapper.querySelector('.info-mileage');
        this._gsm_lvl.element = this.$wrapper.querySelector('.gsm-lvl');
        this._handsfree.element = this.$wrapper.querySelector('.handsfree');
        this._neutral.element = this.$wrapper.querySelector('.neutral');
        this._moving_ban.element = this.$wrapper.querySelector('.moving-ban');
        this.$toast = this.$wrapper.querySelector('.toast');
        if (this._hass?.language === 'ru') {
            this.$toast.textContent = 'Нажмите дважды для выполнения';
        }
        this._setDarkMode();
        this._setHasTitle();
        this._setControls();
        this._setInfo();
        this._initHandlers();
        setTimeout(() => {
            this.$wrapper.style.opacity = '1';
        }, 10);
    }
    _update() {
        this._setAlarmState();
        this._setCarState();
        this._setInfoState();
    }
    _getState(entity_id) {
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
    _getStateObject(entity_id) {
        const entityName = this._config.entities?.[entity_id];
        if (!entityName || !this._hass) {
            return null;
        }
        return this._hass.states[entityName];
    }
    _getAttr(entity_id, name) {
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
        this.$wrapper.classList.toggle('__dark', !!this._config.dark);
    }
    _setHasTitle() {
        this.$wrapper.classList.toggle('__title', !!this._config.title);
    }
    _setAlarmState() {
        const entity = this._hass?.states[this._config.entities.security];
        const states = entity ? entity.attributes : {};
        for (const name in states) {
            if (states.hasOwnProperty(name) && name !== 'friendly_name' && name !== 'icon') {
                this.$container?.classList.toggle('__alarm_' + name, states[name]);
            }
        }
        this.$container?.classList.toggle('__alarm', this._getState('alarm'));
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
        const icons = {
            '__handsfree': this._getState('handsfree'),
            '__neutral': this._getState('neutral'),
            '__ban': this._getState('moving_ban'),
        };
        Object.keys(states).forEach((className) => {
            const state = states[className];
            if (className === '__offline') {
                this.$container?.classList.toggle(className, !state);
            }
            else if (state !== null) {
                this.$container?.classList.toggle(className, state);
            }
        });
        Object.keys(icons).forEach((className) => {
            const state = icons[className];
            if (state !== null) {
                this.$wrapper?.classList.toggle(className, state);
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
    _setInfoState() {
        for (const [key, data] of Object.entries(this._info)) {
            let visible = false;
            if (this._config.info.indexOf(key) > -1) {
                const state = this._getState(key);
                visible = state !== null;
                if (state !== null && state !== data.value && this._hass) {
                    this._info[key].value = state;
                    const stateObj = this._getStateObject(key);
                    if (key === 'gps') {
                        stateObj.attributes.unit_of_measurement = '';
                    }
                    const numState = Number(stateObj.state);
                    this._info[key].element.querySelector('.info-i-cnt').textContent = this._hass.formatEntityState(stateObj, isFinite(numState) ? String(Math.round(numState)) : stateObj.state);
                }
            }
            this._info[key].element.classList.toggle('__hidden', !visible);
        }
        const gsm_lvl = this._getState('gsm_lvl');
        if (gsm_lvl !== this._gsm_lvl.value) {
            this._gsm_lvl.value = gsm_lvl;
            this._gsm_lvl.element.icon = gsm_lvl ? this._getAttr('gsm_lvl', 'icon') : 'mdi:signal-off';
        }
    }
    _setControls() {
        this.$controlLeft.classList.add(`control-icon-${this._config.controls[0]}`);
        this.$controlCenter.classList.add(`control-icon-${this._config.controls[1]}`);
        this.$controlRight.classList.add(`control-icon-${this._config.controls[2]}`);
    }
    _setInfo() {
        const $cnt = this._info.balance.element.parentNode;
        for (const name of this._config.info) {
            const $item = this._info[name]?.element;
            if ($item) {
                $cnt.appendChild($item);
            }
        }
    }
    _initHandlers() {
        for (const [key, data] of Object.entries(this._info)) {
            data.element.addEventListener('click', () => this._moreInfo(key));
        }
        this._gsm_lvl.element.addEventListener('click', () => this._moreInfo('gsm_lvl'));
        this._handsfree.element.addEventListener('click', () => this._moreInfo('handsfree'));
        this._neutral.element.addEventListener('click', () => this._moreInfo('neutral'));
        this._moving_ban.element.addEventListener('click', () => this._moreInfo('moving_ban'));
        this.$car.addEventListener('click', () => this._moreInfo('engine'));
        this.$security.addEventListener('click', () => this._moreInfo('security'));
        this.$controlLeft.addEventListener('click', () => this._onClick('left', this.$controlLeft));
        this.$controlCenter.addEventListener('click', () => this._onClick('center', this.$controlCenter));
        this.$controlRight.addEventListener('click', () => this._onClick('right', this.$controlRight));
    }
    _onClick(position, $element) {
        this._fireEvent('haptic', 'light');
        const _showToast = () => {
            this.$toast.style.opacity = '1';
            setTimeout(() => {
                this.$toast.style.opacity = '0';
            }, 2000);
        };
        const _stopTimeout = () => {
            clearTimeout(this._clickTimeouts[position]);
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
            let entity;
            let event;
            let action;
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
                    if (this._config.entities[entity].startsWith('button')) {
                        event = 'button';
                        action = 'press';
                    }
                    else {
                        event = 'switch';
                        action = 'turn_on';
                    }
                    break;
            }
            if (entity) {
                this._startBtnProgress($element, entity === 'horn' ? 5000 : 30000);
                this._hass.callService(event, action, {
                    entity_id: this._config.entities[entity]
                });
            }
        };
        if (this._clickTimeouts[position]) {
            _stopTimeout();
            _run();
        }
        else {
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
    _updateEntitiesConfig() {
        if (!this._hass) {
            return;
        }
        if (this._config.entities?.alarm) {
            return;
        }
        if (!this._config.entity_id && !this._config.device_id) {
            return;
        }
        const entitiesToAdd = { ...STARLINE_ENTITIES };
        this._config.entities = {};
        const deviceId = this._config.device_id || this._hass.entities[this._config.entity_id].device_id;
        const deviceEntities = Object.values(this._hass.entities).filter(({ device_id }) => device_id === deviceId);
        for (const entity of deviceEntities) {
            for (const [key, data] of Object.entries(entitiesToAdd)) {
                if (data.regex.test(entity.entity_id)) {
                    this._config.entities[key] = entity.entity_id;
                    delete entitiesToAdd[key];
                }
            }
        }
    }
    setConfig(config) {
        this._config.entity_id = config.entity_id;
        this._config.device_id = config.device_id;
        this._config.dark = !!config.dark;
        this._config.title = config.title;
        if (!config.entity_id && !config.device_id && !config.entities) {
            throw new Error(`You need to define entity_id, device_id or entities`);
        }
        if (config.entities && !config.entity_id && !config.device_id) {
            for (const [key, data] of Object.entries(STARLINE_ENTITIES)) {
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
    description: "Amazing card for Starline integration",
    documentationURL: "https://github.com/Anonym-tsk/lovelace-starline-card",
});
