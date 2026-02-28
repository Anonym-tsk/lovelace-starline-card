/**
 * lovelace-starline-card v1.2.8
 * Sat, 28 Feb 2026 22:47:50 GMT
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
        style.textContent = `@keyframes smoke{0%{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAeUExURUdwTC2v5i2v5i2v5i2v5i2v5i2v5uZQDy2v5i2v5lq7PSEAAAAJdFJOUwDB4h14W40iOrPiTp8AAABWSURBVDjLY2AYBYMeFFAmOApGwSgYBVgBs1sDppjkzClO09AEGWeCQAI2wcmogqxgwUkGqKKaYFEBbIIKKGIcYLGZAegWTfSc6IxhkQAzhuuD1IjxNwAp6h37/cMGjwAAAABJRU5ErkJggg==")}33%{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAhUExURUdwTC2v5i2v5i2v5i2v5i2v5i2v5i2v5i2v5i2v5i2v5lAMLPIAAAAKdFJOUwCSz3AsE7X3Susoapj9AAAA7ElEQVQ4y2NgGAWjYBQMVRCAKcSRvjwFXYwla9Wq5QZwLqsLSJ/5KiBYDFMhVLWqyIAhbBUYNECUZYHYiwxnQQQTwIJsq1CAAliwC1VQACwohSK2KACL4BQGLIIQyxmskMWWQZ3phSwIczsbNkEWbNoZqpAEl8MCTwuL7ahuEsBmvQJUkBGbICtQ/7RMqCA85FkELRhYIdYtRI0hT7AzG9CiTWvVSgmMKIbEHpUAi6EDhhgw3ouNCtEEmVACAkWwFFWQGSy4Es3cWUhpCA4gQTEBNf1CIgc1KIBRvMh8kSmGRQmsGGHRNJEYfwMAJTLH/q1T3yIAAAAASUVORK5CYII=")}66%{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAqUExURUdwTC2v5i2v5i2v5i2v5i2v5i2v5i2v5i2v5i2v5i2v5i2v5i2v5i2v5rFv20IAAAANdFJOUwCwJl2VPvh6yBMF1+5CwXDAAAABwElEQVQ4y7WUsUsDMRTGY+uB1y7i4FBaKJ0t1FUtFLoIUiiCDoKDRRCHgsgpiAgFJ4fCuXTQpSKCOim4FlREB7mhKteDI/+LuUuTvpcEcdBv/JHcy/fe946Qn3W1+Ppe7WJm9SjTG6KpVRrrBMKEx2EAj47RoSoArgvYADAn4ADUFowGI3gtoT+qVJOQ5gU7pQpMFVZmmwq02hQrgmWF0Tqz11RhBdiTeiSko8EP4Fnq01CHfplg3wQ3CCmarqdNhZIa3IYtF9ph8EJhfBxHEPkPvMfwq/010XZwtCTn04FP1MIRNUgoCVspA+cJ2AKRkUOfNIULJm5CfxFLu7DjEj2HA7QE5xxmELTj6BwrO3SZ9e93yf/oTEfWtD+lsgR7mD9yahcigwvQlbXUpMGc2JA6PxY7Dx0PNloJ+B1uMWx0DbHQNcBnYoDDd5aVwMdTL+pBBLNEhgzXCYErK38WbUN1nO+KqbwI3rgJ3jJPT1mwRfxRzl7X7vHU47/qTLzBdW1sYdVVh3mz7P5dgBJOXmc5unW4qcA0dgI738CQ72uIvzvc1xY+2lPXWg7OLyHIUhfshwdaoYyt9WL+pfsL39+2e61vYK83bQAAAABJRU5ErkJggg==")}100%{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAeUExURUdwTC2v5i2v5i2v5i2v5i2v5i2v5uZQDy2v5i2v5lq7PSEAAAAJdFJOUwDB4h14W40iOrPiTp8AAABWSURBVDjLY2AYBYMeFFAmOApGwSgYBVgBs1sDppjkzClO09AEGWeCQAI2wcmogqxgwUkGqKKaYFEBbIIKKGIcYLGZAegWTfSc6IxhkQAzhuuD1IjxNwAp6h37/cMGjwAAAABJRU5ErkJggg==")}}@keyframes smoke_dark{0%{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAkUExURUdwTP///////////////////////////////////////////xR6XWcAAAALdFJOUwAd07l4943qWwk5bvGMVQAAAFlJREFUOMtjYBgFo2AUjIJRMCIBo9sCTDHr3SFOYWiCTLtBIAGbYCCqIAdYcLsAqmg1WNQAVVAbLFiAIsYFFtvagCLIvHv3ZtdNjhgWWTJOQHd9U9kEIvwNAGj0I/KGs5sCAAAAAElFTkSuQmCC")}33%{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAqUExURUdwTP///////////////////////////////////////////////////4sGkswAAAANdFJOUwAsE8L3dpjUSLHriWMgDdSXAAAA8ElEQVQ4y2NgGAWjYBQMVaCAKcQx5cpEdDFG27t3rxyAc5kEQfqO3AWCqzAV6b53Lx9g0LwLBg0QZXNB7OvRayGCBmBBzrsooAAs2IsqmAAW3Isidh3i1FwUwYUMWFRCLGc4iyx2GepMWWRBmNuZsQkyIgvehPncF0nwCizwbLHYjuqmBGzWG0AF2bAJgjy6eBZUMAAeD9siGJhqwWLXUGNICuzMBoxou5WDEcWQ2KMSYAwTwBADxrtruBuaIDvY1RuwCTqhCvKABW+hmbsWNXggABIUC1DTLyRyUIMCmOouh1wPwrBoAhNGWLSvJsbfABQNBIl2bn8nAAAAAElFTkSuQmCC")}66%{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAzUExURUdwTP///////////////////////////////////////////////////////////////8/RimEAAAAQdFJOUwD4I60FEjRhS3jXye6Mm7touDybAAABqklEQVRIx9VWSXLEIAy02Hf4/2vD2DOxjQVSVXJIdO4SWrpbbNsPQrkSE6RQrFrBTGifSH6OdNAuEfUEJlK7RZxklG2IjBc3whoIVrrWPCtdrxCZXERw8OykNCzGArVEYc18PyeEcVZCW+JcbOs43rWNij2fARKXJ4MdI716pNPtBToGrFlOF0eBLJxkvttxgoMrveHA64NTIGjeoA9CK8mC9fCLJ0O+sHRWo3QD5fO0zYHxMJkaQ7anLK7mg7PuoVuVOPJGlSuZ/oP71BbpqaCdwMxIJe1mx6xvTJRzA9dnidEu74atqTNEerH9i9CKAXLdXkEaAiXqeyvIgLQQn13ZNNmLKQGOAavR9x1+EILPd87WE1dXMg8rcaB8zct0mrhqb9WJjZXv0u3KAuuVdoLhacRcPHntUbFPj9dw8yOr39Vk7iY47zhyPhpPnDqAqcpE2IfJxRs12keZS+n82EFdysjsUwrFaUqTwhj9t6xE+GwYqJd+wfsAeYkL5NV40ApWnnsVUlgAb1cw8gpE7yliMODmuMPWoofuaprqo6pNU9t3IWX1G3v9AiQ0YpqsujbEAAAAAElFTkSuQmCC")}100%{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAkUExURUdwTP///////////////////////////////////////////xR6XWcAAAALdFJOUwAd07l4943qWwk5bvGMVQAAAFlJREFUOMtjYBgFo2AUjIJRMCIBo9sCTDHr3SFOYWiCTLtBIAGbYCCqIAdYcLsAqmg1WNQAVVAbLFiAIsYFFtvagCLIvHv3ZtdNjhgWWTJOQHd9U9kEIvwNAGj0I/KGs5sCAAAAAElFTkSuQmCC")}}@keyframes smoke_alert{0%{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAbUExURUdwTOZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD+sLbksAAAAIdFJOUwDB4h14jVs6xlRyqQAAAFBJREFUOMtjYBgFo2AUjIJRMDKBSTimmGFHh4tGAJqgRAcQtGIT7DBAFcwACyqjCjKBBRuxCTahClaABdswLBLpEMGwqJHBAN3xbEoBRHgbADX/GYf9Vgw7AAAAAElFTkSuQmCC")}33%{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAhUExURUdwTOZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD6fv4bUAAAAKdFJOUwDoSWvHjBsNMq5mCBCOAAAA80lEQVQ4y2NgGAWjYBQMVVCOKcQeuEoYQ9Bw1apVbghuRgKQyASKrVqYANVlKbVqYRgDkxRIcJUDRFARzAn2AlOrFoHFmFahgMVgQRZUwWVgwSpUQQOwYBaK2FIGLCqhljOiCCpABDlRBKG+QXHSQpgfZyGLNkAFrZAFA6CCWlhsR3XTMgYs1i+CCnJgE2RoXLVqyRSooDg8bkyDE6BuWNiAEkGsYLFwtGgLXLXKuQEjgjsSqJeA2FUNGLCkliWWS9DshQSyGDbBpWjapVBCFyXkF6EKaiGlITiAJDd3FDFQGIcsnITmdimgeRhhUSnSQIS/AZjXy8m2/dYiAAAAAElFTkSuQmCC")}66%{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAqUExURUdwTOZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD5c187AAAAANdFJOUwDqjTRPr24S9h7EB9hTCxMpAAABxElEQVQ4y7XVzytEURQH8MvMmMa1k5SaojShmXqysVHMVlMWVmoKNSGpsZAfZUFKRL2SFUoWLKYpGxulrGTzFm/M8ML5X7wfc+87595HFpzlp5l37zvne2YY+7lSpeedK5Maz4FbDYPgPfi1RzAXIIwjizUNDhAmBNYQjgl0yiEWBaKHxqVBr8TREKfkB9Mqbo7kLaDI+4CWh1sQgUUV39DryXplrFXDBmPtGtqMtWgI32BHFCaiMB51ELdUrNGmBdXtTSxN7dObPD8n1jXptzNZRYcsibavhngj5xP2xDH1cHgNkmWhVspaEVhHeCHwBeGdwA+EsimPOLBVLUZhDu0yxrYAO+lqLHq2q+xLKgs9/bfsX2pdp2QWnrTTJkjv+Yl3xVN/mM3LJktpsAfFhlyG3wLIVHFPY1q6mZblYLUfKM7SCeF13yZYCZCm3lB+KPzg6PsfIt1OQ00NnnIBo8jDhrLY+vEieLHjCGTDbm9n0BYFXZ7PmM072PT3018He0EZ2wA414Y6Sz5y9ncB4vllHefgvXSknBs0eT8Ka8ojLX2HROfrFAvaWsslrBBzU+cM2dNK0i33/8ZUL792aPzivb8APn6rZW10QV8AAAAASUVORK5CYII=")}100%{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAbUExURUdwTOZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD+sLbksAAAAIdFJOUwDB4h14jVs6xlRyqQAAAFBJREFUOMtjYBgFo2AUjIJRMDKBSTimmGFHh4tGAJqgRAcQtGIT7DBAFcwACyqjCjKBBRuxCTahClaABdswLBLpEMGwqJHBAN3xbEoBRHgbADX/GYf9Vgw7AAAAAElFTkSuQmCC")}}@keyframes smoke_alert_dark{0%{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAA8UExURUdwTPYSEswLC+sQEO4QEM0LC9cMDM0LC/oSEskLC+EODt0ODsYKCvsSEvwTE/kSEtcMDO4REeEPD+gQEPeDDPEAAAAQdFJOUwD+/sgfvlJ1dg7oieKRMtpddgghAAAAY0lEQVRIx+3Ruw6AIAyFYZD7TVHf/10VHOpidZDtfEm3P2kDQgAAAAAAwDDal/lDpeTJ+0UWtuvZJbHdSjTT2Z1ELowbUdziSiKz95ZV+9yZqTGuDXee61kQIbw8tM05/fGtB0BcBQJE0RN7AAAAAElFTkSuQmCC")}33%{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAABXUExURUdwTOEODukPD9sNDegPD+wQEN8ODuoQEOAODtQMDNQMDNcMDOMODvcSEssKCvAQEN4ODvsTE/YSEvEREcoKCvkSEukQEOYPD+IPD94NDc8LC+4REesQENQyfzEAAAASdFJOUwA2G0wNwWZ3BK6L0vXr65fm3CwC26kAAAEdSURBVEjH7ZTJcoMwDECRjbxglkBw09D8/3e2hgBWWxkOmZz8DszYvJHkRS6KTCaTyWQy/1KWZyTde99rc6Cpxs+g+PPLCFgnBfqVnoilwjlA04Vp2fgdjDTZDH6Y8UOncR0sM7AlhIHg6Uht4XBIsRVYXlPs4URK66LFJjSMN7r5YpHx7lnOutbkJOSDg3oFfnAA8TTraZr4xvBw9LLVnHij98p+cpCNKaA+5xVwuQecdXfC5VePmFJ1lQrFKKIB2xmm2i2d6jhT1T9OjRqOetIACHOux817nhIjK30ilWqnaUJlJ5dco5wCY/i04tBbxCpVnRt3UqKKvFEmVht7io+HkWb5s4dnZXZsrUy9xe1SlxFHj7ZtHbziXL8BziQzXTjC+WgAAAAASUVORK5CYII=")}66%{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAABCUExURUdwTOAODuIODuoQENoNDeEODtkNDdIMDOUPD94ODvEREdQMDOkPD/UREfEREdILC9kNDfUSEvoSEuwQEOYPD8gKCkLHviQAAAAOdFJOUwBPFq5uNsXrJArsjtiLQ9tHigAAAddJREFUSMfVldl2hSAMRS+EGayI8v+/WsURZFqrfWgPPOE2JGbw8/mJBAGjnIJB1Cg5uEtAyxxzT6ESNjjXA1KXCmc5eHFDnznnZJe5rIcog2UuFmo9nsLad1jwsqbC+9PNbNvdHBaUosGsT3a56TAVNpx5UuejrA5OmqmhnYOpqS0jtI1NZEt7GwsOsg57auXUV4dkJ7fWv+nkoIdbPwzqwFRIR5sLhUVbkcxq7xCq5qrM2e3ClCEF6G4PyQoQSQYHzl39xd6dO+TMZaaQeEHLDLn+zoRCchxZUs3ZASRe3JIfffDiZJZDKWZKYzThhgJHY0zh0sB9hmxVZYBvoN2NaVz9b2izLJxpJD//QbLHTayNtYa0MMStXay1mZqWWJyHmAVoQ00ESgJ8O+daHMYuseSWU5owG+nOILU13bGwKnc5KDvNiRqmH8FWMPbMCS9zUbnCWBKPkzTawuJJrxUNxm1CipxOLi6JxaVS5Ma4rsoRx1NL8D5O0gB6Bmz042PztEck0ZrgPfYHVhkf+qZIteM0Dy4Q2mxcQcUfGyVIkw6McO/XAMGbaozIX+K4j/O6ZpB3guTBedR3sa8Ezh4YK+eeHp4xzwHVvjI//GplHwNn9Dfy+g1zo2dHo5DIPQAAAABJRU5ErkJggg==")}100%{background-image:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAA8UExURUdwTPYSEswLC+sQEO4QEM0LC9cMDM0LC/oSEskLC+EODt0ODsYKCvsSEvwTE/kSEtcMDO4REeEPD+gQEPeDDPEAAAAQdFJOUwD+/sgfvlJ1dg7oieKRMtpddgghAAAAY0lEQVRIx+3Ruw6AIAyFYZD7TVHf/10VHOpidZDtfEm3P2kDQgAAAAAAwDDal/lDpeTJ+0UWtuvZJbHdSjTT2Z1ELowbUdziSiKz95ZV+9yZqTGuDXee61kQIbw8tM05/fGtB0BcBQJE0RN7AAAAAElFTkSuQmCC")}}@keyframes blink{0%{opacity:1}50%{opacity:0}100%{opacity:1}}.car{width:332px;height:197px;position:absolute;top:0;left:-100px;right:-100px;margin:0 auto -60px auto;transform:scale(0.6);transform-origin:top center}.car *{position:absolute}.car-cnt{top:67px;left:24px;cursor:pointer}.car-door{display:none;top:28px;left:15px;width:63px;height:91px;background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD8AAABbBAMAAAA2FECgAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAqUExURUdwTDCu5DCu5DCu5DCu5DCu5DCu5DCu5DCu5DCu5DCu5DCu5OZQDzCu5F7at9EAAAANdFJOUwDJJBE9bliOrPDgBwbMgkxcAAACLUlEQVRIx62WPUsDQRCG15io8RCMlSBCiJWFIKbQRlBJoyDYCIIE0hiwCKSzEEHBNiAqFsKBtRA4EBE7f4KJJmci739xczG53b25HQtfOPJxz93OvDP7IcSfNHZysi9VLhcKhVyWAF6hqHMaBYoqgG4pAtQ1AA1zlCSw5+RXcjKC8tGBC/ieDowDv8848lqVxIwZ45f6c00GGobxJq8K2toDO+YgNXxowFNNH8RxMa2P+Sxz3VB8lEkYeR0Dd1QSYeIykzDOSXQj1m1DCXxJzzJQoq68omhkGWgR+AyzbEaBhIvLwXcXD0QL7A6dSADnBJAcepmK2qBrAtiwApPAshVYJ3zSwyV8MjrWtwM1tOzAfOgpKQeU06rpwLd9XgI3+Z5yAxW2+p8Lee+3nyyaDpy2SBZhxHa/Z0DaBpwHpYhXdzlo2Xjd9muFljfay3IzAgSNVAGqfUdGXeN+UGWvGHbcvAHMBf+eDd9gAp3sAGgPu1dTe9AOwP1jJpO5MEeohgCphscA1zGh6yZYgIZggCYHVDkgywC+YICmMrHiutUOlDggXDLO7DbFAX7chmb0QjygTPgKCXyoSxSlK6Gs9ZQe1FWQAaYYp3sLrR2Y4IAXDkhxwBgHJDnA4QDz+BExim4ppRZ0x7wLpt7qgWKJaRh6qVX3mBGmJ+n9oCUYr1v6nmSdF7SVvmCs9OMPi9EYSKe0rTTNlJtsW+3IkWJiJIzoGKfai4yu2UPxj/oBYSPtA28ma8kAAAAASUVORK5CYII=") no-repeat center}.__dark .car-door{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD8AAABbCAMAAADz5K2hAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAzUExURUdwTP///////////////////////////////////////////////////////////////8/RimEAAAAQdFJOUwAizBFlvzDxQ6qRVnriB9Px52U1AAACE0lEQVRYw7VY2YKDIAwEuQ+t//+1i9C1LeVKsjuPLaNkJiFBxv4OwXsfL8iEkGCt1Vpzzpfohzl7MP6Y8+U5wB6m/Mc5hNJjur0WxRSGECKFnAJP4ScRZHTPwOIwCH8taSslYnnCxifqqd6/whUd+yqE6385CG/PT+gakV8gBvE9t9CJYbz9siQWJ/VI/XGCZhmN7amvZyliiw8NmS519nmO6s4D+PWrWygSXWwIrdyXK1XGywNsw721Ms0huIpv1sJ/WqXqN+nV8Mvqo1n6EX9yuYYkEOyz5B9DnAD5esnv8PxcWJ4on8TzHzT5j3M9e5v5lPkHmp+PTiNe4DV0aYNvSKuOD/lxeNzy45BF39D0eBc/Cu6V/Rjs4s0+OIx+q56Uv8mP2z27oIn8mDuq8hFmLfjb/rp81Mz5Kn08bJox/LP11S1FTl4fquq/7Eh4bAlKqZl8nn3zAdgOgFLD4FF8yUh8xWh8DXJ6qD2m/Dkj7f+rzyja64F81e5eSO/hfNEePfHbh/F9p/uvIgDvXZPcvdsnXr7f83ut8lsTMaTl9KY3SL+uQeXvpPQBFZDq3lwJ/EjkByIfMEBs/fkT7x/AwL0/f6PzH2QgIxrQvCRxwukPnEDbtwxFOf9AAkqigO1LLqec/6AM9IyWgR7x7W6u33oJ9z7xGEL9AwSwqI+XE/dXM8CMruhuG0M5ib8h/x9+APekt4F6xMFtAAAAAElFTkSuQmCC") no-repeat center}.__alarm_door .car-door{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD8AAABbBAMAAAA2FECgAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAnUExURUdwTOZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQDzCu5OZQD6lBy2MAAAAMdFJOUwAkyxFxPZRZs/DhD4VTpnwAAAIiSURBVEjHrZY9SwNBEIYn5tNgkSAKgoVGEAuLSGwEixQpLFJEIYViIShWFgGFIFioIFikUEQEucJaLPwJuXxcNMyPcpPzcrN7uzsWvk047snuzrvvzh7An5Q+PalUKhfNZr1ez+c0wBYSfR9HgSoFcNiIAOsSgB11liRiGUobebGC5sWOg+gpQAqR/GdTEMsyMI1f9HFeLFRexhUOpOcDdZIWdqXneEuZxMFrec6EqLVGfBwVIesS8cVUhF+4qCRcZxaHEev2kSx8MWIMQOyDDFFVqhxrAbEfVulGgZiDd2GVb5oIHN5MWFRt8AuhrpSteRM21KxAFrFoBbY1PsnLldOgS6xnB850RsqR7tsB1DlNTUds288l4lNppHyguV3/d7Y0ev+ZQpuWADJWQGzClO19b3ysLLoeb4VZw+I4smY9+3slZoqPqtyLAA3/5OLR75F0lPde0H7Kk3jLWvndzGAEtRN95wJgMDFd0iCIA+Lre6Gwdq8MEAzcMtXYAQZ41K8sVJkBOsAALgcccUCOATxgAJe0WWOWrECDA4rk7FptMgGe6UJTsmAGXHrd6NSlLUqnByC9Xqc32gUZYMbUF0ijtQMZDkhxQIID0hyQ5IA4B8AHY5Q+Ug/AJKYNzH7TD4pFJjD6VkvvmCkmk/rN6AHjdU++k6znQm+lB4yVnvljMVqF1ikXGKfodmtjWwO7ET31clakfE7CbUHW6jn8o34AKmyKqGm9wUIAAAAASUVORK5CYII=") no-repeat center}.__dark .__alarm_door .car-door{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD8AAABbCAMAAADz5K2hAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAABCUExURUdwTO0QEOsQEO8QEMkKCu0QEOUPD+UPD+kPD/QREfUREc4LC+AODtkNDdMMDOsQEM4LC+cPD8oKCscKCvsSEvUREbZFJG4AAAAMdFJOUwAmbEzLEZO10PHl408tclgAAAI2SURBVFjDtZjZgoMgDEVZhIDa2kX+/1dHxGldAgSYuT6pHC4Jm8jY30nqRWKTDOJeioQrO8dkNaEKMSfUyyxv5qQMz0TvCwkfh1Jr1DxkQAjYAtNJXvsiuIcSNt8EXwRiL7kOeZT55sfe9+kYYJ7dnOolBckYks3fd3DPa5ofCtloErRbxLMj3C6lZof49MuLPj9Gua/AXRvK/WNNmCTcGzl3DkH4h4JVVwCk8L8hwIm3tPBDEh1wLHygrjPXdtLDj8w9LKcFWnOqqnHlJjf1DQtvUfqQibX4k0ZfIn1TQ/rNtKgh/ZPPH6/GubefGtLncau+4ln5Ut/0TdUy6+StxsNSaKr50Oe2Fg9DVk3PyuBDCvmzUtuIkeFu27pD70mTx38HvFjv9PljJod/AHGo7bMiZ3DzGT8a82fpAEb7nS6Bfx7nn8jY70ov/Ogva3qzCgBMeBS99q2F8aznmJE5ZGqr9FBB6toHj/rndOwrU4qfVupi/9NKV+p/GSmF/Hmfgzb7Uv6yzsOtRNdtEm5jwSVYm//1K0GX4B1r45FdXpTwso2/I7u0bEtfAX+/3bHt/07XgH290fEbxrMC/w7jB7o/ykOjv27kRSMvH1ThPG/kVSPPBnIFA372buQ1mX+wtg54qLYOeOBf+S8q/sZPGd2LKpzXVPyNn5Ik2R/nOdk/csobqBVEeCDax/zFm6jIKZNT+dgpcaDhXfT3F42PHnJpCYif0SkJGFJHdOgy0qL+B8f/6QdFHa6bZU1n8QAAAABJRU5ErkJggg==") no-repeat center}.__door .car-door{display:block}.car-body{top:19px;left:63px;background:url("data:image/png;base64,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") no-repeat center;width:158px;height:113px;background:url("data:image/png;base64,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") no-repeat center}.__dark .car-body{background:url("data:image/png;base64,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") no-repeat center}.car-hood{left:90px;top:53px;width:103px;height:23px;background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGcAAAAXBAMAAADkTUwLAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAkUExURUdwTDCu5DCu5DCu5DCu5DCu5DCu5DCu5DCu5DCu5DCu5DCu5Jy+NJ0AAAALdFJOUwC7THcbZuEzpYl5KUhW6QAAALpJREFUOMtjYKAUuLiUFykpqYaGGgOB5WIgYRoaGqSkVF7u4oCq0r1INXhmh6BgWvZuvCAtTVCic3KoUrkLAwPzblLBDqBN2aRq2g7UNJtUTQJATd6kalIAauIgUc82UOixk6hpFzjMSQyJLWBN0aSHA8khoQDWxEF6ODAwMJGkaSc09WWTHg4MDNakhwOJIaEA1cRBejiQFhI74fkwm/RwYGDQJl7TBLgmLqL1bEQqJyobBYkCEpCwAwCrB6h2UWjxSAAAAABJRU5ErkJggg==") no-repeat center}.__dark .car-hood{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGcAAAAXBAMAAADkTUwLAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAwUExURUdwTP///////////////////////////////////////////////////////////0Q+7AIAAAAPdFJOUwC7eExmNKqO3yMO8hrQy6g1e8wAAAC6SURBVDjLY2CgFKyZGRpsbGzi4qIEAyouLs7GxqGRc1ahKOSaGWziVF4m+K5j93984PeO3odi6UUuxqGzGBhY/pMKvgFt2k+qpq9A99WTqkkAqOk8qZoMgJrYSNTzAxR8rCRq+gQO9PukafoD1qRPmqYEsKbVpIcDqSHxA5KQmMkIBwaGflI0/YRq0ic1PTCQmiYMoJrYSA8H0kLiOzwj9pMeDgwM9sRrKoBrYiIl18JBeKIgUSAdEnYASy2ch9Yf0qMAAAAASUVORK5CYII=") no-repeat center}.__alarm_hood .car-hood{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGcAAAAXBAMAAADkTUwLAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAkUExURUdwTOVSJeVSJeVSJeVSJeVSJeVSJeVSJeVSJeVSJeVSJeVSJYkw94sAAAALdFJOUwBE7tilvhdwMIZTFjmJJAAAALhJREFUOMtjYCAbsGU0Si0vnznFxTU02NhYCQi0dwPBJiBD2Tg4NNTFZeb08lWCHWlQ9VwuocZKu4kGyqYh7gwMHLtJBduBVkWTqkkBqGk1qZomADUxk6opAaiJnUQ9W8DBrU2apo3gQPcmTZMBWJM06eFAckgkgDWRFhJboQmPJE27oMnPm9T0QHJITIBqYiY9HEgLia3wLEhGOJAUEgZwTclE69nUgCgiiLYqArlgaRQkCrRBlAMA5eewzXqba1EAAAAASUVORK5CYII=") no-repeat center}.__dark .__alarm_hood .car-hood{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGcAAAAXCAMAAAAhvaEKAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAABCUExURUdwTMoKCvQREfwTE/wSEvIREd8ODvYSEuYPD/IREdYMDPkSEskKCvMREesQENsNDdUMDM8LC+8REeYPD+MPD98ODlrtpyIAAAALdFJOUwBEsu7TdRaXL1PaPPPUeAAAAL1JREFUSMe9lu0agyAIRoMiwdpHbbv/W53abNr66bvzs0c5WQh03f8ZR1UiMwm4AEeGRJ+ZdvKTbUFay2FT3GxGpKpjFd1cClaGaEefXsFJ8OiEJ3o6hmv67cNd0Mj2hwawZv0khKxYOOfzFQvl1HZIy+r3K0QPJPK9q/4JpCgL8sLBZWW74bCyyDFM46tiSncUUvcEj/Jo7ZEFwszHHofxLHZspm5G4H+btkd49GQ64Pan0fNBJEwhDanmkDeoYmx8ZcFzQQAAAABJRU5ErkJggg==") no-repeat center}.__hood .car-hood{animation:blink 1.2s linear infinite}.car-trunk{display:none;width:128px;height:32px;left:78px;top:0;background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAAAgBAMAAAAoDG0WAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAqUExURUdwTDCu5DCu5DCu5DCu5DCu5DCu5DCu5DCu5DCu5DCu5DCu5DCu5DCu5GzHYOYAAAANdFJOUwAgMxB38d5hnYpMybNmql4BAAABqklEQVRIx2NgoA1gFtRaXuIyc2ZHT0fHzCku7lVKwsRrFu/ZnXoXE1wN23NkATH6Je7iBteIMIE5F48Bd6/g1yy0ZMbp1Lt4QdiOKVXKWDVLVXbn3iUShJ3wQjVEqIR4zTAQfRJhCHPsXbLATbgL5pJnQDBUOyODKXkGODBCDOAWYCFL/1UDDkiykJ1AXiBcYRBtABvgG0xeIAC1QUIh9yaDLDkGAB1+HaSfCegZHnIMAAbdHZABnMDg5CJD/x1Q5BkADWAD+SaXdAOuM/jevVsANEAXxJ5LThgCbd0ANKAXmM1BppAKDrADiYtAA0BpYAEbIpO0VCkKGxsbCoKAEhiAmUAxQaUlcxB+LeCGlA/g8DvAARWNKCRU3qzcC1VqAHL1bQYGsNbL7JDE2URMeVsNVnsbEm4CDGDHX2cGl3jFxJW6GpC8DPZNAcSAGyDetQJiy20ZoJZbjJCQYAA7/hooLpqJL/mXwXx9DZiShEABzVB79zoJ9Q7j3rsJjCB9CnAh3bsLSKm5bO4eQBNhvUVa1bfXAU2EewJplacouoNZDEgzgEWAWvU4ACK3iBciSo/xAAAAAElFTkSuQmCC") no-repeat center}.__dark .car-trunk{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAAAgCAMAAADt/IAXAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAzUExURUdwTP///////////////////////////////////////////////////////////////8/RimEAAAAQdFJOUwA0IxB3YtuKGk3E9a2a6gfmanGzAAABoklEQVRYw9VX7ZKDIAyUQIDwJe//tBdRa1rvrp1WmLv94SA6k7CbhGSa/hW0B0WEaIxxjJxzSvzgJe8gEikFer7ersecgrWlvoZYbAjJ0FWe+FTfQ6FraLf1bZhPzq3IuIX5WD8Ai5GcQQL9qt0ZCB2brVcj2pQNKf3LidHkDobPnDAlpE4B6mMdCndiwA21Hx+kAA72MtIBTg8vVQh+msxA+4UJyKJKwCLJSAoWAmI6HDBNEzc0AlyNhwa2RaUfmQKasw53+2pTJY1yANaIS3cZaFZHRiBsAXfLxVb+yrwt+gP3lMNDgZUCNyoE57JTsSCv+3YepAFLj9vSt/tvz3/6VoMYMl+nCkA3wAElcOz69pvnz3ydJ/u9Alb2CyQ8yw8FKyF82s4oFx4c8AfTQSjQvqA8elaXtZTSBytjDSZJO4paZFFf2daqHEUVkiblW7q9FLy8s4ZwCzW4iwdBu931yLrHUEHlJLTVazO2Y/UmYqexxi8kFGnwPDlwfEbqNljNQVwAP/wSaz/7zYNno0JwXYdLeDotGd3Vgcn4vzZwfwE0rINYJGtingAAAABJRU5ErkJggg==") no-repeat center}.__alarm_trunk .car-trunk{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAAAgBAMAAAAoDG0WAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAnUExURUdwTOZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD5tcHFQAAAAMdFJOUwC+larcQVoQdiDyLlYakCEAAAGgSURBVEjHY2DAA8orZwLB9AIGEkFpWIaSsaDLqjMwcGqJo6CRRlvqBqK0c6ucwQnEiDGg5wwe4ElIN/vWJHz6zxxpi8YdIlMzlEXWnCEMHI3atmPRbOhzhgSwBMUQTkWSNMMNMYObIHOGLHAUbkAMeQYIQLVzMDCSZ0AA2wSwAVwJ3GTpP8jA0gA2IMeBvEA4yhDjADbA5ihDDnlBIHManPjWAN1CjgEJrGdOgAxgA4YGBxn6TwHD/gjIAGAUCLCTYcAhhj1Aq4EG1Jw5c5rBhnQDwJoUINn3MDmh6ACK/AXQdDyhCjm3GSuBgTECGIEFlA29kJQpMEFSMyeYA0+Lzq0T8JUX1UlS8HRYBQ4IBnAEOECj4WAm4RIryAcaCTlgEpIPjrKCBT2IKn9ZwSF+GJJ8AyBp6BADqChyI7LU5tQBKj7BDi69EiAuOAgybgXR5T43UPVpiKMDgMWRoKCgMDAyj2wgvuYABtkCNqA+QTOkMkWclLonB16awEDNQZIqMFZwGkQGLO6kVX89CWgCzAGkGcCIHmLcJFbAnAzUAgDOvDO/UYJkxwAAAABJRU5ErkJggg==") no-repeat center}.__dark .__alarm_trunk .car-trunk{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAAAgCAMAAADt/IAXAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAA8UExURUdwTN4ODt4NDdELC+YPD+QPD+AODuIODvEREdYMDPgSEtIMDPcSEvAREeoQEN4ODuIPD9kNDdELC+UPD10/cMgAAAAMdFJOUwCVq7xuTDIWxd/j9q4qdSAAAAGcSURBVFjD1ZfRkoMgDEUFkgAi1tb//9cNLCKtts5aYWZPH0RE7iWJFrvuf6AJEUAIKY3pmWEH7jbGSCEAAJEuVCexK3iEgYv0YThLry+IPIjhPD0g0QkXFPItTT9cRM+VwVaOnWgWLnV9/J0l3VtM4T8Y0cL0Po71Ffm14Tki2wI1vim4MYB+bKhvXp+0EIKxIfyawrIURo4ItZP3Miy4KAMcTdsQ4KKZkPMcuuZGTHG585z/LvQ0xT47NSKslg8il2DopHSsz+xYU/HR5gzcGMWRuLWBV06xkXKQdCk5qU9WSjmAe4QfDby3gCNPuRVQ6YLutHtzi5K80VmR+zwPUfbNbLxukZrxhayLC2ojLQG/2FUQCrWxwRlwqyRn4JGwRTvgFOgrdlQo7NO0hYyLGciXqKN1nL1GPUVCujyxLCVDDlZ7HJBlnMWrt9ViUQEutcd6UtpRy4mDCjt7Ukuc8VEEPXhTCZmyY6nOxwWktGMW3NmWhEDoWp836GKYP6bqcMS3DsTBEGt1RQOchaPyUtRV5XD+yvrV5/87P7cMdRzh6gNMAAAAAElFTkSuQmCC") no-repeat center}.__trunk .car-trunk{display:block}.car-frontlight-left,.car-frontlight-right{width:27px;height:15px;left:73px;top:79px;background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAPBAMAAADnvanrAAAALVBMVEVHcEwwruQwruQwruQwruQwruQwruQwruQwruQwruQwruQwruQwruQwruQwruSBWxtOAAAADnRSTlMAr/PlCdYVhHFdkzpNx+7UmR8AAABvSURBVAjXY2BgYGBxYEACHHGPJTbAeSxy7969eySZAOUyvgMDxQMQ7jwI993jMjA3Dsp996gByON+BwevgFx2BPfdBAYGXiSuGQMD8zsU1UxI3KcYXI6FokYw7nOIS9z2zKiSDXr3uATZK2xAjwEAQVxuCQ6gZCIAAAAASUVORK5CYII=") no-repeat center}.__dark .car-frontlight-left,.__dark .car-frontlight-right{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAPCAMAAAAiTUTqAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAA5UExURUdwTP///////////////////////////////////////////////////////////////////////308lk0AAAASdFJOUwCsCeQR7n9db9j3z7w6lYpNISwfQc4AAABsSURBVBjTfdDrEoAQGEVRH7kTnfd/2ETTKLT/LsY4jLU4Z4uMBQSZOAoPuJOkt7cRuhzljjQ+CfVcthhyplHErFQtTQ36Mj83eb0p5oa9mFyY/TFfTO0UvHCDqW64I2ZtUjloZf3/avytDnMCbEwQm4BUCsoAAAAASUVORK5CYII=") no-repeat center}.__alarm .car-frontlight-left,.__alarm .car-frontlight-right{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAPBAMAAADnvanrAAAALVBMVEVHcEzmUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/UVr0fAAAADnRSTlMA5tT0rAkVhHGTXTq8TZOvERAAAABvSURBVAjXY2BgYGANYEACHHoPPTbAeazn3r1799grAcpleQcGJhcg3HUQ7ruHZWCuHpT77nEDkMf9Dg5eArnsCO67BQwMTEhcMQYGxncoqpmRuI8wuBxTDgnDuM8hLgnbu6LSR/Hdw1Jkr7ABPQYAC2Bvi2FUNuAAAAAASUVORK5CYII=") no-repeat center;animation:blink 1.2s linear infinite}.__dark .__alarm .car-frontlight-left,.__dark .__alarm .car-frontlight-right{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAPCAMAAAAiTUTqAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAABRUExURUdwTNkNDecPD+oPD9ALC/YSEt4ODt8ODvQREdIMDOQODsoKCs4LC/USEskKCuoQEMsLC8gKCugPD9gNDdMMDM8LC+EPD9wODvYSEssKCu8REdNuNKYAAAASdFJOUwCHbwjTr1UR3eY6nO/0u/P4IThvr5QAAABySURBVBjTddBJDoAgDEBRWgYZFGdF739QBYxBrW/7KU3KWMY5+4E6BC3Rfh9wGS6NxOrZ7pSzKpLaXzTcw3r4aDEnO1AgNVhIaatYSSbuNCMt/lpPNBHbTIsNnfPCdNsbFIfrrVIIzntRn8XA3/GrdJgDjQ4TUz7qSvoAAAAASUVORK5CYII=") no-repeat center}.car-frontlight-right{transform:scaleX(-1);left:183px}.car-smoke{display:none;left:222px;top:22px;width:39px;height:85px;background-repeat:no-repeat;background-position:center;animation:smoke 1.5s linear infinite}.__dark .car-smoke{animation:smoke_dark 1.5s linear infinite}.__alert .car-smoke{animation:smoke_alert 1.5s linear infinite}.__dark.__alert .car-smoke{animation:smoke_alert_dark 1.5s linear infinite}.__smoke .car-smoke{display:block}.car-key{display:none;top:30px;left:117px;width:54px;height:22px;background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAAWBAMAAAB5x3LYAAAALVBMVEVHcEwtr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Zj/dLIAAAADnRSTlMAIUNNLJA4qsbcD1v0JTzM5k8AAAB9SURBVCjPY2DAA9hq3gHBmxBscnbvIKAWi9w8qNy7KEy5dy93Q6RfKmDKPWPYB9F4FFPuCdzKQkFkIIAihwpeXsAt9y6AunJZdbv6cMk51BnglXuTgCzXpAQDC5wWJGmBwwUq92IBRri8gIYn0Hyc8dCGO/6accd7GQP1AADpef831nOeowAAAABJRU5ErkJggg==") no-repeat center}.__dark .car-key{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAAWBAMAAAB5x3LYAAAALVBMVEVHcEwtr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Zj/dLIAAAADnRSTlMAIUNNLJA4qsbcD1v0JTzM5k8AAAB9SURBVCjPY2DAA9hq3gHBmxBscnbvIKAWi9w8qNy7KEy5dy93Q6RfKmDKPWPYB9F4FFPuCdzKQkFkIIAihwpeXsAt9y6AunJZdbv6cMk51BnglXuTgCzXpAQDC5wWJGmBwwUq92IBRri8gIYn0Hyc8dCGO/6accd7GQP1AADpef831nOeowAAAABJRU5ErkJggg==") no-repeat center}.__alarm_ign .car-key{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAAWBAMAAAB5x3LYAAAALVBMVEVHcEzmUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/UVr0fAAAADnRSTlMAIUNNLJA4qsbcD1v0JTzM5k8AAAB9SURBVCjPY2DAA9hq3gHBmxBscnbvIKAWi9w8qNy7KEy5dy93Q6RfKmDKPWPYB9F4FFPuCdzKQkFkIIAihwpeXsAt9y6AunJZdbv6cMk51BnglXuTgCzXpAQDC5wWJGmBwwUq92IBRri8gIYn0Hyc8dCGO/6accd7GQP1AADpef831nOeowAAAABJRU5ErkJggg==") no-repeat center}.__dark .__alarm_ign .car-key{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAAWCAMAAAC8N5/ZAAAARVBMVEVHcEzbDQ3xERHjDg7TDAzaDQ3oDw/iDg7aDQ3cDQ31ERHaDQ38ExP2EhLiDg7aDQ3uERHMCgrqEBDmDw/6EhLUDAz1EhILJPoIAAAADnRSTlMARiIsyzmQqlUK3BHsYjd4MU8AAACtSURBVDjLzdPLDoMgEEDRQRlBqDyF///UMm3SCE0VXPWu2JyExwBwMxSP/dMydyq514mpi6m9bVk7WM5ZbZvKhxTrYli2mquWS+acK9fAXJ2YTvrNTlMFhhCIhZHKGWKMxOJIhRljiJmRhhhqYaTmb2atJWavm0FYBrysbrLy0CklYqmOs+9WmJkGZKjhxWhKGnU5lt57LiX3xzqGuQYUx57/1iLZ+7sPSCD8YU9naiPfqnCNrgAAAABJRU5ErkJggg==") no-repeat center}.__key .car-key{display:block}.car-hbrake{display:none;top:85px;left:117px;width:49px;height:31px;background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAfCAMAAAB55NVoAAAAM1BMVEVHcEwtr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Zr45jTAAAAEHRSTlMA9i9VDR1oyblE2Zbnd4SrwLPTDQAAAahJREFUOMutVMmSxSAIjOK+xPz/107Y1MybqcrheYlFoGka4Ti+clzutdae3Uv/PMzFxwz7wt+naz/D/wObAYD+AePHMVKhW8tkTjHGtFgGcpq3EviXDxhkAO+U+ZyFNsTCFIAeYZPgRENWH+P3FOjnb0rtWSyybE7AZhLMXfAybpjf6qBnxUtEImyzmgIvHVONWEprZXQEr8KGmJAMR0eGjlOUCcENAaZKOIsWypCwOMOpKCKdJzYS0avoGFXQo0lsvr9OI4IYzmUn3ShCywhCakYchos2zJ8KwVCnFd0Y4xEBkvzWElRfrxVlFqXOiBH60J79GQEcsXLwaSCFgrLyyqqzynGPMLHTq0AHy4jXNbUaLI1ZWq13qlpFfRrUjyZY8NCKj/QD2yW0Ty09Ca1nhN+UI/ZCe4gtfEQMIYukLrveLt0jv11/zxtoQBfkPKdOjPSy7Od8oKRlplAcqmlKbmCbQVSURoZQy7Fn5h+kQgSZ8950aInTtbAcVUKTHgw3b9TBu6QgkEt46r6krLXec/viY1/VN3sR5o4z1b7du8B79ztb/PgBbaMh5Te8rkAAAAAASUVORK5CYII=") no-repeat center}.__dark .car-hbrake{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAfCAMAAAB55NVoAAAARVBMVEVHcEz///////////////////////////////////////////////////////////////////////////////////////9X1DS3AAAAFnRSTlMA+i5rzgi/8VWylhBIITp6GWDl24WmqN0DJQAAAdZJREFUOMutVMmSxSAIjEviFrMn//+pYwP6zFRN1TtMLhqgWRpkGP7lG+c1xrjO45f2c1APf+pevrDP09N/YfvD7ey9z7h5R85tuMNJEDeTeJqsnT5Z7lDRv8HN7onDGYCUxz1AcbVCD/hCeA8L01FwlZIUiknNZqiOdzgtKbl3sXOBHEmctSC23E8JrX6zA8tYrQ6WaaCRyiLnFqbzPI4zGDiPxc1WiyUahhXJQ3dLKN24daXqraS6wo9qaYGGCWU6roYQ03WhkSpTEAvxJHbDcAh2kVCEQHYzK3BAfiEoISpTRnw1xFCC3CV2OZZKKaCpVnSRvkOAJlRQ+ugrvxiMXBGxR9zG1DrAq69k4X/Dxf9GPN1QHaynrMDz+Ejwta8D5tNKUwGDhT0+qnF1MzUdV2MbVMhHYZf6RTe0P6muH9043tIudDCQ5KqlB0nrjciK//aniTFONS0K8kYUPy5JKkQV8/0ozTS6cmZrra+AVXghv7YTUoYaj0G/ht0UkR1l2LlMlOy6QXnc/rFPYBRh2es59pFZQSxYz5ptpae6yFPkPspzppBHliywS+4ou+TU/MbKF7tsN611ztw++9pXMX2x43zbcS7qL/do8ti7Zhn/Z43/AENKLgL8JNYWAAAAAElFTkSuQmCC") no-repeat center}.__alarm_hbrake .car-hbrake{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAfBAMAAAC8FDhpAAAAMFBMVEVHcEzmUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA+8M/VoAAAAD3RSTlMA9ypmClLhGM69Pph3rYUzM4AgAAABxklEQVQoz41Sz0uUURQ9zA8/fyRECEkRb3STrXLRUpgvSGiXi1y4mghxIcTMpn2bQBehy6SFunAZ0zYiZlYJtVB37tR/oOHjC/t0HE/nvjdDkRN0F4/73rk/zrnvAv9hs98+fY37Ae8dyTtbV4F79Nap/fE2vDNfQ9ExefOxSi4DC29XQ9Uyz2Id2QMg+kLOYYg8NqBQ5U0UmUz7ywlvIbIXWZ6cxoRVMSu60xgVXpo/yFPgKOmRqvCDPVmj+0wxzAtEh0tLL3YxokoqY4F7HNP1GXJGOpmLnIKcp7DJdTxUqxzPvh/wBhpZeAOqwutJTUgqipeos4YWrwsxamXFGQLXVv6W1P2QONPW6qCbc4EB3Sv82UUabUM6M9ZnUPfyb8TneG4+xyMFsom9LCDju8AT9WlIiXHbRyWJrc8jG0Jd/qb0wZ9BT+rHIz0Fp2iI+7nm/qqH5Fxq02laNjtim/aQUbXQB5XkDjApYS0p5VZew4+xqeDM3GvUkCb4PHxC3mUx1kK6BmuVu3/akFbFLiLkq1yL2VO/B/rCbRNv9pgqlbfd+Vw1N9rYeBdKR5OTd4GpsG/tPlu6YMDtUr/1ffmvvf7bfgFHGwzSGXwgVAAAAABJRU5ErkJggg==") no-repeat center}.__dark .__alarm_hbrake .car-hbrake{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAfCAMAAAB55NVoAAAAdVBMVEVHcEzoDw/iDg7aDQ3SDAzmDw/iDg7kDg7ZDQ3ZDQ3RDAzdDQ3dDQ3OCwvzERH0ERHOCwvtEBDTDAz0ERH0ERHwERHvEBDrEBDbDQ30ERHrEBDJCgrvEBDpDw/hDg7oDw/KCgrbDQ35EhLTDAz0ERHuEBDOCwtd+i42AAAAHnRSTlMAUSAsy0IGDmtaexU1uL/48oHi1LDi72OpcJCYn9DJXZYCAAACD0lEQVQ4y61U2XKkMAzExtz3fQ6EDOT/P3HVMoZJUls1D9GL2i21JIvDsv7EPDGM8zg43pv5Tp19asvq+I18mX6+Wi3/U9YRQnBM6PpVPacVo9YBHaRpVaXuJegQ4vPA6Z2+gBwaHAVBtwYqjMBt9n1v0UIQyIa7t1uAQBcPOVl08gMd9g5FW1J+v6zI9r3xzmK7aVIRrgBqKvNzO8gcAR4YRN/EPsjQIiaPkWSdVk3TVPWAKebjyDBxhzReg1UQyjwdq1xTgq2lW0ftcWCaCAR3s+p1XVNcs13XjpuCKArwqD6u6wN0euZZVkMIRRzynlH4J1HcPCnXlhUEuLZ/1roUiMzUm5yj41oaLWR4SuOy9FpBBBSCPJo3Oh4gETuQL4r5UvTd0JuMx7IEvxTBzx7asCvLKnVFHwz27W5kIYFw25RWbGy5CvmtQAKe6wiSH2FJAMUFec8ofO96UZ2TV+RLZpITeeSDS3G/J73ujfCmxw6fZFhf8nzyWDadb4U8T8HzomNAHot890tBdXIeCmnnF1kC25rMyUullDACTIC9OEhShvwiS9CNfGl/e9l9ohSWoJAUnGyUmxPiefDyG5pA2KZqee0v/CDTASAV6IgMc/BYigP+467lKpxLXMvnUK76KSkZlnh4UQKbXqaN4tiWkp9wzOrLpnf+iyIx6flkv/kfjUQ4TZPvuH/zG/8HZVhE5NtpQ9AAAAAASUVORK5CYII=") no-repeat center}.__hbrake .car-hbrake{display:block}.car-shock{position:absolute;top:0;right:15px;width:46px;height:40px;background-size:contain !important;animation:blink 1.2s linear infinite}.__alarm_shock_l .car-shock{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFUAAABLBAMAAADzB9aCAAAAJ1BMVEVHcEzmUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA+bXBxUAAAADHRSTlMADYsfN+RRudD0bKR3EWJvAAACgElEQVRIx+1WMU/bQBQ+x6bQZEEMBbYsCIE8pAMVUhm8VAIpG4ih8hAQDECGVmqlSvUALWMWpAg6ZGBFyoAQYiFLq5rE8H5U313sEN+9u3M79w32xfryfPe+73vPjP1DuNd4KS3vvbZDnaVjvDYB4MfXmgW7DzxvhFh4tEDXAS5xHxzKF6Z4i5AGbpdDf1nShojBXc5zbNWC7QHEeOsi9MlWBQT10/QfbNg1sc0XCO1P27BTolKTiD2xMoEF+C2yD6xp+dt/MuYDbHIKb4x/cACOmdOBmNO7CtvGxBFSXAbY4u/oAHxKUxwFBNZHCqYgCcQS444rb7cl9iRHHSluQhtXs0ITcHH/BfNDTGz9JVIcJSgJL4RcEDWsJCiyB1xc5aEU5eUB1hjFOANyqFJyn9g8Mue2FCyh/PesixneKVAYqNhb9o3xCivxUcXueNfM6alQyiXTZU6uEonGfJxcOdoaTfjEwTStYrbYwXjI5Jrsf0CkbeitLMeWTu2ThQ+GHohk7JneRnMy1tAqnLBgxXis/EVitcKGJrRRvBLMU8SzqU/cHElxf3iPA1NbS/Nlr2gbe3ZagK5FEulwET4v6W08ZCPV++M45ZpR4wWsMjrQir7xiDgVk/N7voAaphdq6KSM2ex0mrFQP2FOK9tgxUzIBA65V6NfWW+jCSmJYa/o7pwsRM65IxbpyR/mHvtG7/uit6t2rZIjBgLKVRQhE3llbZish4qJx7xQNlnPk0zWM1kvHH50qD1jQPfgMT7cjqEP1qVqNg18OLufc4+fT0eK4s3iNnE6nZdc9XRJo8jna8fcttX+Yv8Se24DVVYsIo3Y6bnXrxXFssMG+x/j8QerCbnj+UiVVgAAAABJRU5ErkJggg==") no-repeat center}.__dark .__alarm_shock_l .car-shock{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFUAAABLCAMAAAA29zuDAAAAQlBMVEVHcEzlDw/kDw/iDg7jDg7gDg7jDg7kDw/UDAzjDg7yERHxERH1ERHRCwvmDw/xERHLCgraDQ3rEBDgDg7SCwv5EhIdwXrcAAAADnRSTlMAiwo8U74lbd8V0u2nqYQ9F4EAAALASURBVFjD7ZfpdoMgEIVFkN2gCb7/q5ZNRRPioLa/eslp1OLHOBumaf5GVM9HCDGCaXsDs0WTTIdkilJSanEJStQ0zbZ20yJ2hYllhqD3QIWODJy8ukDRFUtVgkQfCnULtEmmqnjGZqi+Fv7E6eKZvAc6hwdt0qq7nK4yC3hKK3m9BtCaAsluKa7XFZmMG21cwB8u0Faj00a3xpsXjkJaKTp73PlGkbPYzhgTYs7cgVmgRLmzyXR4WzREY5hj3d0hBaSjKLxc9e5wz2E0SX6gBMl83e99wM0k6XuGCv8Ai1SntZbKm+4Fi6ab7pfXie6tUjk0wVaBMk8bX690hTJzIEjpMSOje1lq4eZQgN5D/dqtSlDhIvJ047sAzVcyb3BcH6tDItC1yEVeRih7ggRpP0Q0WMcahUFBLd0tTGKNwqDgHa0NNQpBPhSuaonPB4QqaQVTdA+QdE1zpBwGrdp68eMJgta1WwZi1sXJpQDAq6/6/QyAVSc2SSGPTH2deUsQ/HWkM1j6S1h1jD3hW3yIHc+81+DxEMtpPZaM7yI8P3vdgnUQvLnwGnE9lm2hITz7pU68fKH8fvThmlPdz5t2h2BLPe+wdQ0xuKyfXYqzwsuZdrR9DTYEuO3DnZtg45zp1VeUGeJifuDdbcxbGMYYvyvKDFvehk3MvnmutxuNtiJxuQ0dRHxIns6O2XDi4MRFthgIyu1eBOwCa9GX/53EOoMGVn6QnQYEdkHZhF3EBjA2POaAS7uQR63D/+mhLnCzaWnNIbM0DlA9oMGLF3KcDItm7ACpBxzv4QUL+pW2iAOwPE4t7ad8tTV93FyoC4ZSGCgf3kWgLhhKSYM/UAFtXGDW8y9z2TuVArcEQVDHSSli9abmPiysymu9ClstZ555QTgshl40twkdJMpJ9be6dH3l9zVFm7tFGGn+9a+NfgBLHXMy5/KcxAAAAABJRU5ErkJggg==") no-repeat center}.__alarm_shock_h .car-shock{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFUAAABLBAMAAADzB9aCAAAAJ1BMVEVHcEzmUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA+bXBxUAAAADHRSTlMADYsfN+RRudD0bKR3EWJvAAACgElEQVRIx+1WMU/bQBQ+x6bQZEEMBbYsCIE8pAMVUhm8VAIpG4ih8hAQDECGVmqlSvUALWMWpAg6ZGBFyoAQYiFLq5rE8H5U313sEN+9u3M79w32xfryfPe+73vPjP1DuNd4KS3vvbZDnaVjvDYB4MfXmgW7DzxvhFh4tEDXAS5xHxzKF6Z4i5AGbpdDf1nShojBXc5zbNWC7QHEeOsi9MlWBQT10/QfbNg1sc0XCO1P27BTolKTiD2xMoEF+C2yD6xp+dt/MuYDbHIKb4x/cACOmdOBmNO7CtvGxBFSXAbY4u/oAHxKUxwFBNZHCqYgCcQS444rb7cl9iRHHSluQhtXs0ITcHH/BfNDTGz9JVIcJSgJL4RcEDWsJCiyB1xc5aEU5eUB1hjFOANyqFJyn9g8Mue2FCyh/PesixneKVAYqNhb9o3xCivxUcXueNfM6alQyiXTZU6uEonGfJxcOdoaTfjEwTStYrbYwXjI5Jrsf0CkbeitLMeWTu2ThQ+GHohk7JneRnMy1tAqnLBgxXis/EVitcKGJrRRvBLMU8SzqU/cHElxf3iPA1NbS/Nlr2gbe3ZagK5FEulwET4v6W08ZCPV++M45ZpR4wWsMjrQir7xiDgVk/N7voAaphdq6KSM2ex0mrFQP2FOK9tgxUzIBA65V6NfWW+jCSmJYa/o7pwsRM65IxbpyR/mHvtG7/uit6t2rZIjBgLKVRQhE3llbZish4qJx7xQNlnPk0zWM1kvHH50qD1jQPfgMT7cjqEP1qVqNg18OLufc4+fT0eK4s3iNnE6nZdc9XRJo8jna8fcttX+Yv8Se24DVVYsIo3Y6bnXrxXFssMG+x/j8QerCbnj+UiVVgAAAABJRU5ErkJggg==") no-repeat center}.__dark .__alarm_shock_h .car-shock{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFUAAABLCAMAAAA29zuDAAAAQlBMVEVHcEzlDw/kDw/iDg7jDg7gDg7jDg7kDw/UDAzjDg7yERHxERH1ERHRCwvmDw/xERHLCgraDQ3rEBDgDg7SCwv5EhIdwXrcAAAADnRSTlMAiwo8U74lbd8V0u2nqYQ9F4EAAALASURBVFjD7ZfpdoMgEIVFkN2gCb7/q5ZNRRPioLa/eslp1OLHOBumaf5GVM9HCDGCaXsDs0WTTIdkilJSanEJStQ0zbZ20yJ2hYllhqD3QIWODJy8ukDRFUtVgkQfCnULtEmmqnjGZqi+Fv7E6eKZvAc6hwdt0qq7nK4yC3hKK3m9BtCaAsluKa7XFZmMG21cwB8u0Faj00a3xpsXjkJaKTp73PlGkbPYzhgTYs7cgVmgRLmzyXR4WzREY5hj3d0hBaSjKLxc9e5wz2E0SX6gBMl83e99wM0k6XuGCv8Ai1SntZbKm+4Fi6ab7pfXie6tUjk0wVaBMk8bX690hTJzIEjpMSOje1lq4eZQgN5D/dqtSlDhIvJ047sAzVcyb3BcH6tDItC1yEVeRih7ggRpP0Q0WMcahUFBLd0tTGKNwqDgHa0NNQpBPhSuaonPB4QqaQVTdA+QdE1zpBwGrdp68eMJgta1WwZi1sXJpQDAq6/6/QyAVSc2SSGPTH2deUsQ/HWkM1j6S1h1jD3hW3yIHc+81+DxEMtpPZaM7yI8P3vdgnUQvLnwGnE9lm2hITz7pU68fKH8fvThmlPdz5t2h2BLPe+wdQ0xuKyfXYqzwsuZdrR9DTYEuO3DnZtg45zp1VeUGeJifuDdbcxbGMYYvyvKDFvehk3MvnmutxuNtiJxuQ0dRHxIns6O2XDi4MRFthgIyu1eBOwCa9GX/53EOoMGVn6QnQYEdkHZhF3EBjA2POaAS7uQR63D/+mhLnCzaWnNIbM0DlA9oMGLF3KcDItm7ACpBxzv4QUL+pW2iAOwPE4t7ad8tTV93FyoC4ZSGCgf3kWgLhhKSYM/UAFtXGDW8y9z2TuVArcEQVDHSSli9abmPiysymu9ClstZ555QTgshl40twkdJMpJ9be6dH3l9zVFm7tFGGn+9a+NfgBLHXMy5/KcxAAAAABJRU5ErkJggg==") no-repeat center}.car-tilt{position:absolute;top:0;left:10px;width:46px;height:40px;background-size:contain !important;animation:blink 1.2s linear infinite}.__alarm_tilt .car-tilt{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFYAAABLBAMAAAAYMG2BAAAAJFBMVEVHcEzmUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/MbzTdAAAAC3RSTlMAlXHh8jVWyBoLsITgGrYAAAK4SURBVEjH7ZbLaxNRFIevYzNOu4oSqZLNoBEt2WiRSpmNVdHWbFJcKGYTKWg1m0IxFLIJRSg0m/hci2hBsnE6Y1Pm/HPex9y5j5mTBNyJZ5N5fJnzu+d1LyH/gM2/uH3/23Am1P0O1JZnQfcDgDu7AHuElBYf/JyEPgd4vE3IJsS+NwIIJ6CvALpc6hMIt6iUMb6qqxBfFJdej6mGhxjq1SBakjdnGDpuYmgFxm11W6fsZQytQqJ/xgH4PSNKSBWTQNGwb6yThsR6JK1mfbVU4XFYK4APLH+uCFkR7AVx2050ais2+5Gl30i0Mt9iq+OhmWjNji0JsG4kOrP4PBVjBs7RHHkV7Zt75D3AqsGeg0xCaaSh4ZBlxKzLuShDexoa+3zZpohBYoeV2wl/BPBVZ1sp+yUwIiBC3jNLqCMkfQgKguUGpuB6WIBCWS4gHtqsjQKrBG9kps5dZF5yaMzyIoK9k4UpYK2dQzm7JS5P9b5K3BzKNDy1SsLh/VqAgp+Vm5wSZwGzR+YyWX5hBvOlhlvbvWmszPIzQoJp7E1V3VM1/FL9jTJRTfzeJcaYK0SXHFMvawsMZRXJLtSQGLBwX7jy8noeJS3Rdqp8Ib7G11jNoVzfijEQ08pf0NB0FM8HcKSX+khq9xo2SsfVDWKyZTnWJJpgw1+ypWyMoPsE1cs17GdlsXaIsnXYoIt4k2ldHg7KGNuiU0Pswty61NM6xs5BsqlK7Qf10TjGWL0eoku8piOM1eps/DrtqzYGZwLCZpp0NRLygRB2ry8Djm6Z5FPKbihN6MHB0QduutY+dm5IBYeaGx/7cEeNMCl/FWNlFzVVWE6mRbic7hATTzpVjV3QfRTYO+19S/tf4WGPv36r+zidKKIrAtgo3LP1dDTiIzMxEX78/Ny0h3d7+uGzI9kd8t/+0v4AfnAF+EiTE3IAAAAASUVORK5CYII=") no-repeat center}.__dark .__alarm_tilt .car-tilt{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFYAAABLCAMAAADdwICAAAAAP1BMVEVHcEz6EhLmDw/iDg7lDw/mDw/kDw/oDw/nDw/XDAzyERHkDw/gDg7jDw/eDQ3oDw/KCgrQCwvzERHtEBDYDAx4pujNAAAADXRSTlMA/sRxV6QKGY/l4y1A39feDQAAAw5JREFUWMPtmNuyqyAMhms4g24P+P7PugNoCwhWbGfWTf/OrFVj+QghQPTx+OnvJSjTXaeB8i9CKet2afItR6UOQAD/BYw3Gwldx+463wdHGRWe5a/QYbH5L++NHrx/UUR77TvRW0ygncmJbyxNGhPoItF7IdXkGL1o/kwzNIy+eFNuVNk4YWFmoK/dJ92ydEvf6KmHsrMByijTrg5/QVfOoJzC4n6DURBXqURjgzM/jNRIxBh48jWwcH7UY+od9cCXLoANuqrrqShwKBkUPdbvcpcjFUQ9PZaK3uw+OFnAq8t4qeuUKzACoraMizjLZLhxlsKk0q1wbW2B6gLGfWj0yXoDa0VpZ7SLLWpbu8x/r2Ot1UcoOGiBu1jynGh3Xc10YS0c5slW9Uor6i5Z9RzI7nGq7RWqj17dXZpECCffjnVqPLeh+5q7ZBxlBB3PxOLobzb+Dhug9gQrXpvoZrFjKTmpdJ3KK56i9ozhMjJCIY3CHXkJOo7DHtTyEPbhD8+Q4S+H91RPQF+GcRh205BHgQy7QA/XRB4GHDNRFgW1mcfhuqBkFEXsxyJ5EBTWWPAxNlsRRnzHaVXaqv99rKG009zgKKKS69JB1uybwrKPxJbSbgPNnvKsmSqcLWK/CYwQQimBK1Cc7t2yFksBGn782oy5vAB1R9lmqtSsKyrd4dlaVlr1coUmVqtsHCNb1KIM7Q8lFKmXYYAtslNZqCOUNdbKLMcaeaRC67OCi+3MooHBOmdMJUU7lriGfC9i1/kAxck3K2vFGteW+uJo9tA5/oTJl+ssWrlqnmfopfvnuLG2BwmOX5sfpNmTsoY/4TOrZxVP0Kyan5nnkuLHXT8QeicKc3H0Ub9T87MzyZgqWzwQzK05xjN3p7SoMpuVfepuGka59yY+cndK/eLTbm/OMTolSpKJvMzN72cg5ca7lXqZm3PMpFhZHkj7+xmWYFllHH0rVqhyc1Prrn3W4tNFptFp3seegOQc5Cl1uvFC0GdSdmSRDKtuvAPk5rDsVYZtz7ELy+RWjv3009f0H7sNe5qt9ZW5AAAAAElFTkSuQmCC") no-repeat center}.car-security{display:none;top:0;left:0;cursor:pointer}.__arm .car-security{display:block}.car-security-1,.car-security-5{width:39px;height:112px;top:86px;left:0;background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABwBAMAAABvBnRJAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAnUExURUdwTK/ICq/ICq/ICq/ICq/ICq/ICq/ICq/ICq/ICq/ICq/ICq/ICg9r7CcAAAAMdFJOUwBmldjuDVAifL87qmr1xZYAAAGWSURBVEjHhdMvcsJQEMfx9B+l1FDbQeBqKlBVCAwzFQhEZUUOgMgBEJi6CnQH0SPkAIiShEDaPVQhJbsved+ZrvxMkvfb3ZcgsHoL/GplXR8vJA097IkUUcOuJiKSTOvYlmM91/GlRHlqfrKsj+Yny3owPKtMsoWTUmugODO0J4f2umbt2IM/+uCt4bfinM55hHMsukjkR5dC374x3NA5Ozpnqeico9trCRzu9JPq26+GibeKQ+WKa8OtNimQyGlS+tCkhHC4TGFpKXWeUOcb2KRtrS2Q3U00oEQxJLL9Ools7kMHP2FGugw3ZkYxU4qpd/NSYB7OlZE9Zd9Qdl3wiibnjFjv4bXAODuE7k2QrxOeE7pdysj/pw3dDene5oQzwh7hO+GacEU4pJwTQoHea+OsRlfHHcy42lHrf8xhG9VlaNdwT5gQFrDM6tLWMSM8/e4NjAhDwgVhTLgkHBHuCHPChLAgzAj/+mxiSNgnHBBuCXPChDAlLIN62CWMCceEOWFCmBEe5+RjTDgmPBzfuWvWfYD1CyxkUfc6J6p0AAAAAElFTkSuQmCC") no-repeat center}.__dark .car-security-1,.__dark .car-security-5{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABwBAMAAABvBnRJAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAtUExURUdwTP///////////////////////////////////////////////////////81e3QIAAAAOdFJOUwCYZQ3ZUCLthTvDcbP30uf6VgAAAaBJREFUSMeF0z1OAkEUwPH1AwWxoLIkxM6G0FlpaGzJnoBwAmJiabLhBMQj0NoQEnvCCYwJvXFhl0WEdwblY9/M7vwTX/nLzr6vGc8z8ea5UUhqLp5K5DtYF1l3cnYSiEjYyGJZtvGcxdsdykMGx3uU1/wvd3Fl8Dg12fSsKjWaim2DI8WhOa61lsyHoX54afBbsUt5+pDHlC7ScUuXlZ6+MPhDeRaKVYMDxQCSFwSSW/1EevqOOq8bjBXfDU61yU+oyGpSepBcfEguDVhaRJ2H1PkMNmm2VrRwDmM3q7QrmkBFpiFr56KvpmXhSzojgWXYZW6ozIgGt07xXGAe1pWRJdU+o9pj911Yk7NGrPfwTGCcJcKyjV8HPCK0lyGP7ps2eC+wty5hm3BM2CesEg4JW1RnQCjQe2ac6eiyuIAZpzsq/I+x+y71MmRWlF6bYgZDwjVhBBuWhPDw3HPYIfQJR4QVwgHhB+GCMCZcEq4IE8J9n3n0CSuETcI5YUwYEkaEu0IdrBFOCKeEMWFImBBu5+RihfCJ8C996TofNx7GL+lZCtdI4VRFAAAAAElFTkSuQmCC") no-repeat center}.__alarm .car-security-1,.__alarm .car-security-5{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABwBAMAAABvBnRJAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAhUExURUdwTOZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD6fv4bUAAAAKdFJOUwCWZUgP2O66KHsJ8HuDAAABfklEQVRIx23UIXPCQBCG4bTQFlxEVVSmdSg0ClVRlZk6FAJTFLITFY1CVFX1SHKh+ytbUtjbJO/KZ5Lst3sHURTqMxrWrU+HeCf1fIAzkabo2XgrIm7Zxamc672LLy3KW/+TbX30P9nWo0kpWgfF+4CZ4oKeXKl5zToKDzp98CFgqbinPgn0CdFFCojeUJ8j9amoz07R9ElhntDc9Kn17VeafEaT55BoLJDIDCkxNJc5NJclHFpNkzuaXBc3Ecg+FchuE2WUaAeJwvmaRGHvK5jS7kintAfkKWZNMRu47WEf5srIDxxlWFJCS8oJzYrlRANVMJCivQnyfcEbQjulrPWfB9CekJ7bnnBBOCP8IkwIc8IV5dwSCszeWed1dZMOnmDHjCUsnvE4vHN6bbroCBs4zOul7aInvPwQelgQzgkPhDFhRrgmPBGWhI6wIfSE/3P2MSWMCTPCirAkdIQ1YRt0gCnhjnBDWBI6Qk94vg9DjAk3hH/tR0/9eo6wfgH9/J4i9/X5uAAAAABJRU5ErkJggg==") no-repeat center}.__dark .__alarm .car-security-1,.__dark .__alarm .car-security-5{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABwCAMAAACq9plIAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAA5UExURUdwTNELC9YMDOcPD+MODu4QEPEREeoQEN8ODtYMDMgKCswLC/IREd0NDfkSEtELC+sQENcMDOQPD1M8iaMAAAAKdFJOUwBglhY7deG60vA1FB2FAAABvUlEQVRYw62YyZKDMAxEY3nDLMbx/3/sQKaSAS3QNZX29aXVkowPeTxURf9A5GqKCJdqrSncYrG+lANg9xJ5wO6liNjtSg6xu4qZKpcaM1ZFEbHbUyqrwPwGlRMBg4qRsMsqJybjVWwQdgR2kbAutqHM8mTZxaxJlA2zZjeLsqS5VVk2YWWd5qaU1bsQV8WrmNytU7k5YGVFPL2sXIZRlmTZhsTzDYsXNjvliOlR0yTjJdWu8eWGpou3EQ2Ot5F1LImp6MpgvAhNpTX+mA5Yu1u8jrSrx+uti+l15bTOH6DcVYmxFM1uA9kt8IZdZ+Nz3RAbHxkYH3O2/AJvA+K8hfXzOoLJsW2AnNXuwri8GCrsk1yWrp3OOMtuOX9FwcKeILecr18EOfoyl8F+B7Pf8/zKgu1j/6VxTrfvaet4/8IXuOO9d1/g3D+4eMFFjFuP7xBd+OUztxpnOl4YWm0VkFs9yAWQcyAXMW4i0G8A/QrodxjMJTf9NUzTlQjjxgz6FZCbPMg5jBsJ9BtAv9Fjfp+AN9wn4B33DkjjjTzIOZDLIFdAbgwgRyBXQO63MMARyI0ot486uHvd/9Xx1g8tKJOqTsSbogAAAABJRU5ErkJggg==") no-repeat center}.car-security-2,.car-security-4{width:93px;height:84px;top:11px;left:22px;background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF0AAABUBAMAAAASUCY4AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAkUExURUdwTK/ICq/ICq/ICq/ICq/ICq/ICq/ICq/ICq/ICq/ICq/ICq8a/NwAAAALdFJOUwA7dhv0vFQJmNTnxvs93wAAAcVJREFUSMe1l79LQlEUx69Pejo21FAtDkFQi0RBuZVDgUsR1PAWh1qcQhAa212KwAa3hpY3GRrq+ecyk7znDvd8v4N3/nD4nt/3OLeyd7jO0KUHeSbw4r7IBY4XuiLyDeNpf4bLCMXbc1ykCuL5Hy4VDpcXDpcBgCdLXMZoZBZv+mjGPRP/Na2sdhUuVwa/q3Gpx/GtAJevKP4U4vGKSPMQn+zFfM1C/DLaMK0Q/6hS4nvRZBVC8bfxUB4E+HUcP+bwUM2ro9T0DLyj8XOjjIt9hY+tNr/XRWCNwUThQ3Mo6B65cZSzn+ZgVc6OzJF2qsQ3TfM5Jd5t4+06L5yGP57sBbTBqVHmbTXKvB0bbf7NNl/zM2XOYp1aYNn6qQVWQ8kfaMBqK3s4spq9uh8CX4vUM3/mqFwh5v1CRsx3OPO+t8gaT4ktG3gL1LHyFvmmrVGVowb4HeftFPl01bhcuYwLZsIF0+3gP5x5Y/U5b8tcX/lykNyWcmboKDl1Uk6Fiw70YU9IOUecHK92Jo4rZaTP/Whi99Lm/9gBz5MWU8q/CVj8wt/h260Ld5Z3RcDX2OJKGRC8azegTly+E6Gu29k1vJoj+wecLqVGxKfJOgAAAABJRU5ErkJggg==") no-repeat center}.__dark .car-security-2,.__dark .car-security-4{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF0AAABUBAMAAAASUCY4AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAnUExURUdwTP///////////////////////////////////////////////w2imYoAAAAMdFJOUwDAThrsNwnbnmyB95onFT4AAAHMSURBVEjHtZe/S4JhEMffFCWbJKnJwSBoaTAIjNraCgeDoKElm6opCoLAIWjMwSGaG9pqKgpX65W07o/KNPLuGd77fgef+cPxfe73RdHE3nqNobMLckXg6QeRNxzP3IjIO4wfFge4dFD8uCHDV8bwk+oIlxaHyykk5h+XLoDnxrj0fDzVGOMSH7h+L4p+JS+qTYO7GXFrcflIxvcCXPqJ+FGIJ2dEqhrin3fEX0XaiQWzGOLbZUr8ZWKwMo0An0125VOAzyXjK5z10JUOHqo5c/C6xbecNE5b3/S8MreR6nhtMGfw2G0KNm+uI+qzm25jNRXbcVtahRNvfVlw+82uxr/8Pq8TJ65x5guceV+NMR+XOPPnvvlVHSm3F1vfA8O2wn02qzMHGG3TCn8GJpUq8m/fl6asEPP7nPl0lTNf58zrKkfM54gpG/y2j6xbKnXuAX6KWipMbOcBPKVmLLJ0qUJ5ReQUOWfOUHVinJ9HVuOx82Pkt6qwoJV3mYutkgM0HSPnhZTTIuVEXLAgORucHJU7kByVysi6rr2J3Us7VO4M3hLRF4YBeBzxF/Dt1oQrS10R8DX2d6V0Cf73aMozfLQm1HU7uIYnc2T/AH6D3yU8+Es0AAAAAElFTkSuQmCC") no-repeat center}.__alarm .car-security-2,.__alarm .car-security-4{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF0AAABUBAMAAAASUCY4AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAeUExURUdwTOZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD2hJyK4AAAAJdFJOUwAY7zu/eFXbnIpxqPkAAAGkSURBVEjHtZcxSwNBEIU3JHekDGKIdgaJcF0QQewuCMJ1Z7p0hwi2sQlcZ5v2cprMv/VMIs6sYWdecVt/DG/ezOzOOtfaGU4h/JU+ALozJ7qy4901EX2Z8ThrcKqteFTS/gyMxiQHnHJb9F+clhhOGwynncGZ8g+nSvc9I34KraprgVOq8HOJ0ziM33s4fQbxCx8Pd4SwZn+2z0Cujf3BgXnx8ckAEr8KF8oX/xS2cuHhj2H8HMO7CYT7alYOUjPRulJ6s9PGXFaq1q7BSOCVeinIvplpeE/gN+rFKia2Vq+0kRBfOMhLVby7tY/rv8applj4GRZeVyPC697I8O96+DOoUtJ7w2M7wpJ1vHMMT1uf4ZaneQFV1sUsvOUhfMDCdxIsfA8Lz6fcYk4MvLJetpbS8tbJsWwNS4WobYplu7UsXWxQrh3WyRYzI8xMbn6KmV9Zsu1jrcPlmFbw0rYPnZAzBuXkLciJQDmXoJwMkxNj1wh30/ZfuoN6pzlvSCuzLXxp5Y+bb2HlD78I82/suIpvAP7nF5QifLNeY79bN2znk/0N73wl/qKly5AAAAAASUVORK5CYII=") no-repeat center}.__dark .__alarm .car-security-2,.__dark .__alarm .car-security-4{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF0AAABUCAMAAADXoMs5AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAA5UExURUdwTOEODuYPD94ODu4QEOUPD+UPD+IODtoNDe8QEPIREc8LC/gSEvIREdsNDewQEMsKCuQODtMMDOR3NToAAAAMdFJOUwA8d8LtD1Ufldir43LfDuIAAAIASURBVFjD1ZnbkoMgEES5g4BE/f+PXXRNVjcjqZKehzSYtxy7mlEuCvF18kqysV3MOXLZNrnKWAa2jHmXw0cy5JfA0Vh1YFd5KNvksxQjO+eBkV2FKXmanXMA18lZpr++db5WZ8nbmFuK3YGPLXzH20Cugbfg4/2St2H9+/j7Q7c86ruVYsaPGtS9ZHys3j4oSjbjRtnbZfgxEtdRKm101h0PkfrgW3e8u7zmYwtp+NhCPVoaXN8r6zFes03fROeHhu8x9C1fnGnAdeck14rc9M7+oQGPvncKqpC5Nsp474rOaj7jW7HMdOs2XuHzlXT3UlGa+cp5/0Kxwi9kJCNcW0Y4YPl8CTeAbYs3cyHhg4fBy1sDRL7WeZkp84hluR1222s/Xgi40KVstP8NsteKO+xku3bIHjeUXUd+KQay0XKFFgQuX7YPmkHOfWJ0vpcLEzxwwo8juvw1zHGLPDHLs2MOLGxaYX/m97uATkP0ctJKrj1g4Go5xvK8g8bA3UIpYY7nfHojr/4lS+i7HCx0QqBykRR7Ao2oTeSIgk4VA2ldonKZiBZQuUyEQKGLMBHWJ1DoknI+qW/IRZHWQbl4zlyE5szFkdYlrhrfBXqOtoPoN3hCftBxiWlI94o/F2USYPlj/PhPUYf4teDQM36uD4wqsVnfhjfwWd+GV4lv0Q8/8mnLyG1ixgAAAABJRU5ErkJggg==") no-repeat center}.car-security-3{width:114px;height:29px;top:0;left:110px;background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHIAAAAdBAMAAACEUSXBAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAqUExURUdwTK/ICq/ICq/ICq/ICq/ICq/ICq/ICq/ICq/ICq/ICq/ICq/ICq/ICts6I00AAAANdFJOUwDunrcKI3I53Uhahss+c95JAAABNUlEQVQ4y2NgGCTAtXLZbiVjmzM9Z4yNtLetLHUgSpf7auWDd9HAxcPaywnojkzC0AXXfSgzAJc21tWGd/GCi9ZLseljT5a9SxgIp6O72n0zMfpAQGYnsl7WZGL1ge1NhWuc3XuXNNA0BayPU/EuyeCiJtDJQbJ3yQFCExhi75IHEhh4yNTpwMBGnsbLDAws5Om8BQxbW7J0igB1riVLpwJQpyMuSUGJDkGcUVYA1MmEISphBMzNIZD0xRJauWyTDYYBN8CZBC0bZpVgZiSWyCQLFGXXwMJIqbYpE3fWd086i1B4FSyUC7POrAR/icFSpgHTaQAWgKS/G1oBRJRSUVC9C8A8ZhDTLIDIcjEMVORchHiKC5jypxBfpLJM6r17CcqUUCetOGbfcRPKCiC5KC+gqCIAAP7XA2JIlnmlAAAAAElFTkSuQmCC") no-repeat center}.__dark .car-security-3{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHIAAAAdCAMAAABBocjAAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAzUExURUdwTP///////////////////////////////////////////////////////////////8/RimEAAAAQdFJOUwDrt3EIOieiWtpIlcqC9hYxv/7NAAABM0lEQVRIx+2Wba+DIAyF1/JaoMj//7UXHXGSuYFT+XRPojFq8kix5/Tx+NdGUitnBXtjEDGEQPnIV8Z4FtYpLa9DTcqyR4LUEhAatmo6BXPChDbqDR2McMfB2jIeh1VgZKt7cUqcpG25QjX2WCrGmK5VDOw+YbW4HLdiUbwXWXlK94r8ZrHSeUgjBOZJ1WYMr5TYuIxMYyXyMsNY5GwSYigRF1+LI5F2+WNxIBGejWIHIn3py6NdEgGAiPL58J6o4gW+oyBzGC5RPNWGKacS3diTc7S6XSP9bGfkS+2E/xpDvL6776/0U9TOc0SO9v2Sv8ydfwi61oozF3absnxXbb79cd4cLuqAsptn+C3YTmJfMRy3hVtaE7yT98yjJR1NdTOCV7eOwYopuXr5A4bvEYwP+gOQZ296MP5hDAAAAABJRU5ErkJggg==") no-repeat center}.__alarm .car-security-3{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHIAAAAdBAMAAACEUSXBAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAAnUExURUdwTOZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD+ZQD5tcHFQAAAAMdFJOUwDum7YKPCRqUX/dyy1nRuwAAAExSURBVDjLY2AYJMAtonySsrH17tW7jY2VpleEORCly7VTeeMZNHBws2YpAd0ZkzB0wXVvmpGASxtbp+EZvOCgZRs2fazFMmcIA+Gp6K52nUyMPhCQRtHLVkysPrC9ZXCNQWvOkAYWtUA8qHiGZHBQA+jkJJkz5AChAIacM+SBAgZuMnUmMLCTp/EwAwMLeTpPAMPWhiydIkCdPWTpVADqdMQlKSi1ShBnlAUAdTJhiEoZTe8IS4GkL5a0iPZJ1hgGnAKnIfRsmIKZkVgyiqxQlJ0ECyOl2kVTcWd916I9CIXHwEJzYNaZh+AvMVjC4RYbgAUg6e+UegIRpVSGFiztgQAziGmeQGS5mA4qcg5CPAVMf0ItxBepLMDsfAjKlFIlrThmnXUUykoguShPoKgiAADmiMoHyDLWFgAAAABJRU5ErkJggg==") no-repeat center}.__dark .__alarm .car-security-3{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHIAAAAdCAMAAABBocjAAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAJcEhZcwAALiMAAC4jAXilP3YAAAA/UExURUdwTOUPD+IODukQENMMDN8ODuYPD+gPD98ODvQREfQREdgNDecPD+EODvkSEu4QEPMREdELC90ODuoQEMsKCjMV0GQAAAALdFJOUwB1ILjlPFWikc/uxCqu+AAAATtJREFUSMftlu12gyAMQE1CCNB2utr3f9aBTAfTbqCW/dmtPaeHE3MbP0i67p8UZK0BjAgR2Yj/JWIAtGY81wRC1r39hrMkcNCN3lWgWqu9GXfYDNXLMjGZci/DbBum45AXuEQXRGcRUpF5qsWgewVBC+uLzMb2/dDHbwWF4cPQO6NTn7h+J2NpWAh0Eq0obhyvYyOc+BuL10rG7FMN+DJt5Tm3/KglPEdwawlNN7OpMj5AdG+Hiu+IvrTifjGf76WqPVXNVEvnvc+USMj3Ys2M33cuRObQuskW/AG17D7vz1FT3y3vsIbUD9lgCd2OUgL7ejz71r6t/EoH69qADw4w3ruqhJIL8khQos+anfxwodLUaS+heXGrsR3UwpL8ka7rqbyso50Jx2IlW/Q+fukUHKy5ARvM3tz9GR/Oh2Ne8tEM1wAAAABJRU5ErkJggg==") no-repeat center}.car-security-4{transform:scaleX(-1);left:218px}.car-security-5{transform:scaleX(-1);left:294px}.info{position:absolute;left:16px;right:16px;bottom:11px;margin:0 auto;max-width:420px;text-align:center;white-space:nowrap;display:flex;flex-flow:row nowrap;justify-content:space-around;align-content:center}.info-i{cursor:pointer;height:30px;line-height:30px;vertical-align:middle;--mdc-icon-size: 20px}.info-i.__hidden{display:none}.controls{display:flex;flex-wrap:wrap;justify-content:space-between;width:330px;height:110px;position:absolute;top:134px;left:-100px;right:-100px;margin:0 auto;transform:scale(0.7);transform-origin:top center}.control{cursor:pointer;box-sizing:border-box;overflow:hidden;position:relative;margin:0 auto;z-index:2;width:110px;height:110px;border-radius:50%;border:3px solid #b0c80c;background-color:var(--paper-card-background-color)}.control:active{opacity:.8}.__dark .control{border:4px solid #000;background:linear-gradient(to bottom, #3c4042 0%, #141c22 100%)}.__dark .control{box-shadow:inset 0 2px 1px 0 #5d5d5d}.__offline .control{opacity:.4;pointer-events:none}.control.__inprogress{pointer-events:none}.control.__inprogress .control-icon{animation:blink 1.2s linear infinite}.control .control-icon{content:"";position:absolute;display:block;top:0;bottom:0;left:0;right:0;background-size:60px auto !important;background-position:center !important}.control-left,.control-right{width:90px;height:90px;top:10px}.control-icon-arm .control-icon{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5BAMAAABTxLEMAAAAJFBMVEVHcEyvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvGvzcAAAAC3RSTlMAaO9YqyVA0w6ZhA5zQn0AAAFiSURBVEjH5da/S8NAFAfwljYxOmVwENyULmYJFBRxqRCpkOUQwaFL0bGLYIVilwhCV8GpdBEXoZ2MqaH9/nO+yzVWSu/HUhF9Q/JCPrnLvSSPFAqrj/s60N7Su3NkcaJzD5jFqdrZXg7jphJe4it2lQPOnXrIMy7u9q9e+b6igCGdv+HJASWJeuYk4pnDL5HPvUZnayItU3othQ0gjUTqdIGxFI6AjzxvAVMp7H6bjm4jlUJ6LM95vkGVlDmHFuDnByU6iCTQEiWx+/2mKBVTwyLg/jR0hsMhM4Gz+F/QDrI45nAzoH6BYPk7XhJf34TDgcjd3wnbYjF1HUzy8oQa+G5VD4GnKmtp4NTKGl/MRrp7ZEdiYO1iOut8+9jTwoQ3kzQK9XV0qUlWigYFH9PebxjANBpM+PRaiFqvU4YJfLPYthGMmeUZQey9wAzO409Bf3l79BZdLOn2FzsLcbvSn5dPt1fD//G/nT4AAAAASUVORK5CYII=") no-repeat center}.__dark .control-icon-arm .control-icon{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5BAMAAABTxLEMAAAAIVBMVEVHcEwgQFcpU3AlSWQfPVUcOE4aNEkjRV8oT2sdO1ErVXMCVnGuAAAACnRSTlMAau6tWDUYk9dGuOnlZwAAAVpJREFUSMfl1r1PwkAYBnAIFMrWaOLApokmMmEaDWHqgNE4NbIxVV0cGUxqmEgwmnQixomtrYTy/JW+x3HQIPeRGI3RZ2jfpj847r1yUCh8f25awGhP77pY5FTn7rDMmdpZDQETXwlfscqxytWQy1gBbxl4OX97ZOcjBWzT/SdWXFKRqkdO1y+Rj23T3SYvS1QOpbAHZKKOgKkU1oG5qCdALIVRbjg79+6fQsvSF3WVFkfmKjQBT1yU6SJQQFrhWhiOeas0sAg49Hj8LAzDMDCBy/wvaLmLnDC467oE3e3PeJl/+WYMDnjt/E444pNp6WAq2tPWwLnVuQAeOv5EA2O+8SV+XfcZ/St2fLe0k3musmP/XgtTtg1kfC7qPjrXwGHRoOFTOns9A5gFg1klMoBo2sMSTGBs8SZqYeKvfm3UEPs7MIPr/Cnobd8eG5sukWwV3YONaP8vfCkfJxOaWedReZcAAAAASUVORK5CYII=") no-repeat center}.__arm .control-icon-arm .control-icon{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5CAMAAACWNFwNAAAAM1BMVEVHcEz////////////////////////////////////////////////////////////////P0YphAAAAEHRSTlMAae9ZKg+HrZh3xdxI6fdeerv4pQAAARtJREFUWMPtl9kOgyAQRVFnBEcG+P+vbS1LsbVpWJI+lPuEGE7uLBlRiKEPwo4s2OTunDOkbA+sJveUUdDqLsc9tDa5XIx7095gcnJXYujLqydCipdWDdoqTlHX5XGPuGTIRuRaw9suDmMsekXQyFdmIlFVdIw/KWNCQ9pw9h1enkV5jo3oXPqlGMgngyrFjqYuZvRGbGZrya1T8UzII/YdaSCrPlcCMS+472efxLkFmCYO9QGqbHb1ANp8LiztQNjvenQzHyvokUMh1mM95Z39a6CWobLykI5AezylN7p8MgRtEahO29MADuAADmBfoBIId2E34BzuI9p0AobPCb9stgAvNYD/ACy5FSN/53HRvR1o/iJq/dEd+qgbGPhPB5J4MncAAAAASUVORK5CYII=") no-repeat center}.__dark .__arm .control-icon-arm .control-icon{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5CAMAAACWNFwNAAAAS1BMVEVHcEwqrvkqrfg51vtTz/Iz0Pcv0foqrfgqrfgqrfgrufpNx+8xyfJA2vsqrvkuy/stzvo6uepE1PYvvO0uwfpY3Pctr+ZDvusztOh/fsqzAAAAFnRSTlMAPhmv+MmhBycRS/vbvDJ0jv7c8GLmqcGunAAAAb5JREFUWMPtl+tuhCAQhctFmRl0vKwC7/+kdYF127RNC5o0bTw/NiHGb894hkFfXi59lJHAgkgwSHMGjQfV3ZxzoWtaAjzIQx4799TUDGAO2Rve4hKS6k0aaN0HhXmQ1TzlPpOvJT55k/fW++mxtENV1XJ84Ozat+OoGpuRwVJFMoZu+e51FICIEkjZkJOBCoMq83qBe+jLHPJjxFqDtudYnom/SHOOutiiTB3jV5FJyScu6TmWP0WIHR10qs1QNydyjt63pa0jYsXTzJHHzRZErN1QSBcKazZLqkzJ3dbURgYn6+mfCoBDbmHz7Mi0Q6CJCy0Kp0xi2MXcg7jlHbLg3k61QIqB7HNhC6YSKHfgPZDn7GJz1KGRbQghOwxbtxx1aGjVOk6FYLXWKx12iMBM96q9ImbAOiBy3nkLAwBCAoLcFkLlxAFNQRd2KdnQbZpHTkBu78s81bq5YOLgu7Nk6kUCiubdSaBk6ah53Hk28HJ4Obwc/pbD3lqr29McNkIsm/gsoLMjiU00upOAzt2i3HnAT1+1L+DfBuJPgLb9+blsKH+QfK3g15L3djnM+hutZV98COIbHf4U/z96BQkdcqN844pAAAAAAElFTkSuQmCC") no-repeat center}.__arm .control-icon-arm.control{border:3px solid #b0c80c;background-color:var(--paper-card-background-color);background-color:#b0c80c}.__arm .control-icon-arm.control:active{opacity:.8}.__dark .__arm .control-icon-arm.control{border:4px solid #000;background:linear-gradient(to bottom, #3c4042 0%, #141c22 100%)}.__dark .__arm .control-icon-arm.control{box-shadow:inset 0 2px 1px 0 #6ecaf1,inset 0 0 0 6px #2bafe5}.control-icon-ign .control-icon{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA6BAMAAADVUMOiAAAALVBMVEVHcEyvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyArOdMeMAAAADnRSTlMAVeggerzYED9osJgtyxXVqLoAAAH0SURBVEjH5ZW/S8NAFMdP29pfDi0idCodRBcJaHZxyCJCEcRVCoWOpTi0k1DBufQvkM6KxU1wEHdB+g9YNK3Sknp/g/cud0nuXUIVdBDfkpfL5+6+9967F0J+1RaOgvYQDaZp0Nr/BEyaprkFTJU55pxYpgCsfCHo3wMHP7XiuWVZ+wCuMcfaa0RxcaraQRR4gcDXqCJDHLXx3qlD/ihKoEpIgxwz5watNBx5x+WWk8vPVK5OGdhqdST3DqMn4H0o4BIF0EBnuOduNwhmMFjxdWwAcHd5lRPRU8Gcuw2YA4AhxKYQyCWWAzXJPo15ESIQJMbky8AF+WTmKCBITMiXqQtSHvo+HVuWD3aDsYfkGEK3p8eXmPSnrddqXpyKCgibZXHW6S6AO8oQSOxoIM/6ojIEm9Q1kJdmAkuMa5x7iTJYYgxu9VATxEDHD08ltGnQkgvO/IDLenmaA9otZizISXSeF21FMR1HMhy8wUmIAtskZtAojdfP3jcbhVYFCTmVgw6uEwR6B50Ebq6Smay4v9ve7GZ4rsnjJn8sG/LQfQ3sKTdcVFc7TcPrEXUpGxWo3glE33PIUK2muv4r4YU4yVIdxA0QOk6po4NvuJdCDd8aOjjVfl1M3irVwZHWnpvULoeAPf1vmC/kFVsh5CxfIH/DPgGy/87fbOTa2gAAAABJRU5ErkJggg==") no-repeat center}.__dark .control-icon-ign .control-icon{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE0AAAA5CAMAAABEZFZVAAAAVFBMVEVHcEwjRV8aNEgZMUQiQ1wlSWMrVXIoTmsjR2EfP1YpUm4dOU8pUnAeO1IrVXMePFMnT2soUG0cN0waNEcZMkYZMUUpUm8aM0ccN0wrVXMiQ1wnTWnRYQmBAAAAGXRSTlMAEf2JM6XuukEJ4ml35vpT02Qcd1zMiqHDHhAivAAAAgBJREFUWMPtl9mWqyAQRUOccEJBoyL//5/tAIgECk3fh7t65TzFYW2rqFMFeTy+6iK3uo9o9exW+xEt5W59abCKdBNRlFQq+41RqKKhf2G78s/TcrRL0xhSug+LnlKzoj216ru8aOZ+iejm/IBgnM9xCNAYk6a0YUMsVezXE8zqX8/kuLBhRa4+I2SuPeSCehY8UZV8g/FKvsdqdQcqRL1+cqONZhXfQhuPe6OflnBFS1yLrkJrhKMQ/WuVOd4rkKZCy2vz7qSXctWMjXqCNBVaJE6mK0+dZ1iQQbRUhhZb6ykLIWmFORkBmgptsh+MJk2wg5at12sLCm9opf2IzF25SH6fNAdt2G6s8oXGakeDLdJ+6q0yOKVCG3lAnVUGDngNzyFacmG7k6HlNb9DK+DQEJYqvLTsTGurRa171fTcE1dpmcNv1RkWA6vXBmkEyyG5WxNBqxem6Z1lN9MoAFoRpqkYkXMk343NXGEGu8RFw5TS4e1NulruBfvNVdOja+1EI/Ehzc43u9JaZi/ECTFoeWYnyoKtNZycifDDg1sTnYJ9WgI7LGpPiXYiSGugzZ+lRqK+jqJLm1TyN3w0iYlO1DuP8DFoSQ4fTTBRiXo76qCR4Eldnsapv6OM2GjwFLctCYn95jBiu3DcHJZkM8AcmkaGO0dpj/Qr+ffv/H+kH4ADrguFSSSjAAAAAElFTkSuQmCC") no-repeat center}.__smoke .control-icon-ign .control-icon{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA6BAMAAADVUMOiAAAAMFBMVEVHcEz///////////////////////////////////////////////////////////9EPuwCAAAAD3RSTlMA73gLmL0oiWE4VETfpva0IugHAAABq0lEQVRIx92Ur1PDMBTHCxxjxc3hyk1gVzDgmJgf3G56xWAQzE0iwG/coTkMpmYgwPSO23/An8CfMDrWG3CwR9KXQrq8t2AwfEXTH598Ls1L4jh/m7OaluocsA5anv8d6JZE1gzwKIoiCSeijW7km0vZZZ20VsSXz+zBHYqnkWMHb3lhDnQ9XpgDOaEbijzJn5E3YcAKT/TZgcQ/Z4QrOQ4arLBiFV6k16JVePeRNl2b8BpScNUmLIAEN0uedYSeBHeBFW53Ohsp2CJAXXgMODYxzSaIwolziiD0JNg3QSVsF0cKbKPaADNhdxogOJDgAsRh2CWFAHsIvkhwGQDoEYreSbPZEvdvxFrICbO8EzXOCbO8qtLYhKqUQ6sQxqqGNqHaRN60VqvPFWZgrE04KYTEBEkhAdJCAmwUKKEJJv4BJdRAtRUYofbXeCBxwhzoPPBCVZnHWB0ArFD0ldnZV0cKK8z2dwGbRVaI61E7CzghrvCfUML7w+89M18YpLUYmMLqzAgRbBvC8ewIEexZhQjGhLBPgRNTuFSeie9slctXptAeFNq5Xwut+QIO8nfXbW0z+wAAAABJRU5ErkJggg==") no-repeat center}.__dark .__smoke .control-icon-ign .control-icon{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE0AAAA5CAMAAABEZFZVAAAAn1BMVEVHcEwqrfgqrfgqrfgqrfgT6Psqrfgqrfgqrvgqrfgqr/kqrvhp1/Uqrvls2fZSyPof3Pw7wfossPkpz/sqrfgjzPsM9f8zuvozvvpQ0/Mq0Pwjxfo0tfk0w+8pr/kV4/kd6f00u/pSzvE10PdZ0fZf0fhExPoQ8P5Pyfkt1/s1wfotr+YrsudNxO4/u+pDvusxs+cqtegY2vUyt+oiyfDgbn/+AAAAK3RSTlMABQspEPgWajMhGzrvUeaEropJpkKb+2GB64+VfuVZ+9hn+8bOvHD1ong/SPKWAQAAA2ZJREFUWMO9mOl6ojAUhksSYxaZIsRBrSLWvciieP/XNgkGisoidma+xx+sryc5S054e/svMgxQLcN4AYYoJFWCFHXHATq1qjWCoDMNcf9crZ7AnWnYngfV+rT/Ks1k/4JmAMyoEsOgxTFYtI3UwNB0l1Ku98VaaIhMwkyRhqSh1oCjK4xPf2v5bW4G7MtV/zzba1q4n2WGuDYFGrY4qhtJ/Mtus+3tOilQjDQt3gv4PUk3MBeiJ4MYTnPbpqXhdIRJf2EmRQvbwqmg6grDCICOMAyFqeT1c1o06nvqii0gYx1hfLTT/lrkkbEoPGiLVpjxXWkkzFmcTsdj9stp8lCdx4OtN2qBSQ+yvNIoyxbHmtiNBuN+M0xOORRLi4I7f1XChm0wBMXQ3/kcy0PM5EmvEdZrHCagB393SSY2zlzpfvROHWAGQhih77RHxL/I25IGoCV9tusCA4xwITjEoCizq+BKQ2QV1A3yHrYkOMsw11eyONbWAeLktIz7FGxmw4xGDxelRbFaGHD8BO0O5k4tgtW7w2u98ovVgnqJonkQmqsnYX1ncd5CZCCiq8KnR8tVO5nMPG+2aoB96MC5wo6p73FIzFFRYvTEIaEg6U7q8jQsCC6WMxo5li5/FgFlNxzTU3o6NcBOt7AgOC+kzvqRFUe5G65TeawJjxpY9kaueCXyxKBuEjSHRjWspHRSOJWZ8x/CsgC7cWoURWnyIkzSzDItCddS8xdh5YYio01mpt1fvQp7oHmQ2qsm2LgBFoTeLc18yNMOMJlaLbQusIeRmqpaKse+AkseabJabTabddodpl5npWYto8lGnAtvk97BolZYOd4QnydZMMtNApJN3jrpCpOZVeQCoO9r2eXh/Mxcxx1h5TxVK+pySkHRZpnrcTdYEK2LGpI1xOx7jwIoN8uwmkYiicMw1p1svObopqu56ZGGOWxQCwuizX6/d3QqOATUNVxk/AQsiB2PF+vCGBo/gkl7ONZrVjqo2ZM8DZO2EaT74rtpq4bNvGmDN0MHouuSkoTDyi3DDWwrDr2wXp8yqOghO/olsNEGI9Tevtdr+yVzkagntpyCyv3BtgTDAFNYK6p20QZi6hBXj9PtxZlCCVMPNypvv4264DjsN1fJZs/46ZcGwCDhUq99DKj/bvES6w9+KnVAb6+BBwAAAABJRU5ErkJggg==") no-repeat center}.__smoke .control-icon-ign.control{border:3px solid #b0c80c;background-color:var(--paper-card-background-color);background-color:#b0c80c}.__smoke .control-icon-ign.control:active{opacity:.8}.__dark .__smoke .control-icon-ign.control{border:4px solid #000;background:linear-gradient(to bottom, #3c4042 0%, #141c22 100%)}.__dark .__smoke .control-icon-ign.control{box-shadow:inset 0 2px 1px 0 #6ecaf1,inset 0 0 0 6px #2bafe5}.control-icon-out .control-icon{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA6BAMAAADVUMOiAAAAMFBMVEVHcEyvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAr1b2GRAAAAD3RSTlMAm/HeyWsZgQ04USi0RF05WaUBAAACQElEQVRIx91Wv68SQRBe4Hn8OB5KhSYmNJoY8/LO11qgsTAWGl608HWa2JoABfElL3kqfwEaY2mIYGUhsbEUG1teYWw10VrDHagYYZ2Z3TsOmD16prjdzX47Mzvz7cwJsdaSevEgX/+8GveuLFF2mitwHanF24vEPZOBeF8jcI9lSIZ3jTj7UhgozxuBT2l/q3D7tDqxa8BtOrDpniLdtxA4ilDo+pdtI5K/j4X2PuKsip+HsBqzwKxvzJ76jniPOOBPALZwEvNo/RbWJ7gcgwZSJd4r32yHt50MFBTlBRrfSPmPATbAJRV2X3MMjjZZFyf+vjphOayTQK/LNKkEAYQInVuOon9ncDF05O8SMANZQXrXrmBK3OuHzymyA+7SA9FxQuQ5Uz0GXOPyMqLkhPhok5UFSVB0iyHgVSHgu8TeuJS/VOh8hZBnoEl3EXhcyj8irPKaIGDTAIyFFbJAZXqmEhWyphOaKvriioncZbKaChtao6bHcnhiOgtxDUSTOS7gOc2Ziga2hCGFSIojGL9oYNVECqRZD4Y7AMKC1jPRDBFjFZ4bdl/ia0jxxG0oz8vyohDpPkbf8BSSyjGnRI+6PCZ3h1yhcNB1+6zmcYme64QrAOCke2T5tcES9wwFgHIynS3TkGiPraVoW54MljelwbKKdVC5P0VU0gzR5oC0f8f5b1NpfqlaTP1HrRykkZX0fLHfNreP+3PPtRvRaNoznLsb2bq+BY1rf0UzfKL83GmtbK/Wq/yHwuv1/tX4D4ojHeD1+cXxAAAAAElFTkSuQmCC") no-repeat center}.__dark .control-icon-out .control-icon{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFEAAAA5CAMAAAB59jczAAAAbFBMVEVHcEwfPlUhQVkfPlUfPlYpU3AfPlUcNkwbNUkkSGIqU3EpUm8ZM0YaNEgqU3EpUm8bNUorVXMqVHIbNUkpUm8qVHMZMUQZMUUjRV4ZMUQlSWQcN0wbNkoZMkYrVXMePFQrVXMjRV8pUW4mTWkzow17AAAAIHRSTlMAOwUP/toX/+gtkMlpilBwnPLpIralSF5Zz/Cpv35916xI92MAAAKtSURBVFjD7Zdnj6MwEIZN7zXUBFgM//8/LjA2LoE9Q04nnbTzkaAnU98ZEPq1/9cMLeyjNIrCyv4buEffOo6JVzMdp021D3lV5+B5ZDZhxw31+zytdXgcgZpufTd96QEPmN3jDtBr8Xhms1vdiNiddkBW+EMy+IXFuRleLolJgbnvscInO9Tsr3pIeYlU2Zgy8SUvbRpyadBHESXrA/XySmt2BJiwOmHWMloGv7qGMrAmXROzR6/xi4Xv5VCeVLkRSRIbbhbxOHF97YGXWDXuHmL2Ee/iyDuJYvjPTtHF5/a2pQsujoKTqIROV3OyBhf5l9PtyRffDRC3Wia77d0ASS4uHnGJRf726KmiQ/Ys15m4KDkJ5VaZ7wZmRQf1rvtX61LJmJz2FdUaKHmxPYoUiBEMy4Lu3E2954kTnU3J3XYZ6uQtOWdW0GnRi+lEzCZrcdODRCoQLVbp8oQYrOOnA1xhmUE3PtA5MoB5hlH0/kyEUA2+Rw6BfDA/28gTD5AUqE7MuKgPkMXe08pRy39dCMB8B+qQHlu1e5jkB2Lj7ETonkyhe3xJAp5i1HuUoXKHN6IE2FKbN7xkiiJ6qhSiBFRSZehSNbCs8+cWCPIcEhJdqi8q9JBGpeWVCPIMShZoyIOSWYLQl2pbATqSrJXVYwvEcmOSYqeTan+zas8RKbXVkCrpSAsIpMLKleZ2CF6L85DOlNha99eD7F/lqyIhZ8iCtN9Sb6/A6UIWt/DInJj1j4dgfuHQt3OCTA+6I6SH4KUjX6MnnVtL+7NqzVE+s5QsZnd8z45uO2S3vo8uWpxxHxyvPgzDPm0dc7/1hxuHOHd1LzvVXPYsd5k36IYZxem3QuChexZbh7wsuf/VpTfvzHww0Efm+Tw0L2MdfW52nPhlWfpD7KFf+1f2DQHphmkhnPr9AAAAAElFTkSuQmCC") no-repeat center}.__out .control-icon-out .control-icon{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA6CAMAAAAQoC6jAAAAM1BMVEVHcEz////////////////////////////////////////////////////////////////P0YphAAAAEHRSTlMAnRTXhgfoYU7yyD1ytC4iPFnvWQAAAhlJREFUWMPtV9u2qyAMJNxBQP//a09bUAKoO9jzstfaeWq76phMMkNg7C9+ZajFSAlShoX/B7RV+q2GgOU7OIvRCmZQj+GWEe4d2jykDrar8OsDvCS263B2vlyHHo8gQ5BRI8jwGE/LVFsexEPEA0/3PbUH5Exr+F5cPEZZ7sBK7ogTIxmHshJKaE9fk4VjCh5qJWyi1p5KATBZMCJpbb8mN1V0IUkynOBLc7g1hWKaQnKCqMRPgm1bi4rSBIPL8DhOkTs6i7nFnvUJtilmXhzBefjQ4b2+NsXxb1cWmGfs82qejARfVe1ElKb4dhw6d9tjeJurvvIa/8IJAzO3FL7oUvHSvQR/a+eD/TOgqD2GGzym8uef5ZcZW9k1os8gmjiJzYvhGg+XQgc8QfSKzQHikquwj4jHKFNL7l/c9lofeOSmxE5l3dmsquUSx0Z2qnctYGo9xFPNRneaPcK2lcC0OdgOUE6bQyFtN+Owq2NrTZpuX53B5kH0lqWILaycOySDLWbsa74iF5YhFR74Zf6Qcq/tTeH9LiFmPfEYdZXwtdtFrDCfX+d2h1B3Nj6wvlY86kFf1XG+D+2LA30VqcsSnIxFcBt9Bg/26z6trvbuuQWxCkTIulBz4wfJkBEdvp3IYEwAcSLBiaVd3y3tT24W/OYYTexR2PObhXt+l1JmhNThuyvk0rRCg1Xs6+A2AESAYBP7i98Y/wDtDEUhR+G4qwAAAABJRU5ErkJggg==") no-repeat center}.__dark .__out .control-icon-out .control-icon{background:url("data:image/png;base64,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") no-repeat center}.__out .control-icon-out.control{border:3px solid #b0c80c;background-color:var(--paper-card-background-color);background-color:#b0c80c}.__out .control-icon-out.control:active{opacity:.8}.__dark .__out .control-icon-out.control{border:4px solid #000;background:linear-gradient(to bottom, #3c4042 0%, #141c22 100%)}.__dark .__out .control-icon-out.control{box-shadow:inset 0 2px 1px 0 #6ecaf1,inset 0 0 0 6px #2bafe5}.control-icon-webasto .control-icon{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5BAMAAABTxLEMAAAAKlBMVEVHcEyvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyArbOiNNAAAADXRSTlMAC9ozwKUeXfD5do5K/1pDgQAAAiRJREFUSMe9ls1qwkAQxzeNRokWRNpDDwU99SR4bA+CLyD4AkKOLaXgC+TQizcPxeKlFXwBIX2AgveSixgarfMuzc5mNsZslkChexrIz535z9fK2D8c46MgeNkvCI7GZD1qufKuEVvWjRZcbclqvui4CvyQqIE22DvYUwww1OWmI0FXC5aBXFsLaGlAF+BVWCUAjRhjChAK0wf4zgdrEJ0umgOATT74wEHUYHJrmQt+8s9zefdEFyJAEGsB2OaXBQ/viirk+TaGmEXyeI7WTAGWhnQNZlKYm4aiDaOsPIH0fSYsT5HB6Me9GJzHqlW+XV4QAiO1dWmljzXdHd3I1XaSDKSkYOUoRu7RF9ZpB/l4S5XASG2cqsMJGDlqyzyib0P4DtIcD30vKyN034q7M40NoRPXOq07nXJMbz/uHjzraHDRcFLgNQjf9xJsUcTpGzEvuy6zJfjOhJyQZW/kugcEBjjjmdKIFniL1giBYUMkYZ9Vjb7NBZFdMWDzNGiKj30c7KTIPmS2xYDqVSPQw4hCRzWnPHKD5PCr7NMQZfGcRI6Hlc1uvhEFRnI4aGY8M3Yhv7qyd1ldsX2sKYE1WWxW8ZSrNgZFI+LKN3K3xFL+JNC8L7TxbNUIHJ0mtTO2b1v3cFB6V9rVyAfsWRhX6qVztEXHcsgPurfIpya1QfvEsN5EDq/WM+utZXfOtO/qV9LGy2JPu7kt+B+g0i4IWs4f/rv8Aovb6pC2+MzZAAAAAElFTkSuQmCC") no-repeat center}.__dark .control-icon-webasto .control-icon{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFEAAAA5CAMAAAB59jczAAAAS1BMVEVHcEwdOlAgQFgcOE4fPFMiQ1wePVQhQloePFMdOlAqVHIqU3EqVHIePFIpUnAqU3EhQVkcOE0eO1ElSmQeOlEZM0crVXMlS2UpUW6QzhP+AAAAFnRSTlMAHnYISC5W+RJltuHz54nNPL6ol9aXJKZhtQAAAi9JREFUWMPtV9mSrSAMFEXc16PR///Si8KREJwS0ZqHqZvHKG2WThOj6M+YSF4GLKa3AbOYulj8KOUMGAWcxAPAPoOKuPKpflBY1gCUtisZ1jIcMJlWgI/tmxfquWOjBCTnxQIwhndFnibnc1kG6EIB99Ngd2beol7zQMT9tDyP2JPuUUMgH/VpWNH5WbmaMPqMoK0xvc/0R+YgKi5fxLX4+vjXlfEAxBgOa5jja+40h6siTQZxHfSjj3Hd4CRX4sVWgwhLQRFh8VYLrsVLALaM0Up45y2loVeyaCHqvHvsGj2lAcANZ0tSRV5hF/cdk/QMEbLd3WKXz23BNw6Kkzpu5zcK5DhIw9OfbTJak1JENYwcu4brS2pFfa0popv3wq4QB/XiSLlnhVQij/Cc5Eycpq1JjUt5pWrCJm8Jp82J0tobMbb57Aapm2toUHirjZrj1g1SvXg84L5Z634nnROkYv/x4Gq0GZ1jVlFIXThdkOtNoKN97SniaAnl9WALp690uiucjs+13Tl9JRSq8ZupjzrWdEJIdw5E2e7WT8FRJdV1Y3enMkzrPO9sxMFeb5BYMo7SxTXzvWdM4bh7zZo97eO/5hoh6N2PGLG5s6YcQnCklZu8w5ayAuiSd9yLoeuyyhKTo6KFuLvm7cxjbtjhG31JQowSVck0GFGGVOVuIdpgwE1yepf43YP/otQJR6pSHZ6znG4nHB68zWsJyl3lLKN3rajylxF5Gv23X7R/yPFWxuN6t6cAAAAASUVORK5CYII=") no-repeat center}.__webasto .control-icon-webasto .control-icon{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5BAMAAABTxLEMAAAALVBMVEVHcEz////////////////////////////////////////////////////////NXt0CAAAADnRSTlMA9gw4IFLD5pqu1md5is5NMasAAAImSURBVEjHvVZLTgJBEG1nQEHUhbAmupHEhcELkGHnynABJ5yAGKJbMicwnsAYD0A8gfEExBOYTAgIfuoMdlV31/x6OiQm1qqg33TVq3pVM0L8h0Ub4urDDYEPA+NdOHG1+Eh7lVsncLY03umhC1eFlfa8kTPZc/g2pODegfOmDHxxAusAP5pKGx4dwBBgzY84yHgTgA9+5KscuA/SuuSOAD7LgX0EUq999J5Lge943OK7W6UptvGY2GyjtyxvCxmqYou8V9ttEZUE7Ub+PCCvaSu1BO4o4Jpv/DyyyFBW5VIBke2u8t4sFZQP9zRQsq1BSewwFglwqeto4V1pp4HIdppUIG3b1DmTI0YMlXddVM0rs6Yu61ItckAZaMyHFNubcqlyLZHKbjCwpQViRMczKv+KA91rzVb3M1tySm6o1WPYzsgJMsAzULH7DByajLM3Ul3ibirJuVB0YlG8EZ5oAJSttN5zrVESkIPaMUC8qaHyybOm2D7z7qoBy02DzwxeIJEa9j6/VUemXzUDfKOM4sA2p5S5oRORSAs7QNclSOhE1Nni5rsziRk6GNovRBbihE/DhIy/KM5WZWLi1ZLyVCPrqtU3KiHSyvdsW6LBW6lvEWyeDm28PdsIpKxj5IzbtDBU2dhaATPnahRigvOFduxctjgHAx7yuQsYGqZ7RdFkrHfDw2tbdynggNXZdL5Xr7id1pVsMX+94TdAdbwhsBL84dPlF22ICtdI2UqJAAAAAElFTkSuQmCC") no-repeat center}.__dark .__webasto .control-icon-webasto .control-icon{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFEAAAA5CAMAAAB59jczAAAAolBMVEVHcEwqrfgqrfgqrvkqrfkqrfgqrfgqrvkqrfgqrfgqrvk0yPsqrvgst/oo1/s0vfoqsPhLx/RK0vop0fsk2/Yux/oi3fwb7PxBz/tAvOti1PRU2Pgq0/sg5fxMxPFFxvgc6fxg0fI81/Q/vOxFwO0n6Pxa2fpH1/Un0PIh5/080ftr2PdU3Pog1fUp0Pstr+Ywsug3uOlPyO9EwOwtyfAsv+yeek2AAAAAL3RSTlMACwYeFQ8zJkY8LHdOX7RrVcWhlfyFwvCN/e3UqNfdnej4+u/x4LHt/sxS37noNJXJUDQAAAOUSURBVFjDxVjZduIwDMWxncVhK1uB0hZoSym0YzuB//+1kZ3NTjskeDinefRB15KudCXT6fzK5yHk3RaQ4j8E3RKQ+PF9QGte0/+4QgF+MgsAYRYT50RQAEziwESkOPwYYVdEygb3cjPElofdj+3BFREFvbWUDyExcojD2f4YYkdWcPfxzG1EEq329slVrET9E7cREZtOuDOitrYRPTxcCy7eu8QtZmXNlX2ZNRr1z3C07Tkxk1tzngwCr7hkoLzm6cqnDi4GmTXni9KeRjPlNRdvQwcnC2tl383tcfcrOzr1I3J9Fnt7nn+nceakF0xlfskkZugK9VIOIb8vCkSxzpiAs+JIln63iBb/wXA9Cb94+Z1noZIGSER51D5uyg5vShhw71wh8slcxW0i8sm0XdyU9bR4ecHYAFRxwzVG1FyIdSu+lTQkc6aMVyYiP39A3IiZ15xmLeLW0pDEzLPcyYIEvoF/aR614FtLQzL9CZHfDwJEojvjRD42CgYKYmiTdOR/j1rbYxrEppP7eZOTJHyEGpRQKqqYa4h8v/IJOCmucBISf1IsbnugDHbKirgpHj4ZkKBBTS5W9UzCpzqiBL5h8LxWJ+mYXSwg3DtVxYvYs6hDwjml/nRRIfb9S4n02LgQGyhehIcvdUQlQsD3qMxH+nkR0SiYE8RN/W9OitOYIRiGJTsNPpolCH1McPdJfK8gAgO7ZCcdXcyjWYKqj4lFQk6uGhCIDbJUiiS+2NpQgsLSL+I/1ytoocOEVOpfymVDPeJuxYVQvJLwTtYLKKJ6SurSSnc+apgsRkOItxD4rqdSvGuvkGZNLpuGLEiLkTjFK4jbq7AR9eyHX75AFkeNM9ZKnHyEAGHZW/yACO11x9Nj86iB1qviFlu15JHIZmeZIcJ2IDeDoHksIFMIoDSySwzIgl2otGTeaq+gQVWD6VwtJ57FjnyIaKaku13UbnM2hCDRiGBsFHpRLx45BC0fEF4lBDpqfcm8iBuaJF+qrnjklEIgNvmSZ/Aljy6rKNSgbp1FnjId90vu4sh3ecjQSDWESKqxpKovY3rotIl6WmsXRoAei0XuosMimvU3ZNEc75mGLI5dx2cM8sci2ZkriLqDy801O2NNKOOaO0qMIebI8RUDiYyXPcsd5I9E+hA6PwY75DCw37+wG4AYBu5PYESp3REoGG9iR57/lYfRnJGb/rdACaa3/bOi490Y7ze/vzNiyOAzbSVWAAAAAElFTkSuQmCC") no-repeat center}.__webasto .control-icon-webasto.control{border:3px solid #b0c80c;background-color:var(--paper-card-background-color);background-color:#b0c80c}.__webasto .control-icon-webasto.control:active{opacity:.8}.__dark .__webasto .control-icon-webasto.control{border:4px solid #000;background:linear-gradient(to bottom, #3c4042 0%, #141c22 100%)}.__dark .__webasto .control-icon-webasto.control{box-shadow:inset 0 2px 1px 0 #6ecaf1,inset 0 0 0 6px #2bafe5}.control-icon-horn .control-icon{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5BAMAAABTxLEMAAAAJ1BMVEVHcEyvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAoPa+wnAAAADHRSTlMATWYlmXapv4jvDtvg8EUmAAABfElEQVRIx2NgGMyg5iCRCvcQq3AOkQq5zhwmTiEjsQpZiFW4kliFOkQqZJ5DpEL2M0QqzDlz5hQx6szPEKdw6RziFFqA1GFTyCyIDDQqz4DBAQx1YnPOYAMYCpefOUOUQuY5OBROQFNoeYZIhTVniLOa8QyRCoGReuZkWRocpLhVY1doAxSqQhVa2I1NoQzQwAXoISaOJWZ0zpw5hhlXmpgKY86cOYElUvcQqRAUuoiEK4xHISOywppSJSUlYFI+rgQHigYwSR9khVhC+aQzPNgOE4i8BlhEEFJ4HBKqTAQVnkmABBBhhYegxR5BhdAYRSpIa6a5uLgAVZ92gQN3kEoF9KI5EEuASwIVFoBZglJ4o5AJqHAD1syOppALa4aGJrMjyHycCoEJ9zRaFpqAVSEoKzgguNZwz6ADbqDM6dZQKAgDlQYBWBWy4gpwjIpnD7rCEzgKQ4wipQBnFYUKTi/AVb5KoyrMwl09RiOrK8RXZhtGdEBBkBTD0AMA0Bne8MTXbuwAAAAASUVORK5CYII=") no-repeat center}.__dark .control-icon-horn .control-icon{background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5CAMAAACWNFwNAAAASFBMVEVHcEwZMUQhQloqVHIZMUQrVXMrVXMjRV4fP1YZMUQhQlodO1EpUW4ePFIgQVkaNEgiRV4bNksrVXMrVXMmTWkgQFkqU3AbNktG6BQeAAAAE3RSTlMAzQnuZlXMijzueSSzWUmcaL/f6A42EgAAAY5JREFUWMPtl92SgyAMRmv8AQFFDMj7v+naSne6VYRYZnYv9tyqxwgh/Xq7/fMXaLwXRYUCsayQlRaqwkKoEaeSwnEpLNRYVijtKhwKrmCFZYXaFhWCdlhSKKvNh2MZnfYWSwmBi8qH8jKFMGhTxei9dxaRIISmXx+JsuBPeNJn3Pszp/Bkt1rEkkJD9KWEA9WXEprnffUR8zzX78IxPT9WlIwvsmzZnC0ctps6SKw0V5lCgbkHnndZQpbZrPdPVzkvJwgfP3kRIZeXhNDFhMxXonmwvXRhzQHDbud5VIjWbYSucUd432u5/+gpvnJJFvcWjcYPhffaNWQkB4IQHcvINhQhOp5OXyQhmnQ+ZKim9kHoftEeIMKgsS9bPR0LZV5jb42My4sCVj44eu12VdMi7okQtgoVLYSfTBAZpi9BGAasgWi+XGGUzBI20sijPHMlHoU5bH2/45lnaqAIx+9BsON5hfg/QqUOSgc0IXTnvlqS499pjR3Zdz+gc7Q8AbdLjEx1OxQbL+r++T2+ALHSUXc7u/FiAAAAAElFTkSuQmCC") no-repeat center}.toast{z-index:3;position:absolute;left:6px;right:6px;top:155px;background:rgba(0,0,0,.86);color:#fff;height:42px;line-height:42px;text-align:center;border-radius:5px;pointer-events:none;transition:opacity .2s ease-in-out;opacity:0;max-width:300px;margin:0 auto}.__dark .toast{background:hsla(0,0%,100%,.9);color:#444}.icon-btn{display:inline-block;text-align:center;cursor:pointer;width:28px;height:28px;--mdc-icon-size: 22px}.gsm-lvl{float:right}.handsfree{display:none}.__handsfree .handsfree{display:inline-block}.neutral{display:none}.__neutral .neutral{display:inline-block}.moving-ban{display:none}.__ban .moving-ban{display:inline-block}.version{position:absolute;bottom:5px;right:5px;opacity:.3;font-size:.7em;line-height:.7em}.wrapper{overflow:hidden;position:relative;height:270px;padding:20px 16px 0 16px;opacity:0;transition:opacity .1s linear;font-size:15px;line-height:20px;color:#00aeef}.wrapper.__dark{color:#fff}.wrapper.__title{padding-top:0 !important}.container{position:relative;margin:0 auto}`;
        card.innerHTML = `<div class="version">1.2.8</div><div class="wrapper">
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
        const stateObj = this._hass.states[entityName];
        return stateObj ? { ...stateObj, attributes: { ...stateObj.attributes } } : null;
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
                    if (!stateObj) {
                        continue;
                    }
                    if (key === 'gps') {
                        stateObj.attributes.unit_of_measurement = '';
                    }
                    this._info[key].element.querySelector('.info-i-cnt').textContent = this._hass.formatEntityState(stateObj);
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
            this._clickTimeouts[position] = window.setTimeout(() => {
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
        this._inProgressTimeout = window.setTimeout(() => this._stopBtnProgress(), timeout);
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
