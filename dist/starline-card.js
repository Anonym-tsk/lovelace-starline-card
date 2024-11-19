/**
 * lovelace-starline-card v1.2.1
 * Tue, 19 Nov 2024 13:25:39 GMT
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
        style.textContent = `@keyframes smoke { 0% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAJFBMVEVHcEwtr+Ytr+Ytr+Ytr+Zykactr+bmUA8tr+Ytr+Ytr+Ytr+bv0VdjAAAAC3RSTlMAgfPVHQpbIsWxOjeFFgAAAABkSURBVDjLY2AYBYMJBGATLKBMcBSMglEwCrACFsEFmGKzdysKK6IJMu8GAQFUQQ6w4BZUQTaw4GYHFEFWbbBoA6pSa7CgAooYF1hsUwKKIOfu3TuENotgWDSVBaPETFYMIMLfAHG7JCfoSYl7AAAAAElFTkSuQmCC"); }
  33% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAJ1BMVEVHcEwtr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Yh8XgvAAAADHRSTlMA85UperPXxgtcFz+iQX5pAAAA80lEQVQ4y2NgGAWjYBQMVbAAU4g78GAwuhhXzZkzZybAuRzGDUByIlDszBGYLrUzZ45PYFh6Bgw2QJTFgNjHnGQgggVgQdYzKCABLLgHVVABLKiDInasAYugMAMWQag75yCLHYU60wZZEOZ2dmyC3Ni0M8ggCR5sgArWYLGdwQfTQ2jWF0AFmbAJcgD9JBoIFXSAx42TNwNXDljsEGoMGYKduQFVkLnmzDHNBozI3LyAegmI2ckAQ4wr5oyImxCaIBuqT5BD/hSqICckvtHMlUEJHiiABIUAavqFRM4EFEFgqjvueMwLw6IILozgmSbUQIS/AYqV8NFPkBDiAAAAAElFTkSuQmCC"); }
  66% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAACXBIWXMAAC4jAAAuIwF4pT92AAAALVBMVEVHcEwtr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Zj/dLIAAAADnRSTlMA+NKulSEOezLC7VdmRRKEWMkAAAHBSURBVDjLtZS/SgNBEMaH6B2RmEqjYBEE7YSgjYhFCLYBCYggFuGiL6ASSyWljWJlYRFUFLEJwQeQgNpYSGwsA5co8UT2Gby9vb2b3VnEQr/yx+7Ov28W4Gell84vihpL5pivaxW+sEAnmFkNAT0HwQEWqoDgkYQZBPMS9lFsyVg3hkMRdGO4HEFWkmwlZqzGgb16eJ/VYLrOVPHrzxrjJ5NZHRZQeZHOACoEvgN0CPwyxGFvJtgDuCNwBKBsup4wBUoROIZbLrUFtCQxjn2M3GnRY/xq71W2HR1tRvOp4BSJOdhHDFO4lVJ2Q8JJk2VmTebCjkvQjPzRy3KwYeWjfcXvGzSOb/jAOjPavqRO3alH+B85hpWdcxd0xhNzW3Hz1vi9J1xVcinLvBZsirLa4lhQefchbPWxtmyo+x2yB+oG8mccA7wCAwwnorjeC9MsazamKfXJTyH2RQivbDTluiG66u+CbqW4HwCDJmj7Nd0soi0SSVX3wMrprudaD9Jsaz9tnX0WyYitA+fvDGRVa5Tl2fjOqAYTaiUYZlQ4HMCJkkobSntC5fS1jpbQbSrQ/xi87e4uCTRvk17cXv6m7m9HjNtgAiSFIgAAAABJRU5ErkJggg=="); }
  100% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAJFBMVEVHcEwtr+Ytr+Ytr+Ytr+Zykactr+bmUA8tr+Ytr+Ytr+Ytr+bv0VdjAAAAC3RSTlMAgfPVHQpbIsWxOjeFFgAAAABkSURBVDjLY2AYBYMJBGATLKBMcBSMglEwCrACFsEFmGKzdysKK6IJMu8GAQFUQQ6w4BZUQTaw4GYHFEFWbbBoA6pSa7CgAooYF1hsUwKKIOfu3TuENotgWDSVBaPETFYMIMLfAHG7JCfoSYl7AAAAAElFTkSuQmCC"); } }

@keyframes smoke_dark { 0% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAJFBMVEVHcEz///////////////////////////////////////////8Uel1nAAAAC3RSTlMA9XXTJI0QUsDkrlcwciIAAABXSURBVDjLY2AYBaNgFIyCUTAiAYuqA6bY6t1CyqJogsy7QSAAm6AIqiA7WHAnmrmzwaINqILWYEEBLNo3FqAIcu3evUNxsxqqbqbdu9vYEtBdXyxKjL8Bk78iHpMyeIEAAAAASUVORK5CYII="); }
  33% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAMFBMVEVHcEz///////////////////////////////////////////////////////////9EPuwCAAAAD3RSTlMAl7P3J9R368ULF0w3Zoeo/f6UAAAA+UlEQVQ4y2NgGAWjYBQMVbAAU4hb+bMKuhhL////ny/AuZwuE4Dk5f9A8A0qxCNq///HBYZF/8FgA0SZPoj99WI9RLABLMj0HwUEgAX3owoKgAXfo4h9nQAWlEcRLGHAIgixnOE+stgnqDP9kQVhbufAJsiDTTuDPZLg5wlQwX4stqO6XgCb9Q1QQUZsgpxAPxWpQwUTYNbzPMxh4IoHi31EjSF3sDMPYETbd+kJ6JHJdWYB9RIQS+IBDDEu/f9mqYZogqxgVz/AJmiFKsgLFvzugCpajxI8UAAJigLU9AuJnA0ogsBU9yP5axaGRZpcGMGztW4CEf4GAM5SLZvfdh/FAAAAAElFTkSuQmCC"); }
  66% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAACXBIWXMAAC4jAAAuIwF4pT92AAAANlBMVEVHcEz///////////////////////////////////////////////////////////////////+GUsxbAAAAEXRSTlMAlzPtBcgS+COsYtd2RIdTuNgIToQAAAGySURBVEjH1VZHcsQwDFPvsqX/fzYu2V3bIinOJIcEZwzFAoIS4gcwVVrtdZbJUDSV+wu64MzV9wusQ2hB9xssEjH2BxY4uSet+wDx2sADA47htgyBzlmA58dKZIfwTNBFkNbV+7kQVE3Rd5JXbadxvpv6DEc85ac8Cc5phN5rnIc7EqwMWk+cKs4Js3hxUy+TFzi8vTGZVwcnQe94jS6nWOK8KycK8WSWF5ViOcb6kPwCxkrDXoBqkBwXuK7F1Xxg1Y2LqznrDT4cmf4D+5Sw0PABVHD48wwXzJfdTYkRN3D3SdGuxNUQJjW9KSSWIP4FnGGQ6mavPqoJKzRU08KF8JpV0o+lfMtF5kP6dj+5d9+v8EHIRWpMr41a84xKClu7hQznJlfte+uCYPGuAiMssF2FF2bWh+4aNg3WuxvQ4/W4+ZZVL9XpuwniFVvOR2PgGXMSdYuaaszem0WW3d7v9iHxVfp87Hyr5H/y6FKWq5vtZFDK/S0rCUUqBmvfX19K9pLkZYZ9P2TlKc+9LlImiLcraHkJwvd0NBhPnI7T1mzxm6u5WR3NCDeb/pr1Yn5jrl/36Wixl/U5kQAAAABJRU5ErkJggg=="); }
  100% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAJFBMVEVHcEz///////////////////////////////////////////8Uel1nAAAAC3RSTlMA9XXTJI0QUsDkrlcwciIAAABXSURBVDjLY2AYBaNgFIyCUTAiAYuqA6bY6t1CyqJogsy7QSAAm6AIqiA7WHAnmrmzwaINqILWYEEBLNo3FqAIcu3evUNxsxqqbqbdu9vYEtBdXyxKjL8Bk78iHpMyeIEAAAAASUVORK5CYII="); } }

@keyframes smoke_alert { 0% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAIVBMVEVHcEzmUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA+n7+G1AAAACnRSTlMA89V2F7kvV5GJcwYlmgAAAFlJREFUOMtjYBgFo2AUjIJRMDJBchummOuqhcaKDWiCWquAYCU2wYUOqIJVIMFVaqiCjGDBpaiCTGDBhaiCWWBBcVTBqFWrgqWU0SyyAprngu54dsUJRHgbAJtCHzHstHStAAAAAElFTkSuQmCC"); }
  33% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAJ1BMVEVHcEzmUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA+bXBxUAAAADHRSTlMA7UYNG3pixDLarpRcYWISAAAA9UlEQVQ4y2NgGAWjYBQMVWCMKcQceWYqhmDimTNnShBcDwcg4QUUO3PSAaorS+bMwS0MbDIgwTMFEEFFMGdrDZg6cwgsxnQGBRwDC7KjCh4BC9qgCiaABX1QxE4zYFEJtZwRRVABIsiFLHYQ6hsmbIIMa5BFG6CCMciCAVBBHWTBCQxY3HSEAYv1h6CCHDJYBEFhd3I5VFAYHjfZ2xwYciDubECJIG5wZASjRVvgmTOlDRgR3OFAxRSUHcCAJbUczzqJZi8kkEWwCZ5G0z4HJXShIAc1eJAFj6EKQpJbMYoYB1Ak/OAitICYAzQPIyy8xBuI8DYAJtL0Rc3itaAAAAAASUVORK5CYII="); }
  66% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAMFBMVEVHcEzmUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA+8M/VoAAAAD3RSTlMA6gtNaRn2KcaC2DqTt6gWtpeYAAABxklEQVQ4y7XUPywDURwH8OdKimKQNJGItDGIDaNE0jKYlDN1QgSJiEStOhCJwVQMJBJhEOvVYjVoIrFUbCYSi01OKaE8d+/u/fm93xEDv/GTe713v9/3V0J+rprU0eR1BppRpE59QK2lrKYBFj2k3YqFfaMzCjZyrCh4yrEcl3jDUfnRkDC6IXBR4q14MCbxkkk622tR+KSxSWG52KkZO/6g47PyeaKeCKlD+Ck6ppRNSBVC+g3WB2FTEIaCXkQsHd3Wn+gYdTASg/bGJr8ErG3Ai0ZOeckOb/uoxDUxH9mTsonD4TZIlKW0UtQ+x5KCyxxfgsL1qKBoyoEa2ByKkcyhbapY7WErXI1B1+ZNiOEL2nIWJ/9S7ZiMXXqIsB/03ki7Vxxjw/Qva6Ri1D7nG7LiYQ8bT8HvyjuzCEo3QVn2VrsLYpLhBMocenLVQ5j6vIcg4GW8/xKVfwp5nIyoyKecUJHnoUNbbPx6HrzwQgCSY6e39z42i8YPFUz/DnYeDKiB2ZY2tm1aXs+gAWczfxcgoy9JAtLyOjwH7+c3ORqEFe24hXeId74EMYHWWizhFdwhZ7B79p12d4tOEVO//Phs/hff/QUdBRMMptyjSwAAAABJRU5ErkJggg=="); }
  100% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAIVBMVEVHcEzmUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA+n7+G1AAAACnRSTlMA89V2F7kvV5GJcwYlmgAAAFlJREFUOMtjYBgFo2AUjIJRMDJBchummOuqhcaKDWiCWquAYCU2wYUOqIJVIMFVaqiCjGDBpaiCTGDBhaiCWWBBcVTBqFWrgqWU0SyyAprngu54dsUJRHgbAJtCHzHstHStAAAAAElFTkSuQmCC"); } }

@keyframes smoke_alert_dark { 0% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAACXBIWXMAAC4jAAAuIwF4pT92AAAASFBMVEVHcEzNCwvPCwvOCwvhDg7jDw/JCgr2EhLkDw/5EhLLCgr8ExP3EhLYDQ3KCgr8ExP5EhL5EhLoEBDaDQ3UDAzhDw/uERHMCwvHSygYAAAAEnRSTlMAuE306M0J/hx6gCzVZNORsJGzK14JAAAAZUlEQVRIx+3RNxKAMAxEUedMDr7/TTENqiwa6PbVf0YjSQgAAAAAAPhNjlN+r8LsmxiLX9iu+EfkOnuSwHTDSgwXmoNYbvBGTD9TO9Gq38na7DLpOiZ2j7uTTgT3cmg16uQ+eOsFChkG1voOuW4AAAAASUVORK5CYII="); }
  33% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAWlBMVEVHcEzsEBDiDg7TDAzwEBDiDg7cDQ3nDw/bDQ3pEBD1ERHYDAzlDw/NCgrdDQ3JCgrNCwv7ExP3EhLvERHnDw/sEBD2EhLzERH5EhLKCgrwERHiDw/eDQ3PCwt6p2bpAAAAFHRSTlMAcCyZxTxkDUwa7oCnwunz39yP6YtSGQQAAAEaSURBVEjH7ZRJloMgEEAFARnj0MRAR+5/zVZ8KqQDusgiCz66KPwPiqGsqkKhUCgUCm9pmivS0BvTgzONcONB7P83BrdOhsxGH4kNQH4APsA5otwcoECjfDSjx4wDQFuwgncNh92xNIdk99CY4bEn2DxyHFvDctoQLPY3Tbja6ift4dCT9xQ8Ogh60avQXScajDygU4h44qSH4sv21O+b1vG9ks8UNPLgdM2r8G1aQBJNEbfXGmlIXZMlGRBpOF0a9WGJbMUJn4MS8LQmIYZf9iuhNbigkc45p4h0Hc5p1K1Y51p26ln/1LkBO7vi5lfk8psNt2rW0szENoCkPRVoKn320AutULaVNLfLyzra2WAn+8xkq/AnzvUPS3U3pA3BK1gAAAAASUVORK5CYII="); }
  66% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAUVBMVEVHcEzbDQ3lDw/0ERHjDg7WDAzUDAziDg7fDg7hDg72EhLqEBDdDQ3gDg7LCgrvERHyERH7EhLYDQ3qEBDUDAzQCwv2EhL4EhLbDQ3ICgrlDw/zwPagAAAAD3RSTlMAcFfrL0XEGwuLt9btpebFsOBAAAACBklEQVRIx9WW25KrIBBF5U6DmqBJlPz/hx40GgG5WDXzMGe3SamsbJCmMU3zEwmkCDFEAS1REsxXKk9KZXzhHAfGXAHpFHFEJDllYnVJO2OmINy1TNlNq8zxMRM7Y3iz2b9WRzj3SqaETgPEScyoI1GCMgz6ZaaX0xTGpPY8kfVyWqGztn6lfmWAXR+/7lXVkhGaabt7B1rSvpxVYulY3esijiOZNt/vLvNcILeqdaH5tsXCdVf83MTgW13LczS6zsFnLVXtPhXCKqDea1jo25gLorD0SntMiqCoJgUZ3W/jQ58rF1J2iQKnZ+qWrG99BlGKQ+P4jiK5AVHXECm99al3LJnk2Nv15R86sz/yyA4yHA2xVuQ2XBRgLL/RO3Bej3cLovjeAO0YDkw2/4PklWFK0POsUQ3D7byKnydICrrfFHze9A4Xv0R8NWg74Zk5DTOPehnW28MAiH/Odx0ZZMOOzQkd65oPJX0HKIvYMTWihHnLteTH/Zy0wyMTQ7Bcu0dObVhrF7mGZ7DnIyx2lDWEuONnOni4VJ5Zheuqy3JhHdOLXMP69S7veIj1cY1IBICXwaAAK/xThINCxYoD6xjLEa3WJKXij20lGNAFDPXWWo472xefkdmvenGNs1Ay7C+CyONs4Y2Afa7w4NzDeD73dDPitu9YaZb7bVy17Iuu5/Q38voPcc54rEKkKVQAAAAASUVORK5CYII="); }
  100% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAACXBIWXMAAC4jAAAuIwF4pT92AAAASFBMVEVHcEzNCwvPCwvOCwvhDg7jDw/JCgr2EhLkDw/5EhLLCgr8ExP3EhLYDQ3KCgr8ExP5EhL5EhLoEBDaDQ3UDAzhDw/uERHMCwvHSygYAAAAEnRSTlMAuE306M0J/hx6gCzVZNORsJGzK14JAAAAZUlEQVRIx+3RNxKAMAxEUedMDr7/TTENqiwa6PbVf0YjSQgAAAAAAPhNjlN+r8LsmxiLX9iu+EfkOnuSwHTDSgwXmoNYbvBGTD9TO9Gq38na7DLpOiZ2j7uTTgT3cmg16uQ+eOsFChkG1voOuW4AAAAASUVORK5CYII="); } }

@keyframes blink { 0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; } }

@keyframes smoke { 0% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAJFBMVEVHcEwtr+Ytr+Ytr+Ytr+Zykactr+bmUA8tr+Ytr+Ytr+Ytr+bv0VdjAAAAC3RSTlMAgfPVHQpbIsWxOjeFFgAAAABkSURBVDjLY2AYBYMJBGATLKBMcBSMglEwCrACFsEFmGKzdysKK6IJMu8GAQFUQQ6w4BZUQTaw4GYHFEFWbbBoA6pSa7CgAooYF1hsUwKKIOfu3TuENotgWDSVBaPETFYMIMLfAHG7JCfoSYl7AAAAAElFTkSuQmCC"); }
  33% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAJ1BMVEVHcEwtr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Yh8XgvAAAADHRSTlMA85UperPXxgtcFz+iQX5pAAAA80lEQVQ4y2NgGAWjYBQMVbAAU4g78GAwuhhXzZkzZybAuRzGDUByIlDszBGYLrUzZ45PYFh6Bgw2QJTFgNjHnGQgggVgQdYzKCABLLgHVVABLKiDInasAYugMAMWQag75yCLHYU60wZZEOZ2dmyC3Ni0M8ggCR5sgArWYLGdwQfTQ2jWF0AFmbAJcgD9JBoIFXSAx42TNwNXDljsEGoMGYKduQFVkLnmzDHNBozI3LyAegmI2ckAQ4wr5oyImxCaIBuqT5BD/hSqICckvtHMlUEJHiiABIUAavqFRM4EFEFgqjvueMwLw6IILozgmSbUQIS/AYqV8NFPkBDiAAAAAElFTkSuQmCC"); }
  66% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAACXBIWXMAAC4jAAAuIwF4pT92AAAALVBMVEVHcEwtr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Zj/dLIAAAADnRSTlMA+NKulSEOezLC7VdmRRKEWMkAAAHBSURBVDjLtZS/SgNBEMaH6B2RmEqjYBEE7YSgjYhFCLYBCYggFuGiL6ASSyWljWJlYRFUFLEJwQeQgNpYSGwsA5co8UT2Gby9vb2b3VnEQr/yx+7Ov28W4Gell84vihpL5pivaxW+sEAnmFkNAT0HwQEWqoDgkYQZBPMS9lFsyVg3hkMRdGO4HEFWkmwlZqzGgb16eJ/VYLrOVPHrzxrjJ5NZHRZQeZHOACoEvgN0CPwyxGFvJtgDuCNwBKBsup4wBUoROIZbLrUFtCQxjn2M3GnRY/xq71W2HR1tRvOp4BSJOdhHDFO4lVJ2Q8JJk2VmTebCjkvQjPzRy3KwYeWjfcXvGzSOb/jAOjPavqRO3alH+B85hpWdcxd0xhNzW3Hz1vi9J1xVcinLvBZsirLa4lhQefchbPWxtmyo+x2yB+oG8mccA7wCAwwnorjeC9MsazamKfXJTyH2RQivbDTluiG66u+CbqW4HwCDJmj7Nd0soi0SSVX3wMrprudaD9Jsaz9tnX0WyYitA+fvDGRVa5Tl2fjOqAYTaiUYZlQ4HMCJkkobSntC5fS1jpbQbSrQ/xi87e4uCTRvk17cXv6m7m9HjNtgAiSFIgAAAABJRU5ErkJggg=="); }
  100% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAJFBMVEVHcEwtr+Ytr+Ytr+Ytr+Zykactr+bmUA8tr+Ytr+Ytr+Ytr+bv0VdjAAAAC3RSTlMAgfPVHQpbIsWxOjeFFgAAAABkSURBVDjLY2AYBYMJBGATLKBMcBSMglEwCrACFsEFmGKzdysKK6IJMu8GAQFUQQ6w4BZUQTaw4GYHFEFWbbBoA6pSa7CgAooYF1hsUwKKIOfu3TuENotgWDSVBaPETFYMIMLfAHG7JCfoSYl7AAAAAElFTkSuQmCC"); } }

@keyframes smoke_dark { 0% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAJFBMVEVHcEz///////////////////////////////////////////8Uel1nAAAAC3RSTlMA9XXTJI0QUsDkrlcwciIAAABXSURBVDjLY2AYBaNgFIyCUTAiAYuqA6bY6t1CyqJogsy7QSAAm6AIqiA7WHAnmrmzwaINqILWYEEBLNo3FqAIcu3evUNxsxqqbqbdu9vYEtBdXyxKjL8Bk78iHpMyeIEAAAAASUVORK5CYII="); }
  33% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAMFBMVEVHcEz///////////////////////////////////////////////////////////9EPuwCAAAAD3RSTlMAl7P3J9R368ULF0w3Zoeo/f6UAAAA+UlEQVQ4y2NgGAWjYBQMVbAAU4hb+bMKuhhL////ny/AuZwuE4Dk5f9A8A0qxCNq///HBYZF/8FgA0SZPoj99WI9RLABLMj0HwUEgAX3owoKgAXfo4h9nQAWlEcRLGHAIgixnOE+stgnqDP9kQVhbufAJsiDTTuDPZLg5wlQwX4stqO6XgCb9Q1QQUZsgpxAPxWpQwUTYNbzPMxh4IoHi31EjSF3sDMPYETbd+kJ6JHJdWYB9RIQS+IBDDEu/f9mqYZogqxgVz/AJmiFKsgLFvzugCpajxI8UAAJigLU9AuJnA0ogsBU9yP5axaGRZpcGMGztW4CEf4GAM5SLZvfdh/FAAAAAElFTkSuQmCC"); }
  66% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAACXBIWXMAAC4jAAAuIwF4pT92AAAANlBMVEVHcEz///////////////////////////////////////////////////////////////////+GUsxbAAAAEXRSTlMAlzPtBcgS+COsYtd2RIdTuNgIToQAAAGySURBVEjH1VZHcsQwDFPvsqX/fzYu2V3bIinOJIcEZwzFAoIS4gcwVVrtdZbJUDSV+wu64MzV9wusQ2hB9xssEjH2BxY4uSet+wDx2sADA47htgyBzlmA58dKZIfwTNBFkNbV+7kQVE3Rd5JXbadxvpv6DEc85ac8Cc5phN5rnIc7EqwMWk+cKs4Js3hxUy+TFzi8vTGZVwcnQe94jS6nWOK8KycK8WSWF5ViOcb6kPwCxkrDXoBqkBwXuK7F1Xxg1Y2LqznrDT4cmf4D+5Sw0PABVHD48wwXzJfdTYkRN3D3SdGuxNUQJjW9KSSWIP4FnGGQ6mavPqoJKzRU08KF8JpV0o+lfMtF5kP6dj+5d9+v8EHIRWpMr41a84xKClu7hQznJlfte+uCYPGuAiMssF2FF2bWh+4aNg3WuxvQ4/W4+ZZVL9XpuwniFVvOR2PgGXMSdYuaaszem0WW3d7v9iHxVfp87Hyr5H/y6FKWq5vtZFDK/S0rCUUqBmvfX19K9pLkZYZ9P2TlKc+9LlImiLcraHkJwvd0NBhPnI7T1mzxm6u5WR3NCDeb/pr1Yn5jrl/36Wixl/U5kQAAAABJRU5ErkJggg=="); }
  100% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAJFBMVEVHcEz///////////////////////////////////////////8Uel1nAAAAC3RSTlMA9XXTJI0QUsDkrlcwciIAAABXSURBVDjLY2AYBaNgFIyCUTAiAYuqA6bY6t1CyqJogsy7QSAAm6AIqiA7WHAnmrmzwaINqILWYEEBLNo3FqAIcu3evUNxsxqqbqbdu9vYEtBdXyxKjL8Bk78iHpMyeIEAAAAASUVORK5CYII="); } }

@keyframes smoke_alert { 0% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAIVBMVEVHcEzmUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA+n7+G1AAAACnRSTlMA89V2F7kvV5GJcwYlmgAAAFlJREFUOMtjYBgFo2AUjIJRMDJBchummOuqhcaKDWiCWquAYCU2wYUOqIJVIMFVaqiCjGDBpaiCTGDBhaiCWWBBcVTBqFWrgqWU0SyyAprngu54dsUJRHgbAJtCHzHstHStAAAAAElFTkSuQmCC"); }
  33% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAJ1BMVEVHcEzmUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA+bXBxUAAAADHRSTlMA7UYNG3pixDLarpRcYWISAAAA9UlEQVQ4y2NgGAWjYBQMVWCMKcQceWYqhmDimTNnShBcDwcg4QUUO3PSAaorS+bMwS0MbDIgwTMFEEFFMGdrDZg6cwgsxnQGBRwDC7KjCh4BC9qgCiaABX1QxE4zYFEJtZwRRVABIsiFLHYQ6hsmbIIMa5BFG6CCMciCAVBBHWTBCQxY3HSEAYv1h6CCHDJYBEFhd3I5VFAYHjfZ2xwYciDubECJIG5wZASjRVvgmTOlDRgR3OFAxRSUHcCAJbUczzqJZi8kkEWwCZ5G0z4HJXShIAc1eJAFj6EKQpJbMYoYB1Ak/OAitICYAzQPIyy8xBuI8DYAJtL0Rc3itaAAAAAASUVORK5CYII="); }
  66% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAMFBMVEVHcEzmUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA+8M/VoAAAAD3RSTlMA6gtNaRn2KcaC2DqTt6gWtpeYAAABxklEQVQ4y7XUPywDURwH8OdKimKQNJGItDGIDaNE0jKYlDN1QgSJiEStOhCJwVQMJBJhEOvVYjVoIrFUbCYSi01OKaE8d+/u/fm93xEDv/GTe713v9/3V0J+rprU0eR1BppRpE59QK2lrKYBFj2k3YqFfaMzCjZyrCh4yrEcl3jDUfnRkDC6IXBR4q14MCbxkkk622tR+KSxSWG52KkZO/6g47PyeaKeCKlD+Ck6ppRNSBVC+g3WB2FTEIaCXkQsHd3Wn+gYdTASg/bGJr8ErG3Ai0ZOeckOb/uoxDUxH9mTsonD4TZIlKW0UtQ+x5KCyxxfgsL1qKBoyoEa2ByKkcyhbapY7WErXI1B1+ZNiOEL2nIWJ/9S7ZiMXXqIsB/03ki7Vxxjw/Qva6Ri1D7nG7LiYQ8bT8HvyjuzCEo3QVn2VrsLYpLhBMocenLVQ5j6vIcg4GW8/xKVfwp5nIyoyKecUJHnoUNbbPx6HrzwQgCSY6e39z42i8YPFUz/DnYeDKiB2ZY2tm1aXs+gAWczfxcgoy9JAtLyOjwH7+c3ORqEFe24hXeId74EMYHWWizhFdwhZ7B79p12d4tOEVO//Phs/hff/QUdBRMMptyjSwAAAABJRU5ErkJggg=="); }
  100% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAIVBMVEVHcEzmUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA+n7+G1AAAACnRSTlMA89V2F7kvV5GJcwYlmgAAAFlJREFUOMtjYBgFo2AUjIJRMDJBchummOuqhcaKDWiCWquAYCU2wYUOqIJVIMFVaqiCjGDBpaiCTGDBhaiCWWBBcVTBqFWrgqWU0SyyAprngu54dsUJRHgbAJtCHzHstHStAAAAAElFTkSuQmCC"); } }

@keyframes smoke_alert_dark { 0% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAACXBIWXMAAC4jAAAuIwF4pT92AAAASFBMVEVHcEzNCwvPCwvOCwvhDg7jDw/JCgr2EhLkDw/5EhLLCgr8ExP3EhLYDQ3KCgr8ExP5EhL5EhLoEBDaDQ3UDAzhDw/uERHMCwvHSygYAAAAEnRSTlMAuE306M0J/hx6gCzVZNORsJGzK14JAAAAZUlEQVRIx+3RNxKAMAxEUedMDr7/TTENqiwa6PbVf0YjSQgAAAAAAPhNjlN+r8LsmxiLX9iu+EfkOnuSwHTDSgwXmoNYbvBGTD9TO9Gq38na7DLpOiZ2j7uTTgT3cmg16uQ+eOsFChkG1voOuW4AAAAASUVORK5CYII="); }
  33% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAWlBMVEVHcEzsEBDiDg7TDAzwEBDiDg7cDQ3nDw/bDQ3pEBD1ERHYDAzlDw/NCgrdDQ3JCgrNCwv7ExP3EhLvERHnDw/sEBD2EhLzERH5EhLKCgrwERHiDw/eDQ3PCwt6p2bpAAAAFHRSTlMAcCyZxTxkDUwa7oCnwunz39yP6YtSGQQAAAEaSURBVEjH7ZRJloMgEEAFARnj0MRAR+5/zVZ8KqQDusgiCz66KPwPiqGsqkKhUCgUCm9pmivS0BvTgzONcONB7P83BrdOhsxGH4kNQH4APsA5otwcoECjfDSjx4wDQFuwgncNh92xNIdk99CY4bEn2DxyHFvDctoQLPY3Tbja6ift4dCT9xQ8Ogh60avQXScajDygU4h44qSH4sv21O+b1vG9ks8UNPLgdM2r8G1aQBJNEbfXGmlIXZMlGRBpOF0a9WGJbMUJn4MS8LQmIYZf9iuhNbigkc45p4h0Hc5p1K1Y51p26ln/1LkBO7vi5lfk8psNt2rW0szENoCkPRVoKn320AutULaVNLfLyzra2WAn+8xkq/AnzvUPS3U3pA3BK1gAAAAASUVORK5CYII="); }
  66% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAUVBMVEVHcEzbDQ3lDw/0ERHjDg7WDAzUDAziDg7fDg7hDg72EhLqEBDdDQ3gDg7LCgrvERHyERH7EhLYDQ3qEBDUDAzQCwv2EhL4EhLbDQ3ICgrlDw/zwPagAAAAD3RSTlMAcFfrL0XEGwuLt9btpebFsOBAAAACBklEQVRIx9WW25KrIBBF5U6DmqBJlPz/hx40GgG5WDXzMGe3SamsbJCmMU3zEwmkCDFEAS1REsxXKk9KZXzhHAfGXAHpFHFEJDllYnVJO2OmINy1TNlNq8zxMRM7Y3iz2b9WRzj3SqaETgPEScyoI1GCMgz6ZaaX0xTGpPY8kfVyWqGztn6lfmWAXR+/7lXVkhGaabt7B1rSvpxVYulY3esijiOZNt/vLvNcILeqdaH5tsXCdVf83MTgW13LczS6zsFnLVXtPhXCKqDea1jo25gLorD0SntMiqCoJgUZ3W/jQ58rF1J2iQKnZ+qWrG99BlGKQ+P4jiK5AVHXECm99al3LJnk2Nv15R86sz/yyA4yHA2xVuQ2XBRgLL/RO3Bej3cLovjeAO0YDkw2/4PklWFK0POsUQ3D7byKnydICrrfFHze9A4Xv0R8NWg74Zk5DTOPehnW28MAiH/Odx0ZZMOOzQkd65oPJX0HKIvYMTWihHnLteTH/Zy0wyMTQ7Bcu0dObVhrF7mGZ7DnIyx2lDWEuONnOni4VJ5Zheuqy3JhHdOLXMP69S7veIj1cY1IBICXwaAAK/xThINCxYoD6xjLEa3WJKXij20lGNAFDPXWWo472xefkdmvenGNs1Ay7C+CyONs4Y2Afa7w4NzDeD73dDPitu9YaZb7bVy17Iuu5/Q38voPcc54rEKkKVQAAAAASUVORK5CYII="); }
  100% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAACXBIWXMAAC4jAAAuIwF4pT92AAAASFBMVEVHcEzNCwvPCwvOCwvhDg7jDw/JCgr2EhLkDw/5EhLLCgr8ExP3EhLYDQ3KCgr8ExP5EhL5EhLoEBDaDQ3UDAzhDw/uERHMCwvHSygYAAAAEnRSTlMAuE306M0J/hx6gCzVZNORsJGzK14JAAAAZUlEQVRIx+3RNxKAMAxEUedMDr7/TTENqiwa6PbVf0YjSQgAAAAAAPhNjlN+r8LsmxiLX9iu+EfkOnuSwHTDSgwXmoNYbvBGTD9TO9Gq38na7DLpOiZ2j7uTTgT3cmg16uQ+eOsFChkG1voOuW4AAAAASUVORK5CYII="); } }

@keyframes blink { 0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; } }

.car { width: 332px; height: 197px; position: absolute; top: 0; left: -100px; right: -100px; margin: 0 auto -60px auto; transform: scale(0.6); transform-origin: top center; }

.car * { position: absolute; }

.car-cnt { top: 67px; left: 24px; cursor: pointer; }

.car-door { display: none; top: 28px; left: 15px; width: 63px; height: 91px; background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD8AAABbBAMAAAA2FECgAAAACXBIWXMAAC4jAAAuIwF4pT92AAAALVBMVEVHcEwwruQwruQwruQwruQwruQwruQwruQwruQwruQwruQwruQwruQ5qtwwruRmSzwIAAAADnRSTlMAJM0SPVhs8LCFnMHhB4s1V/kAAAJCSURBVEjHrZY9TxtBEIbXwTgE2xGu6BBxH8vIFSmQI1lKkSiicdKhVBZNrEQJHTohRG2lQnIByi+ISBskyz8gQieloI0DtrFx3t/A3dnn24/ZHQrexh/33N7MO7OzJ8S9tNhuN44bjXq9VqsVygRwCUnDExNoygAm2wZQUgDcrmjX08C3fGWjEERQf7frASNfBZaBWWThhc2AeKbHeCP/fBEEmoQR3rODvnLDG2CsPKSFKwX401Ifkvdwpj7zSZBrVfIR+KDl9R7YU5IwEg8ySeLMYWJY9wpS4GsYG0DqQlqiqWUZaRW4TrLsmUDKw1H83UOXaIG3P+cscEAA6bmXGdMGo5ZVJ5CbF9uiLcInNVy1G6iOHbmBHxi4gVLiKak8KKdl04H/7n0JfKmEKsSqvZx+Vir+rP8cWhdiyQkERXjkuh4a8NgFHESlsGtSjlrWrq/TWmHgL4RZvjaAqJF2gO9TRxY87Xq0G/xm0nEdDXge/Xs6X0GfRMOVWbXjfZPRFujH7QDs/y4Wz8+1BeKFW7Yc//kM8NkSumqCA7gVDNCzjGE9BztQZh6RTKUOE4INOJPmMKltDihLe9dpU9QPhEYc0LedeGaWYdMSupJHFKVPQpr1lLryFGSAp7a5IA1aZylElgOWOSDDAYsckOayyHOAuGCMoltKqgXdEH8FU2/5hWKNaRh61MpnTJbpSfo8GAjG65F6JrkB0sqxenAyKzSZIEmnetb3UbNh6HNPeeXIMDESRgy1t9rDoqpfH8UD6g6qC1gUmPfpYQAAAABJRU5ErkJggg==") no-repeat center; }

.__dark .car-door { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD8AAABbBAMAAAA2FECgAAAACXBIWXMAAC4jAAAuIwF4pT92AAAALVBMVEVHcEz////////////////////////////////////////////////////////NXt0CAAAADnRSTlMAIc0QvC+h8GVDVuF3iZrQmDAAAAI2SURBVEjHrZa9S1tRGMZPjbE2WkkotlvRKI6SksFFihXnUIdQupSsXUQR13DBxUmk0EEK4qZkEHdBnJxEBFcVrfnQRJ+/oTc38fiec9573g4+0z33/jjn/T5Xqf9S6vLi5GRtrVLZ/F2cTzPAFIga5y6wTgG0th1g0gBQ/Wp9fwMcqfynTPH7ZmX3uAw8WkAfQCybDolRE3iNKl2+Dw01zdjDnbH+A9SNFwu4NdaJgnVIGTPmmYOhr8STVNsJUzvAveGE43joSaBXA2g5ofsGYvgPy+a2koeAdvXU8jLSB2JFATcukCzj57OX+0wJbH3RLOwwdF7rp343DE4uN7zAAJDzAp+ZOJnmmtXg6tSpMEsLXCDNkr73A+AiTSMGXPv7EljOt5Xparg433l4l4+At/BpJIq0R2ESenzfH6K28qgUpSJerVxUsvFa6eQqDHUibP7MLwcIutOl1G3JsvW93k2m7qGCBYxFb6/0DvYkaqSfgKauXkPNp3IADg6y2fE5awOc8Qdr/VUCsCQBgQBUY6asVk0CSgLQSCu/Dc9TKQa4kYAZCQhIa7LKCQCZCFcs8EjHA6emBNTodcPplo4oTouKzHpO+3QKCsBQ3Fwgg9abCtUr7dAn7TAoASnpiKQEJCRAHQqB4muO5IKvmGsl5Jv+UHz0t0XMqKV3TK9Qk/x9cKeEWD8Q4JXQF3wo6+bFKeywLhjJFn5NCZEasf4wuNtO0X8Ur41MIBqBeTvPZk1NrKoX1D9SaFCZMrW6uQAAAABJRU5ErkJggg==") no-repeat center; }

.__alarm_door .car-door { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD8AAABbBAMAAAA2FECgAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAMFBMVEVHcEzmUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/PXzbmUA+T44FsAAAAD3RSTlMAJM0RuztTZKHu+nfgiQcp5wYsAAACV0lEQVRIx62Wv09TURTHrwIVBV7aODFRGwcnremicQANO2XooIvEoSbGxJc4MNLJFY3RyeRhDOJicCRhgD+ARBNGY+jqYgIWbJ/Fr7evfbf3x3n3OPhNmr7bfnrOvd9z77kV4p+U+/Z1e3t5uV6v1WqFPAHchKbOvgus6AC6Sw5wzQBwZGcZAz4FlesFOYP6w61N4GPTBMYRD37zQ75uRcAlE/iOljYKbsiJmtN4gl/G+DHQNpKs4p0BjCyYSYIIc2bOCZmkqvkoF2Gt6xHwWl8EnIVHiEM1mkTXse4usKEGM2g7wBlphlrqjrXKRNPAevq8gENBhIifpc8Rdl0guHdbsbBt6C9EeXnOtcGuJapeYBIoe4FZwier2C0/sINTP7BKGWlu6WPv98Em5bRuOvDHC0gjX1Z6KqSqLfbfL1Z6bjenYCvWHouJ09mKZRHO+oDfMsd5H9BISpGtbjnZstl61a8VNpojvVU+cIBw0F0agyMZWd+3B8VEqLa3qavJpwcqgt2JOvkUeK9MN3SSbgfgzV6pdHneCoAvdOJhr2sywAvBACE9daWWYCK8FUyEBgPEeSbFB8FEGB6FjAhzHBBqR5OcY5kBjoYn64AETvX2QOmEAw71DkTp5xC4TwJrQuv1lHb1LsgAF0igaDRabynEKBdhnIswwUXIcRHGuAgBB4jPjFH0nnsumB2zJph6a+Wmy6nfEGSr1e+YUWZPiikK0K+xXFab1+4k77mgrWybFycTYYWZZDDDGEU6VbT+YTiqWlerd46EEZ3QvJ3vlExdeSr+o/4Cf+irdV7jl80AAAAASUVORK5CYII=") no-repeat center; }

.__dark .__alarm_door .car-door { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD8AAABbCAMAAADz5K2hAAAACXBIWXMAAC4jAAAuIwF4pT92AAAASFBMVEVHcEzpDw/hDg72ERHtEBDtEBDvEBDtEBDqEBDJCgriDg7sEBDOCwvxERHJCgrrEBDcDQ3XDAzSDAzhDg7OCwvnDw/7EhL0ERF0biXKAAAADnRSTlMAtJzuLX5FGl/LyODjz/ZLHkQAAAKiSURBVFjDtViLlqsgDBQEob6xtfz/n94AbrdKkIh7B45thcljRCOtqr+Dlht0QAMQAKVo/PqdQi0JdPk+Qa2z/OF9ikGc0xs3ycWplBLK5Q3pOxkk2xI7T4K7KbhSStb5ENwUlhpUPKeCduMnIjUhBJ4aZ2+bCn8LgYUcVDJ8y3IX2LocBK6+zQkMOTonb9tg6luAyC2RprbAt4hMHQx0+TUqwIBFdBbOLK9IBmBmFIF0ZnVFM+AsHDRgLn3abepTYAd+TUs/iGiZitJ3NqnPmfgyaceX5U8un35Tzu/o8qG3BrCnrtx9Y6cL8iE3Fri/Ix93/nU5f5jsNN2Qf5rAQLn8YnK4Ufdc+LXaQey6r4Lfpxx+5Z+KMfjVW0xfvehtMT+smbqUHpasmtay1gUJxVqI7TnShF86lO6Aps2Rp/VnwWv/+/DwVnXOwIcgP+53j6QMffhdPusT2rF4DP5sqs1fVZQ7c8/n/v7TMCmN3WzuLa5rBxhaAGMM5IOT6f4dLXt+MMNQiNAjSW+rPT+c3iM68eVmV0Ha51Xsr9Vlflvd44uIP19px5XSzgec02cV86M5Jz16y4n8+2nJY1T92XwFcZm8xo/LHIezxvftw5w1hfB/aT+HVDctUr2NgYFPn81ZlzjfYzZm/zU+GqTKa3MB4iYfqfLNBfqClX+zkFuPvb0ZMh3lVwvZ/9Ji/H4h44G+/dL5qH9+07+8ydfL8iI2lC/IdJxfvahI8Hui/9fS49sXcgA4X5L5L/wF2A+NhP5C39IFDI0kAyO+RR+Df0LDdxmPEUChJ/gyDBI6vkvSIxX4Lk1t1nehRl/g65j4j6Gn+k/w+b346QIkdpmCyk/9xUMU4JHcAtP4yU2uvqNeWAFZ9GdbdPbIgN/Y4P8//AMNWMmFW3XPSwAAAABJRU5ErkJggg==") no-repeat center; }

.__door .car-door { display: block; }

.car-body { top: 19px; left: 63px; background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJ4AAABxBAMAAADWuQcfAAAAKlBMVEVHcEwwruQwruQwruQwruQwruQwruQwruQwruQwruQwruQwruQwruQwruRsx2DmAAAADXRSTlMAh1QQbCa646byPdCXl62w6wAABYNJREFUaN7tWetrXEUU3+Tu5tkP2bTWCA2kae2HwsIlNdS2Ctt4kVQtrNZafEGUFoWwUC3NKrqQakn90IVqsTHgwpKqaCRQFVdqWDCgKCUBE7PvzP/izJ07d+/jzOt+1fOhoffO/O7M+Z3zO2dmY7H/jdnkyrJlJQ9sfILtbfLPxnrSmjr69Tl9KOOrkdk84tli+dqjWnDPZ5HM3jukDnckOHmJWOBZ8yFVuO/p+PLNfdhZ54+Z7otjk+dXxq3kwi8Uca8a3BNk7BfPmIIhiYPEIfUxFbhEBa/tgZSwZzHglgreBQynspNvMOC8wvJwmHys5JczCO3KRx1HaEcxRrFj0tJRWdQcU4yDHoRasjFdCmM8366bkiGvIzSmjHdKzkhFxccud0W0LR4RR+gnjTxPyTaM2S1p4GFGhoQDNnW2a2+4KnyP0BUtYRtFDdHrPpUIDfgnI4yWtp6Od4sjpiDjH4ivqtB99zTxUiIH7tFJDmqDCAERmDh84Br26wld99kOxBH42F/rHj03ni5ibdwm7O/o4sXy6DYRBoTaTNONR+zqUosZ9jtNO4vXMEDr06+uStj1jCTvkDbeCZzCcaeEpp0co2b2ioOTy2G6y0GgoVN0/pd5XJw8vBhrlvocBNv7Biv4pdjZaoSuKfszkRnbqJYwvDuZgfkIeN+acdY5bTlJ5thn0do6wwX4nGryW8jHj66dYtN/YGyenL7v4UfX6PLmhn2x8cJInoR0BCPBfOf3u5CWatUOTw0Bw3YVP5+JgMebV4nowCzVEqDRQHrFzdVgBFXhVVsTzCj5C23YoDEeRV/czA2yi+2yNl6Kil0mJIu2tSLRgUJdT8IRrUYkOsITj7Mc1CWkC879bFRJ6GcTW+BXItRzx3whuIrAz6jT4Q9BxoY+IYnO+XDL1zS4p0YzGh3I26qMep7qEdLrmXnFq4gRCUl5ZtZCwYdg6RG2f8DWyHYvHrxBH7Z1HOg0Gs03rIfxn9sdji7hvxN/wtIjsO/sGRdL9LTZcAuAw/WLJJpq6j1MnMTZl4fcc26JBTPrCxJk2bXhcTV7jmjmmwz8ZbY13ynxCNKy+l6vL1uO+7ycvqYD137Kx3XDCXFfzL2kDuc/eaeo2vUGm/pRZbyrwVxJ0xO0yc1JsfMywXkzduVoQ0H/oyiuT24CqYSPDrfs9mgXKMWS1migGI58g/YXlVDxHETyY+so0D3R038+JAFxhcKOy3g9LA47dvvcAkRX1rn1AFJeIXlrADUjLz+I9AE9RpYwkQC6tKwSXis8DS85sTB7FeiIM/L9hpZxo3yd22HLzsGDOs1nVl6W+nmlemCxfHPf0XNBfn+T4D0Z4Nd45XByYXbOLW5ND+qrCqq/6tYfjHSa3dDWfBUehyhGHZ8uKjSWpFC2h8cxUtFfMhOwdvyjkG9h2/UcV/3WklMG48VgPNnFBHy5v+U5noe/JDqj8lcBf0mmf3y8ClxqlBqNoG1zPStJ4D4+ixy8tHLfF8ArwK/mZdfKkFX55faech/psb87Jy29BNmEJ13mL31bvS/1O6kf6Qc0J5xtEns4rZPkFhG0Ej80hSfDPYifBLxvjYmrB3dPHAEUKjSHw4YIryq9YoI5BLmaW5+6K8Bbtkbuc+QPENT6dZVfUCf2F2G84ON3iLRMLlvW6SRsljW1QtifKICiHhDUdzv3dyIj93OJApRTfsGqmfR6W6F9/oO2qcEiVgjoyhnl/v5SQGeq3qscFsbdG9jkvyd/SIaZfl29FbiM6KRZd0UC96kJJN4Ma208TmE9EY9cauzXBH/yD7kXlqp1Ulw3S2Hx0bxRNCCJq2j0LaI+hkn6hZAL1A2aa+xfy+XeX1rKfVB+oAkXM6bXyNTFXG7to9h/0P4F7pMKSVbaG80AAAAASUVORK5CYII=") no-repeat center; width: 158px; height: 113px; background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJ4AAABxBAMAAADWuQcfAAAAKlBMVEVHcEwwruQwruQwruQwruQwruQwruQwruQwruQwruQwruQwruQwruQwruRsx2DmAAAADXRSTlMAh1QQbCa646byPdCXl62w6wAABYNJREFUaN7tWetrXEUU3+Tu5tkP2bTWCA2kae2HwsIlNdS2Ctt4kVQtrNZafEGUFoWwUC3NKrqQakn90IVqsTHgwpKqaCRQFVdqWDCgKCUBE7PvzP/izJ07d+/jzOt+1fOhoffO/O7M+Z3zO2dmY7H/jdnkyrJlJQ9sfILtbfLPxnrSmjr69Tl9KOOrkdk84tli+dqjWnDPZ5HM3jukDnckOHmJWOBZ8yFVuO/p+PLNfdhZ54+Z7otjk+dXxq3kwi8Uca8a3BNk7BfPmIIhiYPEIfUxFbhEBa/tgZSwZzHglgreBQynspNvMOC8wvJwmHys5JczCO3KRx1HaEcxRrFj0tJRWdQcU4yDHoRasjFdCmM8366bkiGvIzSmjHdKzkhFxccud0W0LR4RR+gnjTxPyTaM2S1p4GFGhoQDNnW2a2+4KnyP0BUtYRtFDdHrPpUIDfgnI4yWtp6Od4sjpiDjH4ivqtB99zTxUiIH7tFJDmqDCAERmDh84Br26wld99kOxBH42F/rHj03ni5ibdwm7O/o4sXy6DYRBoTaTNONR+zqUosZ9jtNO4vXMEDr06+uStj1jCTvkDbeCZzCcaeEpp0co2b2ioOTy2G6y0GgoVN0/pd5XJw8vBhrlvocBNv7Biv4pdjZaoSuKfszkRnbqJYwvDuZgfkIeN+acdY5bTlJ5thn0do6wwX4nGryW8jHj66dYtN/YGyenL7v4UfX6PLmhn2x8cJInoR0BCPBfOf3u5CWatUOTw0Bw3YVP5+JgMebV4nowCzVEqDRQHrFzdVgBFXhVVsTzCj5C23YoDEeRV/czA2yi+2yNl6Kil0mJIu2tSLRgUJdT8IRrUYkOsITj7Mc1CWkC879bFRJ6GcTW+BXItRzx3whuIrAz6jT4Q9BxoY+IYnO+XDL1zS4p0YzGh3I26qMep7qEdLrmXnFq4gRCUl5ZtZCwYdg6RG2f8DWyHYvHrxBH7Z1HOg0Gs03rIfxn9sdji7hvxN/wtIjsO/sGRdL9LTZcAuAw/WLJJpq6j1MnMTZl4fcc26JBTPrCxJk2bXhcTV7jmjmmwz8ZbY13ynxCNKy+l6vL1uO+7ycvqYD137Kx3XDCXFfzL2kDuc/eaeo2vUGm/pRZbyrwVxJ0xO0yc1JsfMywXkzduVoQ0H/oyiuT24CqYSPDrfs9mgXKMWS1migGI58g/YXlVDxHETyY+so0D3R038+JAFxhcKOy3g9LA47dvvcAkRX1rn1AFJeIXlrADUjLz+I9AE9RpYwkQC6tKwSXis8DS85sTB7FeiIM/L9hpZxo3yd22HLzsGDOs1nVl6W+nmlemCxfHPf0XNBfn+T4D0Z4Nd45XByYXbOLW5ND+qrCqq/6tYfjHSa3dDWfBUehyhGHZ8uKjSWpFC2h8cxUtFfMhOwdvyjkG9h2/UcV/3WklMG48VgPNnFBHy5v+U5noe/JDqj8lcBf0mmf3y8ClxqlBqNoG1zPStJ4D4+ixy8tHLfF8ArwK/mZdfKkFX55faech/psb87Jy29BNmEJ13mL31bvS/1O6kf6Qc0J5xtEns4rZPkFhG0Ej80hSfDPYifBLxvjYmrB3dPHAEUKjSHw4YIryq9YoI5BLmaW5+6K8Bbtkbuc+QPENT6dZVfUCf2F2G84ON3iLRMLlvW6SRsljW1QtifKICiHhDUdzv3dyIj93OJApRTfsGqmfR6W6F9/oO2qcEiVgjoyhnl/v5SQGeq3qscFsbdG9jkvyd/SIaZfl29FbiM6KRZd0UC96kJJN4Ma208TmE9EY9cauzXBH/yD7kXlqp1Ulw3S2Hx0bxRNCCJq2j0LaI+hkn6hZAL1A2aa+xfy+XeX1rKfVB+oAkXM6bXyNTFXG7to9h/0P4F7pMKSVbaG80AAAAASUVORK5CYII=") no-repeat center; }

.__dark .car-body { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJ4AAABxCAMAAAATSeoeAAAANlBMVEVHcEz///////////////////////////////////////////////////////////////////+GUsxbAAAAEXRSTlMAZXjEsA7uiVWd+eA4HSlH03x5N0cAAAWoSURBVHja7VtHsuUgDHwkk4Pvf9lxjtiACX8zmsVU/fIzQkitloR/v//yX85CjFKWAQAhpZRzjq8y/I1TCiEEjFllNGmilQIUI9f1VxHLv377//aEdJhDpqvpZiDyrZsokrMalmQosK7oNgk82dHSNlTu+HqHMKezVymtNfGZgxCi9eqhlGMkD6YXtKQFCd8040B9frNmdHMPaYtppxfTCa7ydwpWJ6GlDnb2pQ4WOhC1KMjLBOysHS7ozqArZj8ip3MFRSNNzwaE+W/Ck3a2MBKQ+bXZvgyraDfIZD+Z6c5mAgJQXrsfmeAAF9gj/9UQPcVH1rmA8Q2uEtsAucdLuiL++xp1GejCS6K753gnAmY+x0WJ4ArCAs4yPqin3QL5JsN4rir7Zhnmw9mBHwlc5rPxUOXixX7GVTr+ktUursbcIeLIkGED6+ZU7Zjnams3ex9dmCofSwQvGycArxXMTABg7bBdZAzejmx+OIXjlZUTeiwR0Wq8rkHxDFfip47FnFM39rBXYuuvaH3tfkQs2A/O1Sa4JK+DkNnmQjdQb14cLKF4qDX3xa/Fv55LR95CuwnAOnu30cb0ybWMHw8eit40UW+Af6ePkdFfC7mr9To0PG/bGG+ICT44E5TiyXo3u87WbtmPw/eWzeHsdtDzRU597dxVN0cvnqUt5McGmTDt1DuensSUqZe8huUOzo2cb/X4uP4S3+O3iaCk41qzC25rvNj1Nj9thnuLRLE36AHG2lljcb4Ix1N79Iom3f5Drg0fL5Fe4K6IeV0K2J4SiGygHnhKFcGHq9dpvxsTeO/nKPHEGuoHRtj9To7XJjho/0hUnhGoXXDcqMhzQwze50u1K0nmGbo9lBDWN9BTLQPjjYto76SubnBo70iQxm6kdnBQ/8jSRj9ZlzU/jFY7HUK8JsHBnia+OIR4TTLH8wQbeI9WYAgglwl5pli67QWiAFDpO955+LNNHTU7qliLNR+pG4Yrgi3TSnxPF6eANnAzPapCm4HYJuynyw/LgFZd2f4N4vRq6h6NFwdKCliPR+AbhZ/1QxfjeQcYNnT/Ik/8dzLA2XzmLUINF7WUc4C8RDQ+he1z1W1wHcs9A7495SsZyg6wgnbSBBrOq0YmnFtpeduZ4Hr4YBsUWZoPDvO1pUvUocHOwtmuOxRnPK7RkInRGxKjGKKl9ziBcekxd5QAIxO52B+SMf0NUOZmERH94dwCzjTHRtR2TCFuj+I4ONpsoePW7Q7ukN0IBVHq8d0uJm7bhdQLcki8haHmGDlpon6Qf7g4zhhcIoxB8raz57uuzCE8HG5210CkFgiqGw3JKWTWPO9KiyJlrw5Vz8QoNt81dRKfEsJ+bXUgn8qcAHi9n5k7TVC+3g3Ryt6vvy6hYZ7T9qDqdMEWbJwvtyG5VT9ueK9PpZt6OolpZCa1JOozuQBJUk+VwJVIoXtSi5XMnoZMV0+k/+QzI0gyBUzfUV7o2g8n5ZJIeBG6Fycs0IjxiWkWGUtuwe1iQ35ACd4ng1HRXu2j6A9VYk47kiWtJLyDqop5I+2cpH9uFBVPGWQvVvB7A7q486WB8sZqcCPnS3O9DcJgI+fjXyIjeVesjeuhp5lqpMt+ZcqpyySi5dfrS4ldTJ4aUUJOZYj9WAZOBQVGsTixU7eoTxszvp+7pDYb9bElDE3edt2gOdZ5AMLpw9cEGb+EHeyuVsMThkW0eu9EQk6hSizkLg3AHxyEzv1VzWMB4pXxYTJdui46PpDT1XIrwmwvhJdjkoBdX1ywCZARHcWxB/rJ+CIlBhzd+jJKXr2qi6tQdNEZVnf+MJdH1VxERJc+BiTG7Cl+LYkujWgUoNe9QWrj2hGsUtn9nQG6uKn+H1yz8TQotfwL4w2uLEMpYzEzRcjJQZZv96V0CNH6d4MHwJ/WXVcdBCHc9kr8f/kb+QcT8WT4CFErvgAAAABJRU5ErkJggg==") no-repeat center; }

.car-hood { left: 90px; top: 53px; width: 103px; height: 23px; background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGcAAAAXBAMAAADkTUwLAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAJFBMVEVHcEwwruQwruQwruQwruQwruQwruQwruQwruQwruQwruQwruScvjSdAAAAC3RSTlMAvHdMZuEzpyCJD67SnpcAAAC8SURBVDjLY2CgFKzoSEs2NjZxcVECAk0QoeLi4mxsnJbRsQpFIVdbsonTzHJBwdDo3XhBaKigeOUkF+O0LgYGlt2kgu1Am6JJ1bQN6L7ZpGoSAGrqJlWTAVATO4l6toKCj41ETZvAgU5iSOwAa/ImTVMBWNNq0sOB1JDYCklIzCRp2glNftGkhwMDgzap6YHkkDCAamInPRxIC4md8IwYTXo4MDBYE69pAlwTE9F6NiIVFJmFgkQBSUjYAQCp9Kmrf9xLOwAAAABJRU5ErkJggg==") no-repeat center; }

.__dark .car-hood { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGcAAAAXBAMAAADkTUwLAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAMFBMVEVHcEz///////////////////////////////////////////////////////////9EPuwCAAAAD3RSTlMAu3dnMyBFVInfrg/yzp+K0No8AAAAvUlEQVQ4y2NgoBRsDXVxSysvNjZWAgINEKFsbFxelubiGrobRSF3iFu5Uccrwbszz/zHB/6cnHtR6kWTcZlLNAMD839SwS+gTedJ1fQF6L5+UjUJADXFk6qpAKiJj0Q9P0HBx0Kipk/gQL9PmqavYE36pGlaANa0hzRNCWBNXKSHAwMDG0mafkCT33zSw4HEkBCAatpPanogNSR+wrIUGxnhQFJIfIVryideUwNcExMpuRYOPBYKEgXWQcIOADVpn8V7cKY0AAAAAElFTkSuQmCC") no-repeat center; }

.__alarm_hood .car-hood { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGcAAAAXBAMAAADkTUwLAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAJFBMVEVHcEzlUiXlUiXlUiXlUiXlUiXlUiXlUiXlUiXlUiXlUiXlUiWJMPeLAAAAC3RSTlMARO7BpdoXcDCGU+ao7mgAAAC4SURBVDjLY2AgG7BlNEotL585xcXZ2NQ0VAkItHcDwSYgQzXU2NjYxWXm9PJVgh1pUPVcLsahSruJBqrBJu4MDBy7SQXbgVZZk6pJAahpNamaJgA1sZKqKQGoiZ1EPVvAwa1NmqaN4ED3Jk1TAFiTNOnhQHJIJIA1kRYSm6EJjyRNu6DJz5vU9EBySEyAamIlPRxIC4nN8CxIRjiQFBIBcE2pROvZ1IAoIoi2ygK5YGkUJAq0QZQDADRUsHOYz6ppAAAAAElFTkSuQmCC") no-repeat center; }

.__dark .__alarm_hood .car-hood { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGcAAAAXCAMAAAAhvaEKAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAS1BMVEVHcEz7EhLmDw/8EhLgDg7xERHuEBDLCgr8ExP3EhL7EhLMCwv8ExPiDg72EhLxERHoDw/7EhLhDg7bDQ3VDAzPCwvKCwvsEBDHCgp91w1uAAAADnRSTlMAYC/IFn6eRO+y3tXU4MjJCsUAAADlSURBVEjHvZZbG4MgCIZTQ0LL2tbp///Ssc2atrYr2dtF2QN8HRCoqv9T11ojKgYArLVEZMgY0zrnmshlZ7vjXMs2ho2JfdjzEQBRa11n0RXH41BpiHI0/BCsD6yjeRn42Anf3UJyjj4hLs7N4pV6vJAJ0jTPD4c/LPoiOvD6Q64XJiaEklVZaMvnYREFt9S2gyBLt28hlNQZ4L1Xu6sgSVkAQRlKK9tNDkyLnBWT6bJiiqMUkPcEL6MyjXlzqGASYaZjj5PRmfDYTO0sgf9s2l5AZtUn04FdS+P1+RzCU0hBsjnkDnk6iHMtFnodAAAAAElFTkSuQmCC") no-repeat center; }

.__hood .car-hood { animation: blink 1.2s linear infinite; }

.car-trunk { display: none; width: 128px; height: 32px; left: 78px; top: 0; background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAAAgBAMAAAAoDG0WAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAMFBMVEVHcEwwruQwruQwruQwruQwruQwruQwruQwruQwruQwruQwruQwruQwruQwruQwruRjQmgpAAAAD3RSTlMAMyMOhWAZmN7IS3Su9u2+QIL7AAABtklEQVRIx2NgoA1gTpJaGr3bxb285ni5i/furVGCysRrTq2Z2fcfE/x9MfPIAmL05/zHDX4EENbP1o/HgP+/8WtOXO1+svc/XvBiTnUU9uDQCjnZ/58IcB9kyvFdwqg2h1QSpRkZvEQyhO3+f7LAF7gL/Mkz4BlUOxODHXkGOLBBDOBM4CZL/z8DdkjC0i9gfk+OAb8Zcg9AQuAaeYFwmcH/MtiA/i8M+WQFAfP9ryD9jEDP8JBjgALL/z8gA1j+/9/ARYb+n8DI+2sANIDj///HDP2kG/CVYf///6DcKQ8KT39ywhBo6wSgAfXAbA4yhVRwgBVIfAMaAEoDCzjg4jdLooSUjY2TlEBAEAzAzGSgmOJqH4RfAzgh5QM4/A6wQ0XfBBEqLJfMhypNkAeHJANY6zdWSLFXSESRxxYJjYR6cFwygB3/lQ1c4gUTV+qKg7L/d0jMBUAM+APiEVNiQoAOUMsvJkhIMIAd/wPknmLiS/4ImK9/AFNSIiigGeL/XyWh3mGb/7+BDaRPAC4k/3cBKTWXzf8DaCK8v0ir+uY7oIlwOpBWeeahO5jbgDQDuBOoVY8DADI/E51Ys7QqAAAAAElFTkSuQmCC") no-repeat center; }

.__dark .car-trunk { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAAAgCAMAAADt/IAXAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAOVBMVEVHcEz///////////////////////////////////////////////////////////////////////99PJZNAAAAEnRSTlMAi3xNGd9gNCMPmvbLBO2rb7pWKkV1AAABt0lEQVRYw9VX2XLDIAw0IMRtjv//2MoHManTJk0xne5DBjue2UVaCTRN/woGtBICMXHOGWPW2hjph5b0IiEKpbQJ/XkBbfZezuU1uFn6HLnopQRieQ9S9OGX5W3w92kDKJEYRV668gvMMkfGUWjzMrEWyKKXpTdmn20SynyzY+Q29yc+C4nskRBwZSjYKQRsKP8M9+yaesw8UgCVB7RtwpMgPjIAZAHbdAm9pGRkCJYAuHgI4MXBSBc4s7C5oxLk6koYWQKGqg4rv9qzEkcJ0Jvj4l0F8k3ICOTdcLccrO1vDvvielDoU13UDBDSqEqkjQdZQ7HA7qd3GJQDSj3uy7Ufhlr/4mEOnLd0nCqtzQLQB1SD4y3U75bjPMrHGfDlFvVpEo037KeGFVH/9F5Vvw/bAhT3nwTAEWnfZGD9B9utW9XjUkdCAFsNvm15emrDjk0v8sn0vNYq65ou1FK2T/H2ILH7zVrnm9X0nR/2klxpaz6suWKoEPKUaGk2n1Rs9eHwmqkmgN92eRCeTUb+dOKywSrk5gD44hNXruOnI8A/HRU8u3S4hPnZ/ri5VMCU4I/n65PtPgA1nJTrTSLb0wAAAABJRU5ErkJggg==") no-repeat center; }

.__alarm_trunk .car-trunk { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAAAgBAMAAAAoDG0WAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAMFBMVEVHcEzmUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA+8M/VoAAAAD3RSTlMAq5i6Jj8R9HXhxlRhidXV60iOAAABqElEQVRIx2NgwAPSUlyAwC2BgUSQGn3ikqDVy/L/MPC9ctZioRs9Wx2I0s6i+R8X+G5DjAH9//GAJ4R0s7kewqf//7/uENwh4npCcWX9f8Jglmx3GKbms1Lz/5MA6oS63ZDcrUySZhiokoGbsP4/WeAr3IB48gwwgGrnYGAmz4AAbkjKYt/ASpb+zwx8DWAD9i8gLxC+Mux/ADZAHsgixwCgvV/AkVj/i4GTHAOAPv8LMoAHGBocZOj/Dgz7nyADgFFgwFZPugF/QbEfADQg////LwzypBsA1qQAyb4fyQnFByxAYgI0HTukI+c2QSUwEAQBYTApBBERfo6k7AITJDWzgDnwtDixFW8JmLLXHJ4OQZZ+AiZkEGcCNBo+HyFYYLHFzodGwnkwycAFTlSQxDyDqPKXFRziHxnswe6ApKG/DKB4nE1kqc2iD1T8AxL1ByA58RfIuAqiy32W9XBHBwCLI2NjY0NgZP5zIL7mAAZZATdQnzGiUNr/34yUumc7MCuhgvzPJFVgrOA0iAw4p5FW/fUfQBNgDCDNAGb0EGMhsQImVT1uAAAPYf4/jb8b1AAAAABJRU5ErkJggg==") no-repeat center; }

.__dark .__alarm_trunk .car-trunk { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAAAgCAMAAADt/IAXAAAACXBIWXMAAC4jAAAuIwF4pT92AAAASFBMVEVHcEzhDg7eDg7WDAziDg7nDw/iDg7RCwvYDAzXDAzwERH4EhL1ERH4EhL0ERHcDQ3gDg7vERHkDw/rEBD5EhLXDAzQCwvoEBBEKJNPAAAADnRSTlMAKhLgQFt4vKuYx92xlOTY0T4AAAHISURBVFjD1VcJcoQgEBQYTvGMx/9/mgFZ1NWKiStUpa1VnMXpoRstKIr/AQrAuagqa60py7oeTlCXpTHWVpUQnAN5kJ1U5XADhj/EL4a7KD+WgRLg1W1+NEWgF/SG5oB+o9m1M7v+AEPtHy+NrbAU+jvihbdOga50hZxLQpG4e/ULpy4cMRBO/tzV7/FuS7XNsLmE5409TlDTZQUcCoCs/Pb9TcOf/UqB7jyMAvDtOzqjJfAI4XxxvwSdAEas/Hw2LjJnAwoAnjNA9b3TpM+E1g+376MHtO17F2O5KnCG4yV6wFsESiDaLJgZcsq27dmrAOnCEpVo8lSg8ZvbhkF7BxqHFh1RTRZEJh0+AktYoRdZ+FF5ElvegXEBLeh4DiaV0huoc+hdH8nYeTace9o3mtF7QDZ/yAO1EkA/WE5wfUiJrHQKTe+BGMfJH2zT9ofkjyzsQLNdWrR6XNs46ukFKCC2Jyboc6tKUGtitafEz0+8Qw8iPX96Wa1XFrpWw3cKyHgjEqzsSchNtjqDr00GoDjCD5+k2Vz45G4KRMKjzq44SVNtb2CR+UerUvL7CvRFF8YS8jsXrma3grSbTHk1v0ha/uT5/45v7E6Pln/PLqAAAAAASUVORK5CYII=") no-repeat center; }

.__trunk .car-trunk { display: block; }

.car-frontlight-left, .car-frontlight-right { width: 27px; height: 15px; left: 73px; top: 79px; background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAPCAMAAAAiTUTqAAAAM1BMVEVHcEwwruQwruQwruQwruQwruQwruQwruQwruQwruQwruQwruQwruQwruQwruQwruQwruROozebAAAAEHRSTlMAkLGEChVx5tT0qVBfOsCcODNd8wAAAGlJREFUGNOFkVkOgDAIBbtC6aLc/7QqNabaEud3WMLDmE4IRgESM2ZoswmOb8jV+HaZB8iVQVX+gP5pTjxB0FXjFVacXzouykhZeu3EtZOppLj048DmLeFc4YfgYisV/O7OQrlfyz7KVw4zMQ7aHUkYlAAAAABJRU5ErkJggg==") no-repeat center; }

.__dark .car-frontlight-left, .__dark .car-frontlight-right { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAPCAMAAAAiTUTqAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAOVBMVEVHcEz///////////////////////////////////////////////////////////////////////99PJZNAAAAEnRSTlMA17GTChWE5vQDc6lQOmbNXMC3uH0rAAAAcElEQVQY04WRWRKAIAhA3RG3kvsftlFrsqTpffDzWAYQYmCM4MEiiSCGjIsyik68KvbpIk14labqnV6Au4pR0oIPw2Xi0N051lFqbuMdtJnAu97Vfzj544KOdYM1w02HszntwWlVJfT959viHdH2rxy8+RDi+uiXigAAAABJRU5ErkJggg==") no-repeat center; }

.__alarm .car-frontlight-left, .__alarm .car-frontlight-right { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAPBAMAAADnvanrAAAAMFBMVEVHcEzmUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA+8M/VoAAAAD3RSTlMA5vTWChWEcbOTqlBfOsP61wQeAAAAbklEQVQI12NgYGBgcWBAAuz2H5dfgPNY+v////9pTQCUy/UfDDQ2QLjnIdz/H1PBXHso9/+nAiCP9z8c/ARy2RDc/0DtfEhcUQYGxv8oqpmQuJ8xuOyzHgvBuN8gLnG9fTyzz/D/xwRkr7ACPQYAYcZ3rqYNj7EAAAAASUVORK5CYII=") no-repeat center; animation: blink 1.2s linear infinite; }

.__dark .__alarm .car-frontlight-left, .__dark .__alarm .car-frontlight-right { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAPCAMAAAAiTUTqAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAXVBMVEVHcEzTDAzLCgrsEBDbDQ3XDAz2EhLwERH2EhLiDg7SDAzYDQ3kDg7tEBDKCgrKCgrOCwvKCgrICgr6ExP6ExPYDQ3TDAzPCwvnDw/hDw/cDg7LCgrqEBDzEhL4EhKGdTWeAAAAFXRSTlMAg+pWFZFr/q8Kz+o638Cr2HVU4dbZMhvVAAAAeElEQVQY03XR2Q6DIBBAUXaGxVZx7cb/f2YBjUEdz+sdmAQIWRlDbqghxh6UvxYDcaNBiWODX0UDrxLXJw3dDzffM72oNfkFI0uTL1TZat8ol3e6EZdvdROuTY3NOJtaJ58Pyz4XtHo44UPoaBps8yCjd28vyq/8ARUhFXQP6/ZuAAAAAElFTkSuQmCC") no-repeat center; }

.car-frontlight-right { transform: scaleX(-1); left: 183px; }

.car-smoke { display: none; left: 222px; top: 22px; width: 39px; height: 85px; background-repeat: no-repeat; background-position: center; animation: smoke 1.5s linear infinite; }

.__dark .car-smoke { animation: smoke_dark 1.5s linear infinite; }

.__alert .car-smoke { animation: smoke_alert 1.5s linear infinite; }

.__dark.__alert .car-smoke { animation: smoke_alert_dark 1.5s linear infinite; }

.__smoke .car-smoke { display: block; }

.car-key { display: none; top: 30px; left: 117px; width: 54px; height: 22px; background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAAWBAMAAAB5x3LYAAAAKlBMVEVHcEwtr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+axb9tCAAAADXRSTlMAIkMwTsaqkw/c9F6EflnDDgAAAHtJREFUKM9jYMADmLLuAsGtYmxyvnchIBGL3Fyo3N0KTLm7N3dDpG8qYMpdghl7B1PuMsJKQWQggCKHCm4K4Ja7ewCPXAHpchq5O2JxyRnkOuCVu2WALBekBAMNRg1GGsj+u9qAES5XvefC3IUzHoJxx18I7nhPZqAeAADTVexhF5UWFgAAAABJRU5ErkJggg==") no-repeat center; }

.__dark .car-key { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAAWBAMAAAB5x3LYAAAAKlBMVEVHcEwtr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+axb9tCAAAADXRSTlMAIkMwTsaqkw/c9F6EflnDDgAAAHtJREFUKM9jYMADmLLuAsGtYmxyvnchIBGL3Fyo3N0KTLm7N3dDpG8qYMpdghl7B1PuMsJKQWQggCKHCm4K4Ja7ewCPXAHpchq5O2JxyRnkOuCVu2WALBekBAMNRg1GGsj+u9qAES5XvefC3IUzHoJxx18I7nhPZqAeAADTVexhF5UWFgAAAABJRU5ErkJggg==") no-repeat center; }

.__alarm_ign .car-key { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAAWBAMAAAB5x3LYAAAALVBMVEVHcEzmUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/UVr0fAAAADnRSTlMAIkNOLJ44xg/c9IqyYaBp/VQAAAB/SURBVCjPY2DAA9hOvQOCVyHY5OzeQcBBLHLzoHLvdmDKvXt5FyL9UgFT7hnM2NeYck/gVgYKIgMBFDlU8FIAt9y7DXjkAkiXyzhnUYdLziHOoA6XfSC5VwnIckVKMNDg1JCkgRwuzxswwuW57TyYf3DGQxnu+CvGHe9hDNQDAPhs/qEsji1bAAAAAElFTkSuQmCC") no-repeat center; }

.__dark .__alarm_ign .car-key { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAAWCAMAAAC8N5/ZAAAAUVBMVEVHcEzbDQ3cDQ3qDw/eDg7TDAziDg7xERHZDAzdDQ35EhL7EhLICgr8ExPOCwvtERHcDQ32EhLlDw/eDg7MCgr5EhLqEBDtERHYDQ3UDAzyERHB9CRIAAAAEnRSTlMADaVcTcWPIkIv4JT2rtvhEtZar2uJAAAAuUlEQVQ4y83TWw6DIBBAURSo4KNFQF77X2hnYmOKTQv41UsgfnASNUDIxcQybkeTrFRsy1uGKrZu56augsG+ldL9PdM+RlFmKSXYRVPWrYbBb2A5S9PwI2Tee2S+oQdA5xwy1xJ8g9YamW7oItPAjDHITDmhekMVh6cmJklvGHmxEAKyUA5YABZCBBAjrizmcfFZR6RQMGH5wnjxWFprOaN3+175bJEcYLzmzrEzYpW3m8+HmXtJ/rAnu6ctdCDps94AAAAASUVORK5CYII=") no-repeat center; }

.__key .car-key { display: block; }

.car-hbrake { display: none; top: 85px; left: 117px; width: 49px; height: 31px; background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAfCAMAAAB55NVoAAAANlBMVEVHcEwtr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+agdtMYAAAAEXRSTlMAWdCXfh0tDvlqS63g77o8xXlFQGAAAAGtSURBVDjLrVRZbgUhDGPf1/tftiQhDKO20qtUfoYB7DgmRIh/GT4ZrbVJ/sPzPYdJI+T+wXnb5j2y/YU2SSlxT1YkVzm3gpCacLkNpdqjUsLWgFmEmZK0ZSOAgoQ5RjYnUdiodkNDvIIbWOh8JrBEJIZzdkmq72TTcqF41sFBFCiBSd6EL8ja1Hyq0prjEJ1D5VHWUDkCud5qUEl6tHoKoQ7FMQqkghr7yAIbGkwqhUBEMwYuMjgMgkSDDRVlY0GUZ0TcKRj6+K2FEoFokoQqcSNEoKTXp3MiAPWc0eLI4ocYIEKyv5YzSmSKPogcI+ZhydfvCEmIJ8a8iqoQY2SEZ9fMnQccHwarAg50YpzzeJVJdni88vet4zq4W8591M0lX17R0HQNPkyWDT5j2Hbd+YNwgf7kPMt9PrJw6Y1YtVNZ1HTiJALlAIt1fa1SSt4vhCtiF8mWlbeA4l7FDpYqv4t9Mo+vV6HMKq82BI5CWGItr7d5bQx+5wao8FGipnlxYciC7wZ7VRhZZ+olqNI3GPpuUs45a+n61Ktf6U/6Yjo9rmr3p74b+/90cfEFxVUkgEe8FHkAAAAASUVORK5CYII=") no-repeat center; }

.__dark .car-hbrake { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAfCAMAAAB55NVoAAAAQlBMVEVHcEz////////////////////////////////////////////////////////////////////////////////////1bZCPAAAAFXRSTlMArZfxWRAravkdzwe6QXpO5cXbhTWQlRZxAAAByklEQVQ4y61U23KFIAyUq9xURPn/Xy1JiOjpdGpnyosY2OxmgUzTvwyzrVLKdYkv9y/CVRpOnC/221TvQ/gf0i5aa1zTCpMHIVJBiFownPYQ0lCpYWmH/xlmQRsM+xlATsMcmQ8GxAy5fIe6eXDHAwLAYmCPY4mYGPb5Jkk9i92aC9mwDiYJbV5gIlqaT3e2tih5V6ZKLFOcTCX2UnIuYobksqtBJWjDtIJCQxTlSkFGbSR1hUqGLLAhQZmKKBCRjgMO0lkkCRDewVBE5I5d2tcwYu4lHCMOvilEAJsmoWG6IyaHRUdH+rEQw/o2yiGmTw6ooNA6+gseeEbIbiMixDxjHZ581d8QmhCDY3iFhW6sChCxdvL1Xgds31c0AjaclLHWyF4Jku2GV/G6qEuP73w18Dxyt0A/vKIh6RiMqyz74ONPXdYTYR396XqFzzpkYeiJaHdHsahqKYbvxpKNqn1tCEEzYO2+LPjWbkEkOeEx2MdlB0tD7Je9ch6jbhelKn1rQ+Ao0FLWEu/MtIAu7JpW/Jq5NaCmOnJFpMz4brBXuV1IQb2kwOGZBEPe1PrztN7j8Z3h0a+kedHjtqvHKWn/1Hfn1333l/EFSZMsqZzMDloAAAAASUVORK5CYII=") no-repeat center; }

.__alarm_hbrake .car-hbrake { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAfCAMAAAB55NVoAAAAP1BMVEVHcEzmUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA+x7cL1AAAAFHRSTlMAH1XZa0V9L/oKlPKy5hRgzaa8xZAZpJ8AAAHISURBVDjLrVTbdq0gDOQOchPU///WkpCwte1Zx4fyIgKTzAwhQvzJ2KyLMTq7vTxvc7jmCN2/OC+P6z6y/EdYq5TCPZUweMs9a4QUi8vH2drxYbnD1gn/BmZ6n1vSACgomGfYcEtoGX8JUig4YW4WuCEpQJaKZyqtY+Adgg5K5SnWDkjZKNhKArk1pQ7f3YGTESbtIqwQHtCGJvCV+dS6FJ0NsIgjjGSxaINwQB7AnVL55W0aqmuabGrgbGjDATLTVIOIwzm4SIgeKdAJhiKikCQ7DlRxY2fnBnyI3pUQwU4ZirUQYiTpI3eY/NFSYF9ZUcT9nznAS8X+ggfyV0Q3hnUwYn8g1HcEeWVJqGJWIGjjyxwutzsinQ6NgAOelOMtoFedvNqWjm0VKq+fXBoCHkQR05P94dUcfV4DbF953TlKz0TriZBh/u3XWkbaRAuTPBEjTmJSl/zULtbsKM80vrK1phjgPhXBzhAtYOjDj/dhxpLeqNinTDGrcxXKlfbbG8Ra8hxVb/fMt41T0Tt3hW/RBr5nCoVto0hiMVSdPVIv0RCo5mOMeGNbvfdSzlJvj34V3/RFtXpciv5lH60K+q553Xf/M74ACUgqI3+gCCMAAAAASUVORK5CYII=") no-repeat center; }

.__dark .__alarm_hbrake .car-hbrake { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADEAAAAfCAMAAAB55NVoAAAAkFBMVEVHcEzrEBDbDQ3PCwvfDg7iDg7gDg7iDg7aDQ3iDg7TDAzXDAzuEBD2EhLNCwv0ERHyERHYDQ33ERHNCwvtEBDyERHOCwvRCwvRCwvqDw/2EhLJCgreDg72ERHsEBDsEBD0ERHqDw/cDQ3eDg7KCgrbDQ3PCwv3EhLyERHiDw/pEBDVDAzfDg7uEBD7ExPmDw8WnaGDAAAAJHRSTlMAZk/NFA08ICwGalvW9PKwRqxVuobkfDLg9nCXxcmfk7t97XfDvlB8AAACNklEQVQ4y61U15KjQAwkB5OxySbYXjji8v9/d+oZwPZWbZUfVi/qaakVhiAIf2Kqn9dVnfvqh/m+972Z42kf5OvN96t5+i9l/TAMWSx0/sFKr2pshhyf0U1Zlo15CESWhHMOZIt8AT2PcAwJmh7QZReYCDhoEQLkz97mpScCyygsR9n4vCcTUdTp++h9WQkUWoZI2pvYhG0Ar++dn7eDzBqgJBDxTZKFDC008hhJ90rbjiLbyzFFtSwZJhaRxq5BuBHKVB6zUcRYdssk2iBblhs2AcHH8sZxbLBmNo5oJRggLjePzqhejyOb+TqOy5UpIkqAViOv7ApIfR7wN/5CPmOKlQwJ4rqyWoKxEUK2rhV6r6vG4+uK6ZWBDBtdhiHgCiKgkMhjA3sYaB/BQiLuQAcAUw9DdSgC8RHMw8BuiRTWm2ImA1PP89Zj3u2OSkI6z/AnMFjIbMkeBB5ty6/CaJndrw92ESrhBBVBskd4J4DiEnl1V5zU40X1N/5KPmXMuW2nO2pNbWsdiud7UvHeCLd87Hgiw/Wdp0lmCjo/Ffp2sqaD1gDZWBv1rgimyWVDIW37ItOOzCAgd51LXpdlWdoFMcVi1EWS/EJ2Z7zF5FPj7WU/Ic/k1brO2ljF3U+Iu9bLb6joeFteNT3uL/4i4wEgWeIRPXbB41I08F/PWqaMc4q1TizkykERpAymeHjKGVa8TKskSaLr7AknTH1Y8cl/UTrv6W5hfPgfVaS4KIqTZv7Nb/w/q19TSBNbY9IAAAAASUVORK5CYII=") no-repeat center; }

.__hbrake .car-hbrake { display: block; }

.car-shock { position: absolute; top: 0; right: 15px; width: 46px; height: 40px; background-size: contain !important; animation: blink 1.2s linear infinite; }

.__alarm_shock_l .car-shock { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFUAAABLBAMAAADzB9aCAAAALVBMVEVHcEzmUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/UVr0fAAAADnRSTlMACePyOdAjFGO8qn6UTZ3+CEAAAAKeSURBVEjH7Va9axRREJ+Nl90zH3AgFgFLiTZuFb+KHIdiG5ImaSSsiq0cikXAwBFbCQipLI5TsBENgTSxOQ5JfRwoWEQO3PPAO8/5G5z37mPz9s17b7V2iv387eyb+f1m5gH8g/k1OswdfbnnhnqHq3RsI+LVV2UHdgeF3yph8acDegexQusQUDywQ58RpEXLFdBfDrchYWiVTwS24cDuI8Z02iVo35UFAvVG7msu7CPEAcA8QXsFF3ZaZuosYdecTFACfkjv3bITS3//DtBEvCQofG/9wENcBa+IcUQ3D/GK1XGV4s8jLop/FBH3hk+DbyUGWydmp7FDr7y6IOQDpcN/sSk/TtsKUdzGJbrakprAm+/ekn+MmaWfwYjII0nkQlSMyeFMh0T2my6eq1CO8nyXckyqvIBp0xXqD+AciTHY1LCM8i/DLnm4pUGxqwvkGO4CzOpQfKn7/ZqrgbevQwdMggt5Qa5uFYOAijr0okETdSawiIduZQtMWJpcW/l/1qGdSvbVmgKThZktMNJ4NY29bi6jp2mspVUEYcaMCbv/F459zfGG2fFtLRPmppLTxLNodtyeMLYzPMclIzY/8Tf+xZK1Z8sElMdXomUYbFRwjdGYsQwwT7bV4fsJ5YYJlivBjAhMBvTY3HikrctSXh9+6GD6UwQL2C8ocZoIWdmgLnWQzBAbIVOklu1JpOPexhMyp0zCB2PHy2wilJY0b28+oZLOurX2mwpPSbk22BGDJa6q+kyFTCFeY8X/mp3LccRoVChPT4RaZE1b6YVq9Z5PHHOJUHYmflKBLS4RCh9ty5wLTt4oj5PJxDbC7Y831B2WtZYC0KIztm2lcRXtbVvvL71yJuxshu3o6eiWs264F7AXZd6dn7Tgv522P3aYNGxUaOooAAAAAElFTkSuQmCC") no-repeat center; }

.__dark .__alarm_shock_l .car-shock { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFUAAABLCAMAAAA29zuDAAAAY1BMVEVHcEzlDw/eDg7TDAzhDg7SDAzpDw/iDg7lDw/gDg7zERHyERHTDAzWDAz1ERH0ERH0ERHeDQ3zERHmDw/vERHPCwv5EhLzERHTDAzbDQ3sEBDfDg7jDw/YDQ3LCwvpEBDICgp+SnJcAAAAE3RSTlMAVke4N+ZoDiKAq9eYzsKU8/Pn8hmO1AAAAv5JREFUWMPtmOt6oyAQhgVRFIynYLS1ibn/q1wOmqAuyUDc/dWP9HnAwMvAMCNpFP0fZWypVXmKSEYPYNK85nMVXYxqXrLsIyhqL5fF1vLyUPoJk5QWIntC8082tDIMPO/qA1p9Ymk7Q8we0voQaMQMpDWtdIGyz9w/c0rT4sdAF/eYBeMZWn58XPmllyWdj5WqHwCdvU603b2u8wMCCyn7emomUKbyJaQoq4L5tO8lyRwrWe3bBZpx2UCh2FKitM/TFRTpOfqSrG1AFQFRczlWR6e0ra+J9dSILfZmqOL2vK/zgOypBmIFnQOXlr2lumSMlcp2oZowb8ruanomB81Q0mqa0H+mzNIV0MljolbrE0LMa01r8Uq9gIReKlS8VkKYUKCVHuku8ltAlsxEpY6VMF2zUrxXD8joPFUGGyhuAVDxzQFBK53ETX5Jv0FiAH8hGmFmYhQGBaV0OXFqYvR7AjAnr9ckrieAzi3xgebTGULlPrcEyiaQpcwnORJ+BsnrkoAbCHI6+6XbXI54Lz8/ScUAS0/etzla/rxTE/ASo6d31CkOwfK31oZgs2R8rZ9zELYZ33FPAVjyb7C4Gb92xa6OYxLwYwF/7dSgxG7+JMQfi7ZQaRtp7AdjgwNuySvmqL2+nuraBFy+cptQmGeFDZUfv99M2sHF9aHH6NN1La+ESLCNtfxCkw228MGatBTrgasURTbUq0+YFfo40ng/LL0OVlGTwrFk0J3padjtXDFs5BEPyRCbK/VfdmeQVj4/EguOB2lR4cxpG2M7cDyQwY3F2z3ohhS8BUPnOo255KxK1wEPbiG7dq6QjLudYAeXqK43x4bRJBSrB7pODdlTO1A86C1wYlEglty0XKFT3HbqIGGWyH6yb+y6N8hv1+V2PwG2YDahcAXD3tobgm6BE4v30DsgGijOY22Q44jneyw00WQK7VhYHGCqjXZ57L5S8L8mth6zmCEXBEcwPKExjQ5TvkDz6EjFZvX4UKh8Y6rVZ9HRQjmOfvWrlf4ATnOmD/gQI4kAAAAASUVORK5CYII=") no-repeat center; }

.__alarm_shock_h .car-shock { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFUAAABLBAMAAADzB9aCAAAALVBMVEVHcEzmUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/UVr0fAAAADnRSTlMACePyOdAjFGO8qn6UTZ3+CEAAAAKeSURBVEjH7Va9axRREJ+Nl90zH3AgFgFLiTZuFb+KHIdiG5ImaSSsiq0cikXAwBFbCQipLI5TsBENgTSxOQ5JfRwoWEQO3PPAO8/5G5z37mPz9s17b7V2iv387eyb+f1m5gH8g/k1OswdfbnnhnqHq3RsI+LVV2UHdgeF3yph8acDegexQusQUDywQ58RpEXLFdBfDrchYWiVTwS24cDuI8Z02iVo35UFAvVG7msu7CPEAcA8QXsFF3ZaZuosYdecTFACfkjv3bITS3//DtBEvCQofG/9wENcBa+IcUQ3D/GK1XGV4s8jLop/FBH3hk+DbyUGWydmp7FDr7y6IOQDpcN/sSk/TtsKUdzGJbrakprAm+/ekn+MmaWfwYjII0nkQlSMyeFMh0T2my6eq1CO8nyXckyqvIBp0xXqD+AciTHY1LCM8i/DLnm4pUGxqwvkGO4CzOpQfKn7/ZqrgbevQwdMggt5Qa5uFYOAijr0okETdSawiIduZQtMWJpcW/l/1qGdSvbVmgKThZktMNJ4NY29bi6jp2mspVUEYcaMCbv/F459zfGG2fFtLRPmppLTxLNodtyeMLYzPMclIzY/8Tf+xZK1Z8sElMdXomUYbFRwjdGYsQwwT7bV4fsJ5YYJlivBjAhMBvTY3HikrctSXh9+6GD6UwQL2C8ocZoIWdmgLnWQzBAbIVOklu1JpOPexhMyp0zCB2PHy2wilJY0b28+oZLOurX2mwpPSbk22BGDJa6q+kyFTCFeY8X/mp3LccRoVChPT4RaZE1b6YVq9Z5PHHOJUHYmflKBLS4RCh9ty5wLTt4oj5PJxDbC7Y831B2WtZYC0KIztm2lcRXtbVvvL71yJuxshu3o6eiWs264F7AXZd6dn7Tgv522P3aYNGxUaOooAAAAAElFTkSuQmCC") no-repeat center; }

.__dark .__alarm_shock_h .car-shock { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFUAAABLCAMAAAA29zuDAAAAY1BMVEVHcEzlDw/eDg7TDAzhDg7SDAzpDw/iDg7lDw/gDg7zERHyERHTDAzWDAz1ERH0ERH0ERHeDQ3zERHmDw/vERHPCwv5EhLzERHTDAzbDQ3sEBDfDg7jDw/YDQ3LCwvpEBDICgp+SnJcAAAAE3RSTlMAVke4N+ZoDiKAq9eYzsKU8/Pn8hmO1AAAAv5JREFUWMPtmOt6oyAQhgVRFIynYLS1ibn/q1wOmqAuyUDc/dWP9HnAwMvAMCNpFP0fZWypVXmKSEYPYNK85nMVXYxqXrLsIyhqL5fF1vLyUPoJk5QWIntC8082tDIMPO/qA1p9Ymk7Q8we0voQaMQMpDWtdIGyz9w/c0rT4sdAF/eYBeMZWn58XPmllyWdj5WqHwCdvU603b2u8wMCCyn7emomUKbyJaQoq4L5tO8lyRwrWe3bBZpx2UCh2FKitM/TFRTpOfqSrG1AFQFRczlWR6e0ra+J9dSILfZmqOL2vK/zgOypBmIFnQOXlr2lumSMlcp2oZowb8ruanomB81Q0mqa0H+mzNIV0MljolbrE0LMa01r8Uq9gIReKlS8VkKYUKCVHuku8ltAlsxEpY6VMF2zUrxXD8joPFUGGyhuAVDxzQFBK53ETX5Jv0FiAH8hGmFmYhQGBaV0OXFqYvR7AjAnr9ckrieAzi3xgebTGULlPrcEyiaQpcwnORJ+BsnrkoAbCHI6+6XbXI54Lz8/ScUAS0/etzla/rxTE/ASo6d31CkOwfK31oZgs2R8rZ9zELYZ33FPAVjyb7C4Gb92xa6OYxLwYwF/7dSgxG7+JMQfi7ZQaRtp7AdjgwNuySvmqL2+nuraBFy+cptQmGeFDZUfv99M2sHF9aHH6NN1La+ESLCNtfxCkw228MGatBTrgasURTbUq0+YFfo40ng/LL0OVlGTwrFk0J3padjtXDFs5BEPyRCbK/VfdmeQVj4/EguOB2lR4cxpG2M7cDyQwY3F2z3ohhS8BUPnOo255KxK1wEPbiG7dq6QjLudYAeXqK43x4bRJBSrB7pODdlTO1A86C1wYlEglty0XKFT3HbqIGGWyH6yb+y6N8hv1+V2PwG2YDahcAXD3tobgm6BE4v30DsgGijOY22Q44jneyw00WQK7VhYHGCqjXZ57L5S8L8mth6zmCEXBEcwPKExjQ5TvkDz6EjFZvX4UKh8Y6rVZ9HRQjmOfvWrlf4ATnOmD/gQI4kAAAAASUVORK5CYII=") no-repeat center; }

.car-tilt { position: absolute; top: 0; left: 10px; width: 46px; height: 40px; background-size: contain !important; animation: blink 1.2s linear infinite; }

.__alarm_tilt .car-tilt { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFYAAABLCAMAAADdwICAAAAAM1BMVEVHcEzmUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/o9dsPAAAAEHRSTlMABRAcVt/sbMj4oC+StIBAgdf5/AAAAthJREFUWMPtWNnaqyAMlH0X3v9pf0FUlN32O+emuWq1HbPMJMFl+dn/N4glEYIYBr+HCbARLhplXwJFKwmAhPPwgaNwWWkuhHnrvJXeUWFwAFDSf9kchmZ3Xr+Lngf/8OWU9R5LTGNO+IsyMQ9Btbpf5e4ygadBV+8RyUsP5InK1WydtAjRg9LNNaJqMAka6mRs7T4LCbBvQGUrwHU6BTCEL1GXH5u/epi2zBfKNPxQmiZM0Ggofu8Ht31HE+CuxwCRpugPGd+N9rgLyan4UvRSuLJ1uo/eUOFo9MO4SDiKGjIuxC/lXj/bJiMrK46WnfQJg0HKpFG3LczCXWtqoUftyk6DpI5MgIojMuATJKpMR5sMHpdadbpohf1XU50Dm2TvxSduBDVkz7mau/iWIcBaoLfa7o+X9W6nL0bRFmiKYY++A6v8Wg9P26DOoauJtjQBsOYHTfqgjp6DKdFzPi0tOcdzJ6cx4KSJFkI4Yj5TNgQaESxvd4YT1ZExUI+gcp08sjCKlWaBNwsZRbv/1H1q7MksIjHiH8M+BKzQy1w8jJRa9ceoB++enWba6Ep7sOt8zAwk5Kx0G/4C9P43guqpFVyujGHckVsEXYC6TbZSt/Wrhzp3S6D7oOco2y7h6g74GEi1MXbfev3O4gyurLompzMq6i7b0NDK6vudyacyLPRdM7krZ7AqXzrE9FnB719JEhDjBe4jMw3reU1BPN+aUvHhoqrjtb5kx+EPbGnf5HiPSEwfRsNyb0tbnIinEyjO2TxustpOUJ6niTNzl/rkuSQNGalGn8h7/uzMsuhhScuzHHuKSoCcKo0VbthdnOklPA3Nukuqa+HOrt2mOYYfyQXFUKY59hw8tswT/ErByVGmHMj8+xlZS+6t+Uz3MZSSLHm9oVxvcA9XLZ0u93E5zbELgOMiu15ybBvBwh+RbVvXYB4XKr8sgGYXwssXDPf2+Z/97F/aH4S1hIBSzcftAAAAAElFTkSuQmCC") no-repeat center; }

.__dark .__alarm_tilt .car-tilt { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFYAAABLCAMAAADdwICAAAAAZlBMVEVHcEzyERHhDg71ERHoDw/oDw/iDg7lDw/hDg7mDw/QCwvkDw/SDAzcDQ3VDAzbDQ32EhL1ERH2EhLZDQ3fDg7nDw/dDQ30ERHqEBDICgrlDw/NCwviDw/vERH6EhLUDAzZDQ3RDAzFyZn4AAAAFHRSTlMAlH/GEB0GbDBX7uWZRr/VqvHfrILWsqMAAAOCSURBVFjD7ZfbdqsgEIYVRcADnraRmBD1/V9yAzEKiDakXas3/fEiGeBzGAaQIPjT7ysmVVPXTYXin2MmpHq8VKMfgkLQKGATRepHBJUZh9Gjrj51HitH64rET9biMFz8Dz8bfaT8I5tThfS4IvUSk+iDaUISUYfYtEYPTcQbCqRHzX7qk3CFRth3nsJajT5xVYJHr0qYeEKr/vHoq+KoHils4eupgp4NUMSh9wtBLKB9X8HT/Oh75W/4dtqiWnQ58xSHssWiOoRvjV/6ERVfOKqrfsNj2Ih26GwZ93vVX+VuLHpF8HgZ894l3oNzbCio8fHouWLsS9+f7mqQ8xoeLWO+qecKJ546DJ8VZykMOEcHK26lyWeVDFgcyl/NybxFnMfOkB5oWbuKe7JB1rzZ2YqIswPqa2SJigM+CW1lmYiAMu4sbEsrwoWhOkwgxipz8kvGJNUlridrJC1H7hLGtAglKBOjf1L57mH63JJM2o6iizRsAjJ2Jo2Bla+sqw+SATAGNk/PBbedmXVPU4dciygsu64LF2jHujOxbD2YhtU47E/LQjDF+yT2a6hELGHLDKO9QsHABqmuFdDhaz0JRSl/dou/wmhFAa3ty3egUijAVCINUROrs+7vYe+ly2pGIbtvGu5vaXC2M6MA7vcsJ5Dev6mhtZYttJ3+TJlrq/73fTmwxQeYDGT634tr7foyLxlKAqRbWge2vPhJQs1umeMgjJe6qcwBQoSg09dMC1RM92qjruOVTEIpwuu3ZZJPhyrR9gm6NCvdHyFA1pk7fDtNF0exCHEmOrZHJ7pgTNaihk5PabH7bEfH33dU9Mit9uke2np+1rc2FgNBHc1Cfe8KQT6O45Z3EJWjgOqaUgD9sUj0TJPlfktX1usZS3HlgWPufVuUFDHFSdGm406UPEc0e19GJYziPB1nmzkv8xSLJsA7uLPSOFsSIX3FSf7zvIoFxewS1S58pTR430bLHfOW4917qXcuzDejpMCcH6reNPvmWJLeDFlhxIvZO8eQib2Ziz9/meNvupubG8RivXrnGDmJAjoKzhuit6tetCgk5e1lvXrnGBbd3FEotBrvHAvyqy4NS3W79z4G0zUCQlsQsPi3VXjnWEA2n/TN1RzFFX4chrIIEi27TKx3jokjWHRLrZMUmdSrf46JXMLY7lVaWP8cc72nsKlXGvzpT7+m/wMP03EAiqK1AAAAAElFTkSuQmCC") no-repeat center; }

.car-security { display: none; top: 0; left: 0; cursor: pointer; }

.__arm .car-security { display: block; }

.car-security-1, .car-security-5 { width: 39px; height: 112px; top: 86px; left: 0; background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABwBAMAAABvBnRJAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAKlBMVEVHcEyvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyArbOiNNAAAADXRSTlMAZpXY7lALu3wpGD2iumSoMAAAAZpJREFUSMdt1LtqAlEQxvHNxcTEFKYOgi8Q2CalYCVphH0BwSJtwDaFYJUu4AsIPkIewTogxL243uZdoht35uzuf8ofy5nvzBz1PKtPr1q1uFnFK4mCCrZE0mnJbvoiEs6LWJdTvQ4L+JahvJSPzOqjfGRWP4YXojVxUmr5igP6sqMWa9aGfXjQD28N94oz6vMMfSy6yByip9RnRX121GdEfXR7NTPRNT2YRXrku2FYWcWxEsWx4VqbCyRyLiltuKQE0NxmNKCYS1pQHwbnbNK2VhfI7ibyKdECEtl+nV3Y3DsOfsOM9JZuzJhiRhRT38y1wNqcJyMbyr6i7Ans1ybnjFi2Z7t3L7SDC+mM3Zcgv2e8JHRvKd3qb9rQ3ZDubUY4IGwRfhEuCceEHcrZJxS4e2Gc+ejuBIZcmHG+jloB94QJbCN/DPUCbghDwhSWmT/aIsaEMiScEgaEE8IFoU/YJdwSJoQhYUoYE/7fs4wBYZvQJ1wTJoQhYUSY/V1VsEk4IuwRJoQHwpjwNKcqLgh7hMf2jcdyPXlYfwB7rhJTKZhiAAAAAElFTkSuQmCC") no-repeat center; }

.__dark .car-security-1, .__dark .car-security-5 { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABwBAMAAABvBnRJAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAMFBMVEVHcEz///////////////////////////////////////////////////////////9EPuwCAAAAD3RSTlMAZpbXC+y7ShwyhFhy96G9zVS/AAABpklEQVRIx23VO1LCUBSAYVB88BhHSyvcgeksobF0tKB0Blor2AHuQHYAO4AdSGGv49hLaYcQkiAKRwFzz73Jf8pvbnJeN5DJaDxl0lEMjtO4K34rhWWRsJOwXF1EXu9dLMk6bqsOXm5QLhx83qLcJV+5iQ/FbGyy7BncMyiewUfFocGKPm6qOtCDK3PwSPHL4APl6UMeLV3EzKSoFpqn9xV/DHYV5wbPFRuUZwj9aHKrH9+88kpxam83jshgU/HNJH+HirJW8h40KS1IrmW2qcwxLcjqfBJbXmBrBQtnVJFHFTWgIm3I2oUM0ndLJP48cgJd2gtaUpk+lRnCbde1WVdTFvAJ6JCs+6oLbtLk6oCHdkNzaMjMuGTj5z/uENpdyg10afBaYG9dOtmmk2XCPuGYsEmJKoR1QoHenXHGo8sLDNmZcbwOF6PU74xi1sEJrCi+NgUHp4QhoQ8bloBQqoQdwgHhkHBE6BG+EM4JvwkXhCFhQLj9FUjigPCM0COcEUaEU0KfcFNoCo8JG4Q1wohwRRgQrv890jgirBH+pc+fJOM0g/ELhUFm12F9lRsAAAAASUVORK5CYII=") no-repeat center; }

.__alarm .car-security-1, .__alarm .car-security-5 { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABwBAMAAABvBnRJAAAACXBIWXMAAC4jAAAuIwF4pT92AAAALVBMVEVHcEzmUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/UVr0fAAAADnRSTlMAZpVQC9X0veZ8KRg9peurcFkAAAGiSURBVEjHbdS9TsJQFMDxKkZFMcHdEJ7A9AkIk3EyJO6EgZkwOxBXF8LgbHgCwyP4CN1NiLS05cvzDEKl99z2/s/4y+09Xxc8T+Pdc6Oyqrt4KbHvYEMknZbsbCwi4ayIVTnEW7uAjxnKc/nKLF7KV2bxrXiSmyQTq0oTHYMtRT3Z1c9NrTU9+GsO3ijuDH5SnnvIo6WLzNzSJTVfXyguKM+W8gwpj9leRU2m0E9srnxQDJ1V7CMyOFLsm+QDqMhqUprQpPiQXGfUojLntKAxDM7apG6tauGSKupQRQFUpPu1dqFz71r4lc9IoEu7zITKjKlM82bOBdZmPRlZU+0Lqj2C/erkrBHL5mjXdkNbaMjM2H4J8nPEU0K7S+m5v2nFJxtfoXWDdutmww3CD8I53Tki7BIOqHiB3gvjzEd3JTDkwozzdVQKuCOMYBv5Y6gWcE0YEqawzPzRFjEhlDbhlNAnnBAGhEPCHuGGMCIMCVPChPC/zzL6hE3CDuGSMCIMCWPC7O/KwTphQNgnjAhDwhXhYU4uBoR9wn362m057jyMPxamDBlKYBlrAAAAAElFTkSuQmCC") no-repeat center; }

.__dark .__alarm .car-security-1, .__dark .__alarm .car-security-5 { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABwCAMAAACq9plIAAAACXBIWXMAAC4jAAAuIwF4pT92AAAARVBMVEVHcEzbDQ3zERH5EhLnDw/tEBDpDw/VDAzOCwvhDg7WDAz4EhLxERHaDQ3ICgrgDg7rEBDMCwvlDw/WDAzSDAzKCwvPCws7jvg5AAAAC3RSTlMA6tHmH3a3lmRH024GEwwAAAHwSURBVFjDrZhbt0MwEIWLJCOkKOr//9SD3mIu7IezR1fX4uueSxIPvd1UeXdDVLeVR7iqbdsyXmK+3RUcYLeLHGC36bTMqs1URcBuV+kAO7tM3yryiN1WpbIUmF+pcqLAqGIk7ILKiRk6FSuFHYFdVG3a46KL71BSHqUylBx4XUmmdUfo8yXSUkrr7bQTb34lg+zi9/yLKmnj5+lbL2uZNnyeZoZJ6TZpkmtbZyl/WIp6WiExPB0rlbSaPJhWlDekNCjhxJAHqLxtbaVbIrm2g5aWtxEHXbwNP2x28iOmotuJNoy0ASyPt0EGV/ODNgyjEqLd7Z7UODhe3qiHmJ7O8bGEURcfSzGuv+bXKrYLnOa1wWx8tZF2ZOMji4tYG5xb2+jVcLyNXvc7crG3xFajN9IyjkC/YGEFa9fARsb1mJ8DudjfjWiOu6A3MMYR6Ed3S8f6gmXHuAb0K0Dubusw5n/g8n0a75MZB26ylZ+j+h+4/Jz7E86DXP4eonmerCscuMmKpTn6mSo4pxvOE+g3O5CrQc5j3JINkJYTNRA3Lw/Qb3EgF0GOIO7R/XYCPc5UgNzDgVyNcc9vI/Q8VQNyTwdyEeM6Av0a0K9zmN/zPUHqLhRArkO5CHIEcgXIvRIDHIFch3Jb4lhf6/qvjo/+AHw6rA8LNE37AAAAAElFTkSuQmCC") no-repeat center; }

.car-security-2, .car-security-4 { width: 93px; height: 84px; top: 11px; left: 22px; background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF0AAABUBAMAAAASUCY4AAAACXBIWXMAAC4jAAAuIwF4pT92AAAAIVBMVEVHcEyvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyApuvVy0AAAACnRSTlMA7jx5G75VCdmdwWaARgAAAbRJREFUSMe1lzFLA0EQhZdcvJBWReGqWAhilVRCqogIahUkKKSKhWApSEA7C4mQyvq6i0aS+ZVeNJCdFXbeK27rj2H2zZvZHecqO2cthm7cyweB1zsi+zhey0XkG8bTaYnLHMWffnGRHohnf7i0OVxeOVxmAJ5scFmiyqxP8WjqPhT/jKyq5go3HdHRuHzF8aMAl88o/hLicUekWYgvToi7lvJHG+YuxHd6VPKTaLFq0wC/iUvZDfDrOH7O4bWMwsNsJgY+DoQ0bFzX2iytNteVmltjMFF4YQ4F7ZuBoy67Zw5W1bFzc6RdqORHZvgplbw7wNv1n3GKFhd+wIW3s1HhbW10+Dc7/KlfKXMWa+2Bx/aZu2zDdw7wtDU9HHmau1RlXeqFRx7CYy58PePCj7nwfpcj4qTEKxvcFiitsg7ya9miPhWqtrfcbRfIp8trlG0knSEnZsKJ6YvfR77GG/EL5LZNzpl+Om0uHWDoqHR2K07HccWC0rni0vG8s3CclaFiNakRXp5DyjvleWCsvCrA+hf+Du9uOdxZ3hYBb2PrLWVG8Kulqc/w7lKo7bbchqtZsn8AE2RoCzzqgK8AAAAASUVORK5CYII=") no-repeat center; }

.__dark .car-security-2, .__dark .car-security-4 { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF0AAABUBAMAAAASUCY4AAAACXBIWXMAAC4jAAAuIwF4pT92AAAAKlBMVEVHcEz///////////////////////////////////////////////////+LBpLMAAAADXRSTlMA7xwLSDfbxHGbg7RbcypQjwAAAcZJREFUSMe1l7tKA1EQhg+5wEZTeQELF7RRCAipvGCzPoCgjVaCWCcgarsQ8QV8AcE8QCCkD6SysVo0btY472KSLXZmi535i0z9Mfwzc2bOjHNLs8YFhH/SK0CXukTrdrw6JKI/M14PZzhNrfhxmxa2Y8T9FKcOhtMthtPYgHsZTomOV9oZTlFTzXtI3AKtqm8Cp77CP0ucvorxqxxOk0L8JI9TbE7Nwn5eimId5vGksGHO8vhWExLfKsSrefFPxansYfg+hld8CM+raSn4KZLIWaVkbhKtzWWlYm0MegKP1KEge2TgoGC31cEqOnaqjrQ9IX6kuhe5fFDnzSXHf/U5zx9OFGDuB5h7XY1wb1Aj3N/p7nd5pdRZLHNv+GwPsWDL/OUYvrYawy1fcw/Kpasz9xsG9zeY+5KPuT/C3PMu/3ZYtCMs2oll3WJP593Ar0JLhajtowGvsD/WsnSxRtm0yAmxZHpQn4jk3xvwcpb8yBJtDXs67hyrLZMTNzE5a6CcDibHtLCvgHIOMDns7cQOa1zLus6zabuXru3bemofwFxYFKALXCdsyw+sfHpFxM5u81V8DPDzo6mP8LP1GrtuXWM5R/Y/BzgZEAGhUeMAAAAASUVORK5CYII=") no-repeat center; }

.__alarm .car-security-2, .__alarm .car-security-4 { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF0AAABUBAMAAAASUCY4AAAACXBIWXMAAC4jAAAuIwF4pT92AAAAJFBMVEVHcEzmUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/MbzTdAAAAC3RSTlMA7zwbwAnbVG6egkFAVfQAAAHGSURBVEjHtZe9SwNBEMWPO0MuloooXhNBbGwiiKA2wSAWaSyCX5UgopAmgljHwl6wvCapU108YuL8c56JmJktduYV2frH8PbNx+4EwcLOURWhS8/0DuBRn2jNjocpEX2Z8ctmgVNuxa/aND01G36TzHDqYjjdmsT84zQ04PEcp4mOl9tznLJz1fcm8dPRspoKXK2IV4nTpx/fcXAae/FrF/dXhLBmekZvwF0L+70N8+TimzVI/KM3WaEr/sxv5cDBT/z4PoaHCYS7ah4UvCXxDaWMI+nNRGtzmalcG4OxwDN1KMi6+Qigy66rg1V0bK6OtAMhvqOGF1421HmzxfFvfc7zwsmqWPgGFl5XI8Lr3sjwd3r4PZ4pdRZL7w2P7QV22RKvHMPTVmG45WkeQJkNyiy85SHcxcJHCRa+hYXnXW4xJwZeWee2Y8t3i5VOz8AvQZ8KkdvTAMrtyPLpYo2yYpHTxMyMoT4R5tctX+O5+ZnlthWsMrmcHibHMHSEnFVQTheUYwm/DMo5xuSw2jHJKYPJqkAjvDjbUO0U5wWYC9ME9Gf8vXl3S82dxbYI8zb29xUfAvzv0lRH+OCQoO222IYXs2T/AOv2osMLzrfAAAAAAElFTkSuQmCC") no-repeat center; }

.__dark .__alarm .car-security-2, .__dark .__alarm .car-security-4 { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAF0AAABUCAMAAADXoMs5AAAACXBIWXMAAC4jAAAuIwF4pT92AAAATlBMVEVHcEzhDg7kDg7kDw/gDg7mDw/iDg7hDg7iDg7oDw/kDw/uEBD3EhLNCwvwERHKCgr3EhLmDw/UDAzPCwvhDg76EhLrEBDzERHdDg7ZDQ3ECFOxAAAADnRSTlMAMp2BQlXwvhkJbdXq4iUr3ZgAAAI9SURBVFjD1ZnbkoIwEERzg4SEqxjE///RDagrLhOsIp2H7aHEF0+1zQRCwti/k5E8F7oqtPcil+3aB9VVBrYS/qkCH4nzv9Jgtq39VgbJlp9s72VGtvcOm0m/1luYlrd1oK56nh5fIS1fuA2x97/VA1qe65BFH1FiyxvRR9HBvE4NfKfb5ugTWl65Jy5e9nQXituDfADvz0ZT1OHnX+RsdfJqfiPfWqHOG/+iWprzibeLOXwka6u0h7rphEEkg+cjuFYJg1N/8Z3AZqo+hLsUdkilnaLVuqSbVqUXRky1TbrfcjcdSKQ9o4tyCv+fPiaX+JCzK4VUW9rER5A4CEUnTlwqHWeXqTM6E67nMExUJRsP8GFY4HulGw+d+GTvrScbZ7wcYkqfKMbhpcoIT09lhV/JAkyfeXmlVRYYOGX86gBzZxNzrgGvc8ZF4IhpeRSOeB2q9EzLAuBMzNc5HH9rhrzjSto4YHwuj7mccHXPCDflnRIGXumAmneFgTNBOr9j4PZ+oeCY5RZOGr9ABhEzTbC+L9BqiL5QAi2hyYDaW9eYFTRFOm8wa1CmJOk8Y+gjaOnPXkaiQO3CF9bOOWhZsWpGQqArygQVy4i5uzBFOR9lxlw60DAKuVB0g8qle9T7I5wsMpcF+f7oUM3IZLfq0zwqF/PK4iMdUC5Md1uNjxMql6KjhNrSERQct6PD9Q7eIHctiuYP3TKkKvlpHb0XZbbxw7eitvFrlkOv+BXLI9tks/6KX7F84pL9F/0AR46IgXMRZ5wAAAAASUVORK5CYII=") no-repeat center; }

.car-security-3 { width: 114px; height: 29px; top: 0; left: 110px; background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHIAAAAdBAMAAACEUSXBAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAMFBMVEVHcEyvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAr1b2GRAAAAD3RSTlMAtwnyQ1gw6KIeb5R+2ss3J7shAAABN0lEQVQ4y2NgGCRA0zXqdIeg3Lt77wQluk+FuikQpUstZuPz/2jg88WeMAK6p5zA0AUD318cnYBLG2eM+H+84Lt0JDZ9bAvr/xMGhkfQXa1y0P4/ccAORS/nQmL1ge1dCdfoff8/aeC2E8Sh2/+TDD63Ap2cYf+fHGDhwJD/nzywgIGPTJ0TGLjI0/gRGCPk6fwKDFt5snQaAXXGk6VzA1CnMq44M669W4wzyhKAOrkxRG0lToWkTYKkL6ZpKVGn5TAyw19wJkHPhkmYGYkpZTVqDvwDFkZKtTeW4My9DCor3iMU/gQLnYdZJ+WEv8RgymqH6RQAC8yH6GtNIKKUmroXojMAzGMEBaRUApHl4ixhkHJI7mb9/7/aifgilcm7/v8PKNN8C2nFMdveL1DWBJKL8gSKKgIA0oZ81S4sXgYAAAAASUVORK5CYII=") no-repeat center; }

.__dark .car-security-3 { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHIAAAAdCAMAAABBocjAAAAACXBIWXMAAC4jAAAuIwF4pT92AAAANlBMVEVHcEz///////////////////////////////////////////////////////////////////+GUsxbAAAAEXRSTlMASFpvJzqi67cIy5V82vYXhzUjU0MAAAE1SURBVEjH7ZbpjoQgEISHow9O5f1fdhklrsRxxFX5tZVojJp80thV/Xr9ayWjQUjlHSIzW2tDPvIVovNKCtDmPtQA0ju2lI5EgdFLGC7BhMcG1AZt0YvzYC1HPg+rwDxK3YoDdZG25no42GMDnmO6V9GOYg+r1e24BctqW2RwIT2r4FaLNcJR6iHCmaqxD6+UGEVGpr5SeZm2L/JtEqorkSdfiz2RcvpjuSOR5kaRHZGu9OXZLolEFELI59N7AsULXENBchiOUxQPtWGaoUR3S6SmsLjdQfrJxsg3Wij3NYb88u5nfw1/itr3HKHQxt2mnOW3Qafg2jBjMpc+NmX5rtp82+P8cLioA0qunvG3YLuI/Y3huC7c1JrkhHlmHi3piNXNSA4eHYNhDEnUy+8wfPdg7OgHDhx25Bp4SjwAAAAASUVORK5CYII=") no-repeat center; }

.__alarm .car-security-3 { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHIAAAAdBAMAAACEUSXBAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAMFBMVEVHcEzmUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA+8M/VoAAAAD3RSTlMAP7cI8lhwJ+migdqVyhcwaGgFAAABOElEQVQ4y2NgGCTAXDRszUwl3bt77yppzlkWKm5AlC7DqEM7/qOBL5tmBT7Ar+1h5o3/OMCPm0txamaP0viPF/zQCsemjzGp/z9h4JSI7mfDRf7/iQO+C5H1sicRqw9sbzpco8z+/6SBPcIQh574TzL4MhXo5Er//+QATwGG+v/kgQQGXjJ1PmBgI0/jJwYGPvJ0fgWGrT5ZOp2BOuPJ0nkAqNMCV5y5dO9uwRllAkCdPBii3prLAsUfQ9IX83PBsDW6GJnhNziToGXD1GLMjMRcmIOaA3+BhZFS7c7EB3hy/X2Ewn9gofUw69SE8ZcYzGIzYDoVwALvIfqmFhBRSpWehugMAPOYQAGpVkBkuVimAlIOyd2s///3CBNfpDLL9P//CWV6HCStOGZc/RHKKiC5KC+gqCIAADeCe47Qcw30AAAAAElFTkSuQmCC") no-repeat center; }

.__dark .__alarm .car-security-3 { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHIAAAAdCAMAAABBocjAAAAACXBIWXMAAC4jAAAuIwF4pT92AAAATlBMVEVHcEzUDAz0ERH5EhLiDg7fDg75EhLlDw/dDQ3jDg76EhLSDAzOCwvWDAzLCgrpEBDfDg75EhLuEBDzERHXDQ3OCwvlDw/iDw/aDQ3TDAzgf8iGAAAAD3RSTlMA7u6DnQ+4SCxo0LeB1uOhhJNcAAABTUlEQVRIx+2W2ZaCMAxAbZuahLYwUhf8/x+dIOAUV1Do01w8HATpbYKk2Wz+SbCEyGwMbIWioz0EY5gRyS6pYtEUevcOXYie8Su1RXG9V92rwSDNthGaD2Qj8dbwZC9xZ4uydfu46z8D/be7MzHZei++07XBxYURrX0RXVwHvX2QZDRFHev1iHUBaY4RdJ0DDV2KCXSVi7rSbaxUVccqIyxhhmNW2tTyKSfuUtd+MnLq/rYuo1L170iTiX3TQP9eqv1MlFIhBNnPvXE/FCGYIAkOfLsSkx0XTGupXbs9uDBhAuFaXc/PUaKauuRL48Dgyhej+etvw+ERQWT2o6Wd4eGI58Nfcfe3F5Xjb5sZYlfeDuuSeaXnS2BaqG8ihpGWk2vuOg9PC3eGEq0acpcmjrvw0K7TkKK/BAujJ65Kj6u2wSTWsYEyNN85HE/4BVsMguunHd45AAAAAElFTkSuQmCC") no-repeat center; }

.car-security-4 { transform: scaleX(-1); left: 218px; }

.car-security-5 { transform: scaleX(-1); left: 294px; }

.info { position: absolute; left: 16px; right: 16px; bottom: 11px; margin: 0 auto; max-width: 420px; text-align: center; white-space: nowrap; display: flex; flex-flow: row nowrap; justify-content: space-around; align-content: center; }

.info-i { cursor: pointer; height: 30px; line-height: 30px; vertical-align: middle; --mdc-icon-size: 20px; }

.info-i.__hidden { display: none; }

@keyframes smoke { 0% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAJFBMVEVHcEwtr+Ytr+Ytr+Ytr+Zykactr+bmUA8tr+Ytr+Ytr+Ytr+bv0VdjAAAAC3RSTlMAgfPVHQpbIsWxOjeFFgAAAABkSURBVDjLY2AYBYMJBGATLKBMcBSMglEwCrACFsEFmGKzdysKK6IJMu8GAQFUQQ6w4BZUQTaw4GYHFEFWbbBoA6pSa7CgAooYF1hsUwKKIOfu3TuENotgWDSVBaPETFYMIMLfAHG7JCfoSYl7AAAAAElFTkSuQmCC"); }
  33% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAJ1BMVEVHcEwtr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Yh8XgvAAAADHRSTlMA85UperPXxgtcFz+iQX5pAAAA80lEQVQ4y2NgGAWjYBQMVbAAU4g78GAwuhhXzZkzZybAuRzGDUByIlDszBGYLrUzZ45PYFh6Bgw2QJTFgNjHnGQgggVgQdYzKCABLLgHVVABLKiDInasAYugMAMWQag75yCLHYU60wZZEOZ2dmyC3Ni0M8ggCR5sgArWYLGdwQfTQ2jWF0AFmbAJcgD9JBoIFXSAx42TNwNXDljsEGoMGYKduQFVkLnmzDHNBozI3LyAegmI2ckAQ4wr5oyImxCaIBuqT5BD/hSqICckvtHMlUEJHiiABIUAavqFRM4EFEFgqjvueMwLw6IILozgmSbUQIS/AYqV8NFPkBDiAAAAAElFTkSuQmCC"); }
  66% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAACXBIWXMAAC4jAAAuIwF4pT92AAAALVBMVEVHcEwtr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Ytr+Zj/dLIAAAADnRSTlMA+NKulSEOezLC7VdmRRKEWMkAAAHBSURBVDjLtZS/SgNBEMaH6B2RmEqjYBEE7YSgjYhFCLYBCYggFuGiL6ASSyWljWJlYRFUFLEJwQeQgNpYSGwsA5co8UT2Gby9vb2b3VnEQr/yx+7Ov28W4Gell84vihpL5pivaxW+sEAnmFkNAT0HwQEWqoDgkYQZBPMS9lFsyVg3hkMRdGO4HEFWkmwlZqzGgb16eJ/VYLrOVPHrzxrjJ5NZHRZQeZHOACoEvgN0CPwyxGFvJtgDuCNwBKBsup4wBUoROIZbLrUFtCQxjn2M3GnRY/xq71W2HR1tRvOp4BSJOdhHDFO4lVJ2Q8JJk2VmTebCjkvQjPzRy3KwYeWjfcXvGzSOb/jAOjPavqRO3alH+B85hpWdcxd0xhNzW3Hz1vi9J1xVcinLvBZsirLa4lhQefchbPWxtmyo+x2yB+oG8mccA7wCAwwnorjeC9MsazamKfXJTyH2RQivbDTluiG66u+CbqW4HwCDJmj7Nd0soi0SSVX3wMrprudaD9Jsaz9tnX0WyYitA+fvDGRVa5Tl2fjOqAYTaiUYZlQ4HMCJkkobSntC5fS1jpbQbSrQ/xi87e4uCTRvk17cXv6m7m9HjNtgAiSFIgAAAABJRU5ErkJggg=="); }
  100% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAJFBMVEVHcEwtr+Ytr+Ytr+Ytr+Zykactr+bmUA8tr+Ytr+Ytr+Ytr+bv0VdjAAAAC3RSTlMAgfPVHQpbIsWxOjeFFgAAAABkSURBVDjLY2AYBYMJBGATLKBMcBSMglEwCrACFsEFmGKzdysKK6IJMu8GAQFUQQ6w4BZUQTaw4GYHFEFWbbBoA6pSa7CgAooYF1hsUwKKIOfu3TuENotgWDSVBaPETFYMIMLfAHG7JCfoSYl7AAAAAElFTkSuQmCC"); } }

@keyframes smoke_dark { 0% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAJFBMVEVHcEz///////////////////////////////////////////8Uel1nAAAAC3RSTlMA9XXTJI0QUsDkrlcwciIAAABXSURBVDjLY2AYBaNgFIyCUTAiAYuqA6bY6t1CyqJogsy7QSAAm6AIqiA7WHAnmrmzwaINqILWYEEBLNo3FqAIcu3evUNxsxqqbqbdu9vYEtBdXyxKjL8Bk78iHpMyeIEAAAAASUVORK5CYII="); }
  33% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAMFBMVEVHcEz///////////////////////////////////////////////////////////9EPuwCAAAAD3RSTlMAl7P3J9R368ULF0w3Zoeo/f6UAAAA+UlEQVQ4y2NgGAWjYBQMVbAAU4hb+bMKuhhL////ny/AuZwuE4Dk5f9A8A0qxCNq///HBYZF/8FgA0SZPoj99WI9RLABLMj0HwUEgAX3owoKgAXfo4h9nQAWlEcRLGHAIgixnOE+stgnqDP9kQVhbufAJsiDTTuDPZLg5wlQwX4stqO6XgCb9Q1QQUZsgpxAPxWpQwUTYNbzPMxh4IoHi31EjSF3sDMPYETbd+kJ6JHJdWYB9RIQS+IBDDEu/f9mqYZogqxgVz/AJmiFKsgLFvzugCpajxI8UAAJigLU9AuJnA0ogsBU9yP5axaGRZpcGMGztW4CEf4GAM5SLZvfdh/FAAAAAElFTkSuQmCC"); }
  66% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAACXBIWXMAAC4jAAAuIwF4pT92AAAANlBMVEVHcEz///////////////////////////////////////////////////////////////////+GUsxbAAAAEXRSTlMAlzPtBcgS+COsYtd2RIdTuNgIToQAAAGySURBVEjH1VZHcsQwDFPvsqX/fzYu2V3bIinOJIcEZwzFAoIS4gcwVVrtdZbJUDSV+wu64MzV9wusQ2hB9xssEjH2BxY4uSet+wDx2sADA47htgyBzlmA58dKZIfwTNBFkNbV+7kQVE3Rd5JXbadxvpv6DEc85ac8Cc5phN5rnIc7EqwMWk+cKs4Js3hxUy+TFzi8vTGZVwcnQe94jS6nWOK8KycK8WSWF5ViOcb6kPwCxkrDXoBqkBwXuK7F1Xxg1Y2LqznrDT4cmf4D+5Sw0PABVHD48wwXzJfdTYkRN3D3SdGuxNUQJjW9KSSWIP4FnGGQ6mavPqoJKzRU08KF8JpV0o+lfMtF5kP6dj+5d9+v8EHIRWpMr41a84xKClu7hQznJlfte+uCYPGuAiMssF2FF2bWh+4aNg3WuxvQ4/W4+ZZVL9XpuwniFVvOR2PgGXMSdYuaaszem0WW3d7v9iHxVfp87Hyr5H/y6FKWq5vtZFDK/S0rCUUqBmvfX19K9pLkZYZ9P2TlKc+9LlImiLcraHkJwvd0NBhPnI7T1mzxm6u5WR3NCDeb/pr1Yn5jrl/36Wixl/U5kQAAAABJRU5ErkJggg=="); }
  100% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAJFBMVEVHcEz///////////////////////////////////////////8Uel1nAAAAC3RSTlMA9XXTJI0QUsDkrlcwciIAAABXSURBVDjLY2AYBaNgFIyCUTAiAYuqA6bY6t1CyqJogsy7QSAAm6AIqiA7WHAnmrmzwaINqILWYEEBLNo3FqAIcu3evUNxsxqqbqbdu9vYEtBdXyxKjL8Bk78iHpMyeIEAAAAASUVORK5CYII="); } }

@keyframes smoke_alert { 0% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAIVBMVEVHcEzmUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA+n7+G1AAAACnRSTlMA89V2F7kvV5GJcwYlmgAAAFlJREFUOMtjYBgFo2AUjIJRMDJBchummOuqhcaKDWiCWquAYCU2wYUOqIJVIMFVaqiCjGDBpaiCTGDBhaiCWWBBcVTBqFWrgqWU0SyyAprngu54dsUJRHgbAJtCHzHstHStAAAAAElFTkSuQmCC"); }
  33% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAJ1BMVEVHcEzmUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA+bXBxUAAAADHRSTlMA7UYNG3pixDLarpRcYWISAAAA9UlEQVQ4y2NgGAWjYBQMVWCMKcQceWYqhmDimTNnShBcDwcg4QUUO3PSAaorS+bMwS0MbDIgwTMFEEFFMGdrDZg6cwgsxnQGBRwDC7KjCh4BC9qgCiaABX1QxE4zYFEJtZwRRVABIsiFLHYQ6hsmbIIMa5BFG6CCMciCAVBBHWTBCQxY3HSEAYv1h6CCHDJYBEFhd3I5VFAYHjfZ2xwYciDubECJIG5wZASjRVvgmTOlDRgR3OFAxRSUHcCAJbUczzqJZi8kkEWwCZ5G0z4HJXShIAc1eJAFj6EKQpJbMYoYB1Ak/OAitICYAzQPIyy8xBuI8DYAJtL0Rc3itaAAAAAASUVORK5CYII="); }
  66% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAMFBMVEVHcEzmUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA+8M/VoAAAAD3RSTlMA6gtNaRn2KcaC2DqTt6gWtpeYAAABxklEQVQ4y7XUPywDURwH8OdKimKQNJGItDGIDaNE0jKYlDN1QgSJiEStOhCJwVQMJBJhEOvVYjVoIrFUbCYSi01OKaE8d+/u/fm93xEDv/GTe713v9/3V0J+rprU0eR1BppRpE59QK2lrKYBFj2k3YqFfaMzCjZyrCh4yrEcl3jDUfnRkDC6IXBR4q14MCbxkkk622tR+KSxSWG52KkZO/6g47PyeaKeCKlD+Ck6ppRNSBVC+g3WB2FTEIaCXkQsHd3Wn+gYdTASg/bGJr8ErG3Ai0ZOeckOb/uoxDUxH9mTsonD4TZIlKW0UtQ+x5KCyxxfgsL1qKBoyoEa2ByKkcyhbapY7WErXI1B1+ZNiOEL2nIWJ/9S7ZiMXXqIsB/03ki7Vxxjw/Qva6Ri1D7nG7LiYQ8bT8HvyjuzCEo3QVn2VrsLYpLhBMocenLVQ5j6vIcg4GW8/xKVfwp5nIyoyKecUJHnoUNbbPx6HrzwQgCSY6e39z42i8YPFUz/DnYeDKiB2ZY2tm1aXs+gAWczfxcgoy9JAtLyOjwH7+c3ORqEFe24hXeId74EMYHWWizhFdwhZ7B79p12d4tOEVO//Phs/hff/QUdBRMMptyjSwAAAABJRU5ErkJggg=="); }
  100% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVBAMAAAA4Z+DMAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAIVBMVEVHcEzmUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA/mUA+n7+G1AAAACnRSTlMA89V2F7kvV5GJcwYlmgAAAFlJREFUOMtjYBgFo2AUjIJRMDJBchummOuqhcaKDWiCWquAYCU2wYUOqIJVIMFVaqiCjGDBpaiCTGDBhaiCWWBBcVTBqFWrgqWU0SyyAprngu54dsUJRHgbAJtCHzHstHStAAAAAElFTkSuQmCC"); } }

@keyframes smoke_alert_dark { 0% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAACXBIWXMAAC4jAAAuIwF4pT92AAAASFBMVEVHcEzNCwvPCwvOCwvhDg7jDw/JCgr2EhLkDw/5EhLLCgr8ExP3EhLYDQ3KCgr8ExP5EhL5EhLoEBDaDQ3UDAzhDw/uERHMCwvHSygYAAAAEnRSTlMAuE306M0J/hx6gCzVZNORsJGzK14JAAAAZUlEQVRIx+3RNxKAMAxEUedMDr7/TTENqiwa6PbVf0YjSQgAAAAAAPhNjlN+r8LsmxiLX9iu+EfkOnuSwHTDSgwXmoNYbvBGTD9TO9Gq38na7DLpOiZ2j7uTTgT3cmg16uQ+eOsFChkG1voOuW4AAAAASUVORK5CYII="); }
  33% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAWlBMVEVHcEzsEBDiDg7TDAzwEBDiDg7cDQ3nDw/bDQ3pEBD1ERHYDAzlDw/NCgrdDQ3JCgrNCwv7ExP3EhLvERHnDw/sEBD2EhLzERH5EhLKCgrwERHiDw/eDQ3PCwt6p2bpAAAAFHRSTlMAcCyZxTxkDUwa7oCnwunz39yP6YtSGQQAAAEaSURBVEjH7ZRJloMgEEAFARnj0MRAR+5/zVZ8KqQDusgiCz66KPwPiqGsqkKhUCgUCm9pmivS0BvTgzONcONB7P83BrdOhsxGH4kNQH4APsA5otwcoECjfDSjx4wDQFuwgncNh92xNIdk99CY4bEn2DxyHFvDctoQLPY3Tbja6ift4dCT9xQ8Ogh60avQXScajDygU4h44qSH4sv21O+b1vG9ks8UNPLgdM2r8G1aQBJNEbfXGmlIXZMlGRBpOF0a9WGJbMUJn4MS8LQmIYZf9iuhNbigkc45p4h0Hc5p1K1Y51p26ln/1LkBO7vi5lfk8psNt2rW0szENoCkPRVoKn320AutULaVNLfLyzra2WAn+8xkq/AnzvUPS3U3pA3BK1gAAAAASUVORK5CYII="); }
  66% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAUVBMVEVHcEzbDQ3lDw/0ERHjDg7WDAzUDAziDg7fDg7hDg72EhLqEBDdDQ3gDg7LCgrvERHyERH7EhLYDQ3qEBDUDAzQCwv2EhL4EhLbDQ3ICgrlDw/zwPagAAAAD3RSTlMAcFfrL0XEGwuLt9btpebFsOBAAAACBklEQVRIx9WW25KrIBBF5U6DmqBJlPz/hx40GgG5WDXzMGe3SamsbJCmMU3zEwmkCDFEAS1REsxXKk9KZXzhHAfGXAHpFHFEJDllYnVJO2OmINy1TNlNq8zxMRM7Y3iz2b9WRzj3SqaETgPEScyoI1GCMgz6ZaaX0xTGpPY8kfVyWqGztn6lfmWAXR+/7lXVkhGaabt7B1rSvpxVYulY3esijiOZNt/vLvNcILeqdaH5tsXCdVf83MTgW13LczS6zsFnLVXtPhXCKqDea1jo25gLorD0SntMiqCoJgUZ3W/jQ58rF1J2iQKnZ+qWrG99BlGKQ+P4jiK5AVHXECm99al3LJnk2Nv15R86sz/yyA4yHA2xVuQ2XBRgLL/RO3Bej3cLovjeAO0YDkw2/4PklWFK0POsUQ3D7byKnydICrrfFHze9A4Xv0R8NWg74Zk5DTOPehnW28MAiH/Odx0ZZMOOzQkd65oPJX0HKIvYMTWihHnLteTH/Zy0wyMTQ7Bcu0dObVhrF7mGZ7DnIyx2lDWEuONnOni4VJ5Zheuqy3JhHdOLXMP69S7veIj1cY1IBICXwaAAK/xThINCxYoD6xjLEa3WJKXij20lGNAFDPXWWo472xefkdmvenGNs1Ay7C+CyONs4Y2Afa7w4NzDeD73dDPitu9YaZb7bVy17Iuu5/Q38voPcc54rEKkKVQAAAAASUVORK5CYII="); }
  100% { background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAABVCAMAAAD9lw3NAAAACXBIWXMAAC4jAAAuIwF4pT92AAAASFBMVEVHcEzNCwvPCwvOCwvhDg7jDw/JCgr2EhLkDw/5EhLLCgr8ExP3EhLYDQ3KCgr8ExP5EhL5EhLoEBDaDQ3UDAzhDw/uERHMCwvHSygYAAAAEnRSTlMAuE306M0J/hx6gCzVZNORsJGzK14JAAAAZUlEQVRIx+3RNxKAMAxEUedMDr7/TTENqiwa6PbVf0YjSQgAAAAAAPhNjlN+r8LsmxiLX9iu+EfkOnuSwHTDSgwXmoNYbvBGTD9TO9Gq38na7DLpOiZ2j7uTTgT3cmg16uQ+eOsFChkG1voOuW4AAAAASUVORK5CYII="); } }

@keyframes blink { 0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; } }

.controls { display: flex; flex-wrap: wrap; justify-content: space-between; width: 330px; height: 110px; position: absolute; top: 134px; left: -100px; right: -100px; margin: 0 auto; transform: scale(0.7); transform-origin: top center; }

.control { cursor: pointer; box-sizing: border-box; overflow: hidden; position: relative; margin: 0 auto; z-index: 2; width: 110px; height: 110px; border-radius: 50%; border: 3px solid #b0c80c; background-color: var(--paper-card-background-color); }

.control:active { opacity: .8; }

.__dark .control { border: 4px solid #000; background: linear-gradient(to bottom, #3c4042 0%, #141c22 100%); }

.__dark .control { box-shadow: inset 0 2px 1px 0 #5d5d5d; }

.__offline .control { opacity: .4; pointer-events: none; }

.control.__inprogress { pointer-events: none; }

.control.__inprogress .control-icon { animation: blink 1.2s linear infinite; }

.control .control-icon { content: ''; position: absolute; display: block; top: 0; bottom: 0; left: 0; right: 0; background-size: 60px auto !important; background-position: center !important; }

.control-left, .control-right { width: 90px; height: 90px; top: 10px; }

.control-icon-arm .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5BAMAAABTxLEMAAAAJ1BMVEVHcEyvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAoPa+wnAAAADHRSTlMAaO9YqzbTHw6ZhEaCJpKPAAABbUlEQVRIx2NgoD1odDtzJkWCsLqQM2DgSkhdyxko8MCvjlUHpvBQAF6Fm87AgTY+ddxnkMAGPAqLQAqyTDcvA9HqeBT6AOWTQQwzIOMIfpuPNIBYHD547WYDyjpAmCxAZgJOhTFnzhxrgDA5cs6cOYpT4ZozZ07D2HvOnDmFU2EOknVAZxzDqRAYLQtgbC5g5OBSxwH0gAGMwwzkNOBQyA6UA8Yw98yZGyBBVYBfIeOZMwLA5EFXhRyrVq0qIEYhFIwshawuYOAIUijiAiwvzrhgT+PMkMx3EqRwDoQtMDgVpkA840ZI4RFY8PgQUHia1djyzJnJxgF7CCg8xQ4u+A4VrCGg8FCADYg6zErQMxmcIHJCG0GFR0CFybEGH8LhKAAsJNUZiQjwo0DaIIYIhcca5pwEWU9Q4RmHtgyWM8QoPMgeIEOUwkMB8NoGv8IzWovOEKcQAYaVQgPsxaMOurpDOEr7MCU0kErTxgsAhUTsBGO7usoAAAAASUVORK5CYII=") no-repeat center; }

.__dark .control-icon-arm .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5BAMAAABTxLEMAAAAJFBMVEVHcEwgQFcpU3AePVQkSGIaNEkdOU8oT2wcN0wlS2YiQ1wrVXMjzaYKAAAAC3RSTlMAaO9Woxg92S64hErfnUIAAAFYSURBVEjH5dYxS8NAGAbgFJs2OnXQyU0RxCzBig5dKkaKZIkiuBb8AwXrYpfgVro4OAhdxEVIJ5NA2rx/zjuvp6X27jsQO+g75D64hyP3HRdiWb+f8xbQ3aBdHx95otwlpjnVu0pPwrythfv4zLZ2QcxEt+QFB3eH16983NHAIZu/4cURKyZqt8KmM1EGrPSUcJXNPnwrF2TAuiJr1qexEo6AVNYNoNDtpSPrqm43LvAs6zUgUTl7dqe8A6EGsuOo+H5bHBIBS0Bt6TCO49AETvO/IDs6nmMO1/0zBh895UXgd4HDQNS15cLCEHbFZloUnMj2DAmYOvUD4KQeNQhYOC4fkmhEvaNYKnXIzdyW+bN5RcKMf0xyK6D7WLsHdksGDR+z0RsYwDwMMrtnANGsdsowgW9OtGkEk0g0nYTYe4EZ/Mqfgovvte3Ou0TxqehvzYX8X/hR3gFZgsEliNAjcAAAAABJRU5ErkJggg==") no-repeat center; }

.__arm .control-icon-arm .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5BAMAAABTxLEMAAAAKlBMVEVHcEz///////////////////////////////////////////////////+LBpLMAAAADXRSTlMA7mlXD4eY2netOSPDtvUeQQAAAThJREFUSMdjYBhUgIU4ZTum371YZkJYnc1dMMgmpG7PXSgIwa+OWRam8PoGvAp178KBFD51TAh1dy/iM3ItSEWp1eJEEF2CR2EtUP4UiGEIZFzFrY4DLs1yFsjEbbcjUDYAwvQBMhNwKrS9e/cmkOJ2ABoJDCcRnArn3r17G0jxHIAE1GWcCoGmTABSuSB3+t69ew1nqgG6ywAcmECS8+7dO7gUckF8uhYcK8AQuIhPoQPYG9cdQObiVMgMVsgDipUDRCjMvQsOdiZCVjNDkoQBQRO3lxfevSteXk3YagbWu3cVGBiooZBrDlDhzJmTQQo1Z04HcRbgNBAIboAU5kLYCqMKRxWSpPAay+7dDsQovLgAknsIKrx7sbxcliiFSGBkKjTAXuDKoqu76IC9qFgjiAZOMQwtAABuciE5CALUwwAAAABJRU5ErkJggg==") no-repeat center; }

.__dark .__arm .control-icon-arm .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5CAMAAACWNFwNAAAAS1BMVEVHcEw0tukqrfgzzvUqrfgu0fo82PsqrvkqrfhTz/IqrfhMxu400vgquvpA2vsqrfgtvfovyfswwe8sz/kvzftG0PRX3vgtr+ZCvuu8PNMfAAAAF3RSTlMA/izRCZ+uPRX3Gv7FSLwgWHDpsYXm4d2MjncAAAG9SURBVFjD7ZfrcoMgEIWzK4RFRCTeeP8nLQjapMmkAzptp+P5kagZv5xllwUul1PPYjUKobVAJHYAjdD21W2eZ7hVvMO9SEIeYKugsruQzNh73IJsNJUDkc9PgtHWpf6wn1/JDYVEs/HAKaUcbERbFDUN6/tqavkwXJvRrVHrgswwHfMBahqEIUY16quClBksDhhUK2hLejdGorIs32B6tY2Fx5ZP0mOqx2yLFCvGTSKR0reN46i6XItYLU5kjM0P6BiJaSQcz020gGgQY0VWIRGByDooipl10ci13mw5bu6sj7nA4S6b9ZBmSAjTNMuNFEVVvYw9dWmOjOGu7suAPAE/KzzE6RNTCGQbkMVBW2cI2+uQGQ6QQgbwiTE7HTI9Srl0BVBSykmbvQ7Jr1Bds5SQFgKpDEipVzuLiIYwAv0FoujTX5mMNZDZKvWuKmhIQOThbvslo+PQw1riWhGBonp4fK1/D1ifDk+Hp8M/4bD12znJD3PY+BZrbSeOcugXZN+r/cniy9Nih8uRwgvm+SCHr7XL4V7g6fCHHKqMXTHTCr7BgZM5px+yfov0XlPe+Sxskd4Ld5xy/5k+AB0OeVyoRAdVAAAAAElFTkSuQmCC") no-repeat center; }

.__arm .control-icon-arm.control { border: 3px solid #b0c80c; background-color: var(--paper-card-background-color); background-color: #b0c80c; }

.__arm .control-icon-arm.control:active { opacity: .8; }

.__dark .__arm .control-icon-arm.control { border: 4px solid #000; background: linear-gradient(to bottom, #3c4042 0%, #141c22 100%); }

.__dark .__arm .control-icon-arm.control { box-shadow: inset 0 2px 1px 0 #6ecaf1, inset 0 0 0 6px #2bafe5; }

.control-icon-ign .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA6BAMAAADVUMOiAAAALVBMVEVHcEyvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyArOdMeMAAAADnRSTlMAc1YgvOZBEM+V3LAv8rYolCAAAAHoSURBVEjH5ZW/S8NAFMevP2yp7dCMLiVU6ehgcFQEnUVXkVDdlS5S6dTRqXRzEKTQrYN0VITS1UHp5haMtcWU9v4G83LJNffugl1ExLfc5fLh7vt+3DtCftTie2HrR4MxGrbyPwHThmFsANN2J8Y3sUwBWF8g6L8EnmiatgLgoQZWWSw6lO5EgQUEvkcVGeLoCJ+d2vWG9QBoE1Ih++6kiXZqDLm7nunB9lORu6MuWK2eBdwEVi9g9imAyxRAE/lwy/fmlsVga67jFYCbxwfdj54I6uwYMAcA0xebQuAkHNI+A22vCBEIEhOW/1FnIPPKFEGQmAw+bAZSL/Q96miaJUjksZ9VGKjLKQaJ6fn+R50ODHkhdVxiBmedJXNbWAKJL2pwSVgCNQ0J9EoziSXGJI7djSyWmIBb3ZAEuWAoPC31tThg4HQe8KBenkVwgMFR1TU3yGnkz5u0o38OjqQabOIkRIFlkjBplMb7K/5vhEIrek3IZbDoyK1AALmjY5JTZybj399NrqemzjV5OvaGnBU43ZPArnDD/WyU41RdZqhLzciWDOYVfc8RytFm1YmeEi9xYyF9PogbIHScwbkMfuBeCjV8bcqgLT1d7uIalcGh1J5rdFZQgF35NSyWioKtEnJaLJG/YV8S/tMXC6BFmgAAAABJRU5ErkJggg==") no-repeat center; }

.__dark .control-icon-ign .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE0AAAA5CAMAAABEZFZVAAAAV1BMVEVHcEwjR2AoT2spUm8rVXIlSWMbN0wjRmAZMUQiQ1wpUW8oT2wrVXMhQlodOU8bNUkoUG0bN0wbN0wbNkodOU8gP1YpUm8aM0cZMUQrVXMiQ1wbNEknTWnq2hZQAAAAGXRSTlMAQrji7qVlEYkzdtD6CFTLZAwcdd3uiqXuqI4Y1gAAAgZJREFUWMPtl9uWgyAMRSveFRUv1dHy/985agkCQqideZg1q+fJS9c2ITmB3m4fZQ71b9Hui13NW7Rotqv80FCF0S4KlEio/EmjMKClv9F2CdDa/0qr0qd6oHUp6A2XPoQWoD2khqu8bJnd4tk1WI/B5nnJfYBamTSJCRtzofB575kjdfOI3bCwgjdc5JpgXTAsfN5p7VqyE2wuxO+6Ozy5I4UYtk/utEmt4im06XiGFCKegRbbFh1Cq7mlEHWzSYUXKA1Cawf1aSOXctMSKDVAaRBaxrWmSzTnKcF1GC0SoeXGeopCCFqoTkaEBqE15otJpfHuoJHt/msVP4fW6q0mRZc+WSW+T+uDNrpdVJitptR1l7hJjDJYBaFNdv8fl71RBiy0AB8DsOye7U6EVg3zFVqIh5YGQqGTRnRaWawq7asm5x53wWip04il3wodliOr56fRQAzJzmLUyzS5szybaeIILfTTIMbUOpKvxqbWy+YGDy1gjJ1txraWa1CYtaZW1+6JZhzvXuKimfmSV6yleiGPqUKriJmoZ9G2LVfrzFSZ7LeWGIlOXp8WyA6bllqiPffSauy81UVKoi5HsdUmhbjGjyY5lYk6HRUcg5ZW+NEkoJCo01EKjbx4Gme1szkUGvOe4vYlobm7OQ4afeG4Oa7JEsRRkkbHK0dph+RPqs/f+T+kbzvBsixVbwt2AAAAAElFTkSuQmCC") no-repeat center; }

.__smoke .control-icon-ign .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA6CAMAAAAQoC6jAAAAOVBMVEVHcEz///////////////////////////////////////////////////////////////////////99PJZNAAAAEnRSTlMACY1CVui58Zt3LDeBZA8gwtH2qo16AAABg0lEQVRYw+3WR7KEIBQFUCVIG1H2v9gGAz6UDIP+Vf8ODaeID5rmD4d8nMkDP8KZf/CnQUzZmTkIDviIhjt85fbY9bKPb2l//fNeflmeB8zz3GCm5wRTvZGc0ZOyEh2e7iHhSdc2o/amKG+q7PXl3giHfC728CooKK2lHtnkO1rP4/vLHVzUNi8fP3qDwh+7tyCVnmuwiwUd7Tu6CAYNRYJPj7QGKLAxC2Hw6c1XIy8QGU0Ogm9PMG6Am+6z+o6qTT8nefKhAYrlAlcRjNWTFaiT0b+PUaXF5z1CovZGvCf0yTfU8cDSZFW8e900rIoHTh35PdtvfiEPeYulCToWdoJ3Lks/uCZ4MaDyaKwn1iAovSHeC7cw0bOBxhGQ6lnA40RlmZ5l2cBrULoHQGqAe7HI8MBebueNmVeRp0ciPPMexs3LzZLh3fXQemdP9+6KXeBhzvnwOlMK2jeA7bDV6C8EUY3xgyCuMR8ApFXmF4BT0JM7qe0DURN7fERivAr5da88Xxl4pLPhzoSsAAAAAElFTkSuQmCC") no-repeat center; }

.__dark .__smoke .control-icon-ign .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE0AAAA5CAMAAABEZFZVAAAAmVBMVEVHcEwqr/kU5Pkqrvgqrfgprvkqrfgqrfgqrfgqrvkqrfgqrfg7vfohzvsiyvto1/RSyforr/kvv/of2/wM9P8/vforsPkprvkutvkR7Pwqrvls2fZS0vNt2fcqz/w10PdZ0fZe0Pga6P00xPAW6fpOy/lD1vU80vo0wO4c8v4tr+ZOxu5Cvusrsucqtekxs+c8uuoZ2/YiyfAWhhTYAAAAKnRSTlMAPPszKGoOBQsZEx+IoZXxhEd8r/tpTlNe9Czp7eOMxs681+P4ouSp6dccZs6LAAADcklEQVRYw72Y7XaiMBCGGxNJCIIGC6TUitpqd/kQ9f4vbpNAUGpAsOfse/oDOPgwk5lkZvry8l+EMTEL4ydglhNDk2KHjscRtF6a5SEymkbB7mzWF6DjaexPalS5Cu3RNDvsoKVZNJ5Gu2hlQ8OEOko2JfhJT9MVq2iYxiGfCvEI2I9o8JApnRqbas2rKGAbrF9r/Y0fhJnYgAdC/l4v196X9wFnDqlg3qRQn8k/2CPbXgi1xZIg5ta0fM+QWiW1SC0YR9bAJI7X2rb1jTsjYSJetpQDPE3zgKMeiQiSkTAagzCSmjaeulP1IASx/MYYmPj2Wx2vic6MSRNBxh7C8PWkETB3cjwWhfrTNHEp7/N5EF1hgREml8nC2k3tiGEnnN5nU7cXhomNWODWJ42Arbtg6QCYhdhs93oQOY4t6qAeWN6GxQY3iePvXi/lilERShZx7+04zDIFEwYIXbe9BXeX6twiaCmD1gmb38OIDQEDANk6tS2Q1KegBZO06PLyJwxStcP4TmrZHCMEfmua4vbArqnhs1jRkH+ROnt634knA2g/YNxzIZW/rfbxaddUC4eXksZjFCYDYcLlsy+ss2BFKzLu6BrAPsU7B59zP+mDfVVLWsGKcsdBDENXHzEI62onIcc3octgWFpelq7nucs6E5eQ3IahOEr1wI4tmNB5InSuX0mApev6TPledGRHB0z9ptklSTsM/dE0w25eOrCG1lmKh8JEEJndCupJqHwSdttQUEErs43Q55OwtFhFLdrKj9g0eRJ2255UNI4clhhg9QGVv/fByp+0+306HHZv2x1tDMxgG4mXMrBPwEw07Cy22+3mNB52lyGSJhpxwPj2NBp2S7PAoSxllyeGBIuicFOOhaWnVbMXCFpsdJcn76JNPhKWypLXNDEIBItmDiDCOn8cLD1tro2/bIibzkFWWBANgJV5luV1BuQbYLW6mlaPNBtgWb7d7/db3chC0tW9Qb+BzbrdzL8j0NQFH+FfwQQN2nXNKucdE85gmKTRup7mG/P01YL5fN0Tzfw7tqqSUmYL42TYggXM/8p6tEaiv1JXH8Zxpg2DThgsuhUA0aPBQF05xDjk3sKoSEPULTlFY/WGGEmMfvK3XCl7Vy0V7pVuv3FXcvj7bSUePzG/3w1rCEIAAIwd69ewm/9bPMX6B91abrAg5os3AAAAAElFTkSuQmCC") no-repeat center; }

.__smoke .control-icon-ign.control { border: 3px solid #b0c80c; background-color: var(--paper-card-background-color); background-color: #b0c80c; }

.__smoke .control-icon-ign.control:active { opacity: .8; }

.__dark .__smoke .control-icon-ign.control { border: 4px solid #000; background: linear-gradient(to bottom, #3c4042 0%, #141c22 100%); }

.__dark .__smoke .control-icon-ign.control { box-shadow: inset 0 2px 1px 0 #6ecaf1, inset 0 0 0 6px #2bafe5; }

.control-icon-out .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA6BAMAAADVUMOiAAAALVBMVEVHcEyvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyArOdMeMAAAADnRSTlMA7gl+mcn6PtxlGVOwK0/75RoAAAJPSURBVEjH3VbNK6xRGD8Gd3jHexc+VjS5dZd3ISQKCUuEBXWTcruS1DSKW9dCFjYiSREbzUoWkohsaBZWFqJbd2M1lxlzfTx/g+c857yvV+9z3rH2LGbOmfM7v/Oc3/NxRogPbaHfdZ1NM7lxfwZA2nw8B+4IlGWyq4G46Qw4lloJwH0Fj40mjDh72QuESiNwktarOuq6aEfGdHg4Jl3rJu5GibwNIEzV6smJRPKUVhSXLuRIgkMNOBtjgSW4Mk7n0mcY92WrOeAWur9PO9T6NW5s42KMDI80+qt8s/GHewaY7xL0wBx9nwE8McAvjkt2TDMX4NYr1sV7Zz3rysA4OQzQS4NtJKJLiVaAUr+KMWe5BzxbHn3ACEalWlg3zX0U5iGZ5KjsT+7ST+Io6kmeippigDQXl//imzfL0gkbT/EBi+jSlx7gdxFCv33ZmwfwoKRzCFHUZUbITwD/9JWV9QsC+qrxswIWeAlZoDr6lVISskcX6QiWKNyIJGQvQ/KgFeoGIIEoT8YnDzp3p10gk0eygke0uHsauK9OufMnBagbzmpgjSkpZJolVWqBbGhJU5o5iYvyDNoYyTlVRW1sKaSJeBFL9RJ+KPHjfHGhY9EFKUx4+JncTRsaxYSwy1TNRxaM5UoNIG45vcESOzhPckAZkwlPs0TCVMLYpNrd6bqxSYlfuOT2+GlHdcYispFmW4h9LaiRimMK3lLTZv0ABBCiem+b/bj5+dh9U65XAQ/NySvO7eb8i7nxPhzalPKz/CDn82oddp53nH7svxovy4/4ULT57IcAAAAASUVORK5CYII=") no-repeat center; }

.__dark .control-icon-out .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFEAAAA5CAMAAAB59jczAAAAY1BMVEVHcEwkR2EqU3EZMkYhQVkaM0cjRl8gQFgfPlUfPlUcN0wqU3EqVHEqVHEbNUoZMUUqU3EqVHIpUm8bNksaNEgZMUQZMkYdOk8qVHIqVHIpUW4gQFgePFIhQlorVXMpUW8nTmpZv6cYAAAAHnRSTlMA/lRoBIMs/hQ7/vLalJ3M6alwIFpI6LO+gMsL6tmOR5zAAAACrElEQVRYw+2X626kMAyFAyEJ9/t1ZhZ4/6cs4EBCBlrDrFZaqf5RjWj7zXFsnxhCfuP/jadHGYsZo5X7N3CcJb4vhGVZQvh+Ensf8qrEF2OvYrT8mj7v87zE13EQg6jLu8cXH/CAmRS3DjCx+rMY6+pGxrUSGLRRl3dRFmoy6eWSiEH+cxrx7WmRb1DBLip8rbzcqKy9Mq+pdF9SYbb1NHPkB6dbkVdas5HAXNVJk+QF8NsXfoSoLIqtHsX9H0fhUyhPjM/5DcitftT6moNKC5s3g5wjokvsdZHEhu9skLMCEkMNUMzNroskGXQ6TiQFiZ4hcRKpnwzkjTvJZvnblhgSDZHQQxbGh9zRLIuUaIiEcmPmu4RZWU7R9UrWJPVqGaOfNIx60Ibt8ggziwyGZUIn9eLe46AMYlycvE4mUL48eaCPcZoWJxtOzGwIJ5l8+RQgiKGqdHZCfMx5PwGOmERoCzDp6BxICIwi/5kIqcqvPkK2z7dkvo9eJx4gVyCeqGd9gNyA+KzNr253wHQDOrvj+S6AoPz1sW+czT84XGqI7okMCwj2WW9ZUnSH61M4u4TR5uV+EiKMU+wtoDIqsw6ya70Zyg8H2eySmwy439s2jH+A2qrynT2Dkz08wmEmw91dlOEuLqhF4mylDiE3PqsfQFU8YPtb2fPIZKlDG9jTT6+VkMp6M3qESDEXp0hz7QZzpiVlLnYh71/0VpH3G9J9O/piBg4XTnGRIidPlCeLIADTC4t+IdcQER90B/WHizkvMmT3WXXpmLu+6M01CxW22uOZWrpdqnb97uqSawcb06+nO5VSFuuvIpeBU+La1j3dqWK+Z9VmbpMb4Wan7woPTu6FHR7ygty5/dLlHDDT7oO3uHnseKRD08x2yOfh2nkUZVnU2Zz8xr+KL7RAfPPkQxhJAAAAAElFTkSuQmCC") no-repeat center; }

.__out .control-icon-out .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA6CAMAAAAQoC6jAAAANlBMVEVHcEz///////////////////////////////////////////////////////////////////+GUsxbAAAAEXRSTlMA1iZofsUH+hTvoEdYOOSRsQ7S9X0AAAIkSURBVFjD7VfJsoMgEGQZZAf5/599JiCLRAPmXVKVOSVV2PT0rCD0s6+0xVLwygPV4h/QCDAesmFvP4PTLBwN0+U2nO3hHubMTelUODNG7oiHw7lJPe+urD5nHgD86ipIOhuNHFpZBZZAoQ33+MljTM0OyWc4it25Nacy7MALJPJ8IiXXjgSpfutE3w0Xjkl4Vb6pgIvvJCGqUYfT+QqP8PZvOjHoNMTTHtUEt5rrfWBjFRKvr1x8EmwoIjVBkcazuvsc97Ko8RDX3hDeiZp0kQOdR/ATggeK/bHLnIlXC2tAsVzVnOMVqBWVI/49oN/FMUx2XYanZgG71GxUwq0ulvW0e+GNJInY7wFxyQd1gYeWyPZ9+UU/CTpHZBHEVQevrLlYnePVrlxaaDzxPd6C5gBl64k/wxt2+XhxG2uX8YaDwg4zqJ3NPAPGtOETid1IkI20PYSNlp7LNXvQ0LRSDJSeaLuXPgBC2xxGtpIo2tq274BTC1un29feYG2d2kwjstYtbKbBprOs8MWmLGMpzH5mSkGtlgyuLA+PddFWyrKpMcr1c2C2u4h5st3H6OgOllR8IIpO9S0RiZsb9Lk6+OuksG52Fcm7Q1Av0oLy4sD8eujMcrbGzy2IZeF0UDqUoOzmwlkjbpgKKKWgMA+38Yr0L43feVmIizF651nxyOLXJCXcf0vR/rHi4LMnpPU1plN6QR+b0Nvrdt3et4agn32j/QG87kjWH62zugAAAABJRU5ErkJggg==") no-repeat center; }

.__dark .__out .control-icon-out .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFEAAAA5CAMAAAB59jczAAAAolBMVEVHcEwqrfgqrfgqr/kqrfgqrfgqrvkqrfgqrfgqrfgqrfgqrfgqrfgqsvkqrfgttPlYzPBZzvkvvPo0vvpn1vUV6v4M8/4qrfgp0fsry/tLxfkzx/oh3vxYzPMj2vwX7/4f5f0e2PxLxO8y1/RJxfJf0/kS8f40uetl1/kd2PYtxvA92vctr+YvsedOxu41teg6uuopuepEv+wjxe4X3/cd0fL+iqIXAAAALHRSTlMAHwhWDSlGBBIZNzA+TyNe/adncOzc/yWahIh5xdyz686m7PzStff0yfDo6jzK2ccAAARvSURBVFjD7Vhpc6pKEA3MwgzLsElAUVETuVkEZMn//2tvNnx6kyowSdX78vpTKiZnTvd0nz7jw8P/8VVYJiTUEEEJgdaP4SAxHBd7IIoj38Ouw+iPQC1IHexn66R8FFEmu32MHYNYP8DzsuRx+Ojbk4i2/xgek71vG9/jaRGE98XQV6eb6IdyCxxq3g8IqZsnQ3v6HNVQZJjdS9OCDG/L/hrn6ud2WAN0XzUtiMBu0CDVuavrIKjrumvGX30kkXMXJEz9RBNsumBzXMUAgGgVbupOY/ZFfA+kyYAGbLrFMcY2UmFjPzycFWZbRAjOzpniXa/yDV58N6XQJIZnEAgJs0F4aORnbQGYObdt7P2H/KduscKpyM0ycBGlUBTYcONNoxLfYTovb4jiQQPGtmo8aO/bHZZ1420KnhXkU+bAmTknlQL0dfEtA7yennJkqj5IPQ1Z+MYcktDJZBHPi9jRbQztbXtqNEnRCeBZnnleu2QeRZlzsLI1gqR4upCUdTnIv3maQ9JES0mxe7nUXVRRdNKFJL+7UJHc2tOVJO5aNmIQaUa8bv6ruomcl0EX1pMkm3dv8rotKjPkFF3K+4+rd+qArRKM8863kVRySOysUoegSUS0bGUVc4cyod5+nm1ftUI8rfdLoeQ2ogj8kYdMp82vVaaz8BBe7tdJ8cgVd9S06mMohZJvl16KnxXtydvWZeRJs6i8qPd1CCUvM2ZnYyGnEPGbRAwdilZddfoqmiC0CYrlh7VvTCBST9anXiJI3K8hm+CIDWioQtY5m7gaCtTRMbN4130FyRliw7w6eiZixI8WkIfqM6Ar5IN6b/chxiIZ8zPkCHgH4k0yFq/ln5s9WIdYCdz8Ouq71tJnMfB8w3EcTiuVd10Fk3dNXNW5o05R8HaDWMep5GQ6mZ4EOnNmdOdahn/b412mOOpJOG8wmZ5rJQGxKiRa3l51pwZZS+apO07OtaUrrtOGzn50AWoRXH6fKUFZTWrPWMjTU5Ty9KBMrjrXi3AjMZt3kaZFvURtjml9FBpeKTJCw8WYSzyAvdWGT1D1DgzR+moXzUha7pmDIrnkm5A3UyPwuA3l5lRgimmCKHrVQs+sWbtQmQZhQyiuF0cgLag0qOEhyBnhJqbVmkfm7WtVyTbxkeGF3sXSShO9yhny1r1qRp9Z8zxFfpYk+ySyEaNXFoxjGsgGa2VihEzO9D1uqPLuiyW+dZ4WYW6UaFf0Mtf3CN+kbUhbbn2bkXGniqeIlxXKCHITk862e5CBTaV3VbH1sdipVOxZF2Tam1dXJmZeKX1t6bjnLhO+U4EHQL7flYO2vt0iv8s2Cx++OY+a2A/8dVSUV3tWGEHnXmufesfrJdO2bXUl5C++Q+5+fhjuavTcf22abhHi9BvPLpOIEdGS8+9aOHecoE3hwzeC0+Q+nj84RqZVw+EWx8hlP3hrGg6Ows2mlhEsXo65Z38fTze1cGj8eb2KI+AJV/Yrj3buIlnKxJcAenp+5bsF6/ew/vv4BwYI3chyS66EAAAAAElFTkSuQmCC") no-repeat center; }

.__out .control-icon-out.control { border: 3px solid #b0c80c; background-color: var(--paper-card-background-color); background-color: #b0c80c; }

.__out .control-icon-out.control:active { opacity: .8; }

.__dark .__out .control-icon-out.control { border: 4px solid #000; background: linear-gradient(to bottom, #3c4042 0%, #141c22 100%); }

.__dark .__out .control-icon-out.control { box-shadow: inset 0 2px 1px 0 #6ecaf1, inset 0 0 0 6px #2bafe5; }

.control-icon-webasto .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5BAMAAABTxLEMAAAAKlBMVEVHcEyvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyArbOiNNAAAADXRSTlMAC6vxy1+QNUp43yUb5Gg5rQAAAiBJREFUSMe9Vk1qAlEMHn9HqwXpUih4gS66bgfsAYReYMAeQPACgqvuhF6gUBddCkKhu4LQXaGLOva/uUtf8l4yM883D6HQrKJ+k+RLvmQMgn+w0sWOwIP+jsCjc/buvbhy0jFe69YLvN6w1z324WrwxqQG3mIn8Mk1QM/Xm4UAYy+wDJy6FYEvdQywlkdePJkjgES7M4DXYmAdlI3JHQBsioHPCCQOIXpXhcAR/vwtsU98JRo2VfQ2xWMhQ1VUoCh3qUctQTtVH/fJe3fJcMhhKLd2Nx2HDMeGtM5d1d7Q0UH18IMBnhjWrtxxQtLRptg2xMtbO8KIDES2g7QDlmoyNWLGmfZuLOCMolQYqNiaVn1YwAXAXPpIuZWEZUypYemfMhk97ztyvrZKhGRpZm0CGd75lu/hV32jHrKpWlxyVjngIejcjwLsc8WdbcGqBqVFfuBigyxGLiKcqYlniiQ61mioRlzUJwbiBarperaWCnOHknusF+wnDwyFQQyp1HBe9rUYMIM6A4e0OMnKAt6xqEpGNRSqaZcow1PPdzMRG47zc8SFhVEKDNVYbavKr7FoN2g4rk87YmBdhh3Uhs5Ta4CGDs64VHgl6DI8OARr06GL13StQMa6LGeS79z34uD2XjvWNL9gxyK6r44HOOIwZW+JSivMtOk6TtlOnsryejMHk6mo8937Xr1kp+V5HeT1vt7xP0BtviOwvfzDf5dfMiTub+zOGuUAAAAASUVORK5CYII=") no-repeat center; }

.__dark .control-icon-webasto .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFEAAAA5CAMAAAB59jczAAAAUVBMVEVHcEwePFIdOlAfPVQfPVQhQlolSmUdOlAgQFgePFIqVHIdOlAqVHEpUnAePFIqVHIeO1EcOE0qVXIiQ1wgQVkaNEkmTWkjRV8hQVgrVXMpUG1KvuhxAAAAGXRSTlMAZRY/IS/+CXZWttnuie/NqJTe/Uu6nNnIJjsHbwAAAipJREFUWMPtV9mShCAM9AARj3FGnSP+/4euCgok7opo7cPW5jEjXUl3JzBR9GdCiosB4/JqwC7HKZafarkDhgFLeQIwvUGLUqKsThDLbgAFAnwORTigKAeAl5t7ZDhzJO4jIDo/8gr3cFWyEdA9n4w0QBMKOJ8GeDs9T1UPSSDifHo8b7mHd3Mq0I/6tHP+oTJlmH3uGhDMFIpMZYZHkBWzBXGIl1y/pLo0ADGHNW4JyR3qO1Ufvw0iPF0ap7oPeLJXtLHBQsx037WVkv6rQUkrwY4bw0wYKvZXgyI9dhB136mV8exblAC0nKlJVXllp3rfMeFbiNBxRKTt0x9InMZEbvC4+EXYRRqffh+l2TUcIw654/EpPvuX1OyYLCGUzYi072xX7o/6UBX5wkVqvQsrIz0nuZObbWtTJ63J7G016Zq3gE1xIl55I+Zuf7RILa6xQeyNqOa4JpBvNN69b9d6jkVDilTuX3/YW2kM68qwgxbiNCH7L4EG65pixGU7vLyadidP6ZpvE6na8bm2G6IrslBlf8l9tmOFhxapsyKOctd+V4LFpIioOq1xWuN5d1ke1E056qzU5RXzvWcMcSm9Zs07rfZ/5ooWI9rqrDhHruuVuHX5JYbKsEdZjESw7sXQ57Lq0jZH64p1/A1FGozPlaiKdPwrzpU4l9QKSkQdDDiZOqXGb078L+KkHHmq57FGUk4f/JrXYid0cxbRtRG3ycWIPY/+4xfjCztyYQPIhmKqAAAAAElFTkSuQmCC") no-repeat center; }

.__webasto .control-icon-webasto .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5CAMAAACWNFwNAAAANlBMVEVHcEz///////////////////////////////////////////////////////////////////+GUsxbAAAAEXRSTlMAZzJ5GbPG81IKitUlPuKil0cgrGoAAAIMSURBVFjD3VftksMgCEyiiZoPlfd/2WtPm4DYhNrM3Mz5kzYrsCxg1/2TE2/GG6eb8cAy2/qF0wGMY3jeNuMpABaxXvgd0mMBoAzPTdCc1cE8ABVLAoyNeG4BDthDO2B44sFMCXk6vbQnkLkz/tqaSHEmAZrKJX0L4Az5bMg4JVNLzNq8AAOi/WXrv3AQzMqNyPZhBikt026bGilOZ5cuukVJPQu4PF4B6vwrtg3CbhWZLyhobF2cTBypSDTQk1ldsG2WUetofVBWIzEOEiayLrYCMLO6VWxXtfwGMLNKYoarxj0eQtMMMAVIqgm8pPRUjeVDv+EDF1M43vE6REE7EnSQaEPtjbnK9GqkMQfyneMx5/ImaTwrbk+rYeaAOWUKWfSJiItk6YqLE9P5CaAudV/JYq6pgxjTiTzMuq8QHdDou9SKL3WvPScaDefLphiZLAbzJua9deszwI2nn6exJ38OAinTCokl4IxlZfQ5INHAVE6lQmuzZJaSCNPtJTERCVUw+CLPVkHMfIx8yWh2E//UVkl5sCJai5HeYrWc9j3HCvf2zbDgcAc8lmvxQtfzdQix37K6Bj4jlXgqVYnxrBfvzdY3bcI9l72CLxbX1Hbo0yaT37ir/6rK1mS+tT+fRv5C408q+fuJtxF7DOwmQMtN4gWzFjJf/Fb5Cix1erwVr7Ne3wuo1+5Pzg/RhkwU6a5vqAAAAABJRU5ErkJggg==") no-repeat center; }

.__dark .__webasto .control-icon-webasto .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFEAAAA5CAMAAAB59jczAAAAkFBMVEVHcEwqrfgqr/kqrvkqrvkqrfgqrfkqrfgqrfgqrfgqrfgqrfgqrfgts/kzxfovvPop1/srs/kb6vxBvesh5vwp0ftLx/Rh0/NDvu0j3PYzwvpSy/BHyPgi3fxe1vos1fs/1fRJ1Psstvlo1/dN2PhMxPEtyvsy0fIj5v0tr+Ywsug1tuk6uepLxO4sv+wky/GT3lyPAAAAMHRSTlMARjUaKREVBgwgCS89TnxktFXr/tuWxfTv+3D+oMKvqPiOXd7V3Yn/z/////////2TmeGMAAADlUlEQVRYw8VX2ZKqMBBVkkASNhUYHNx1xjFh8f//7nYAMegoyLVq8kR1VZ+c3k6H0ehPjsUpfy8gYQZ6J6Rl2skM05aN0/9hTQxvtrZbiBTZPrEGA9rebOFhnRJlzmnHhiJSnMzSeMr0kJl72k6HIlK2nxXZ19jU8orGq/NhjAZWhblhIQCRXG2mszm373jlmM7kLNqI1PY+xWDE0luIVPO32HSmLC4aFrPyFkJur/7EmBRg2vqDKkOc0lv3t5ivWItgY9DXAXntrfsTYyWVJQ2HtA9xKm8IO3RR5Y/cc2X6mTjk9Sz6tTf4RxVJCx+L+pJPD/ePm3NFiBoTeUGUsz3jZfEnF1Maur3jJqgUL3MciuYUq7FplWlsTBB3z54keBqqgJhfXBHF59GGvFFnpZk8m/aTBr8ULwtHGqBIy7ghE7qpV705SMN2Z/MRtzc6oihOY2Tx1jXFqkfcpTTkHrbadOp6E6h/drWoevMeY3IWvyPKmY+p6XzoqQg7BYNjJQ15BHm8jRqCDMeIYi/TeR+7SFYdk0GrqGa+QRQ/G4MASamRPHWQpDg6l1qjlIHtU3EfN2HTbw1yu2c9KNb9bI6/b0lmQIngZH615BF+2kDNJKvmpfZS3sV9tCkxjkFjCCY2f1qXSGteyqbzW0QYZsRNZ5leEZ/qpKYDKm5iLNM7ktAGsAyb6uQdiFoLqjlm7re8IwnF5dfq5MvnUWstqOa4XYS6uAm0AbWTKpVykTwdbWhBqesXMo1ldoMIpaBqtKqqZYeOfkTuXBtaiBsylt42kNoGsCXL1srXHQuMGNpASDV0d6mU25IVNRTJNN536BlIy1yvK6aglvMWpFyUu9ti+zl8r42u9UX0xKUqQHjsBb8gwnh9iOBwWZFPSOqJk9spurkETlwhguylcdJjHXJdCHKP3VyiUldVl9qbxc4g/dZMk8r8qGSAt6qTfVWbn7LN2kC91quWuAqxdYkI6n6xTBeb/V731lUIYCDqeu2ypjBeLV/wu9D3AdAIgayLMNKkoXNIHry9qyiDw+WxxHFSkZSdQ/KwK6UKcNespcsKzOJh/whWqbWBFiDsSFlmcRhF1b4f0Hj6c67SkD5D8kjMI8iY/gRRd4h+Q/JAKD2go2eMGhsV8+vv2iaRSbxv0VGsIbFo+O+l6zPSXhhRFvt4+C8wJ6Q9EbB4Y88mo/cdznY727TeiDgiJiJvBYRqvRnvL88/De639TLhXHMAAAAASUVORK5CYII=") no-repeat center; }

.__webasto .control-icon-webasto.control { border: 3px solid #b0c80c; background-color: var(--paper-card-background-color); background-color: #b0c80c; }

.__webasto .control-icon-webasto.control:active { opacity: .8; }

.__dark .__webasto .control-icon-webasto.control { border: 4px solid #000; background: linear-gradient(to bottom, #3c4042 0%, #141c22 100%); }

.__dark .__webasto .control-icon-webasto.control { box-shadow: inset 0 2px 1px 0 #6ecaf1, inset 0 0 0 6px #2bafe5; }

.control-icon-horn .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5BAMAAABTxLEMAAAAKlBMVEVHcEyvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyArbOiNNAAAADXRSTlMAZumqmVR2w4gOIEEuCwuPwwAAAXdJREFUSMdjYBjMoPY2tRXqEqmQ8+4d4hRyE6uQhViFk+7eIk6hLJEKuXSJVMh+l0iFtnfv3iRG3fK7xCmcpkucwhMgddgUcm0NhYPorRJGd8HgAoa6zbp3sQEMhYvv3iVKIY8uDoUKaAoX3SXSxFoiFbLeJVIhMFLvXio2hgMT5yLsCtcChSpRhWY3YVMYCzRwAnqIhWOJGdm7dy9jxpUQpsLcu3dvYCoEBS5RCkGhi0i4UXgUciMrrC0TFBQEJuXrgnAgfQAm6YusEEsoX/KCB9stApHXAJFkRioAsCu8DglVRoIK7xpAUj1hhRehxR5BhdAYRSofa5VdXFyAqq+7wIE7SKUAeombiiXAN8EduTUSbxQyYsksWBVyYs3Q0GR2BZmPUyEo4aJlIexWnwXKOKBm3gKsCplAIdeWBgXJoNIgAatCNlwBjllDoSu8gaMwPISusACHQlbsyQwL2ISq0BJ39ZiErK4aX5m9NKMDChJ3Mgw9AACbHgVrZtIyuwAAAABJRU5ErkJggg==") no-repeat center; }

.__dark .control-icon-horn .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5CAMAAACWNFwNAAAATlBMVEVHcEwgP1cZMUQdO1EqVHIrVXMrVXMcN0wkR2EZMUQfP1cfPVQrVXMaNEgaNUkjRl8bNUoiRF0bNksmS2crVXMrVXMnTWkgP1cqU3AjRmBe1B1RAAAAFXRSTlMAQO5S7lXMZ4PNBi+vnP4fghC/ud/WSR5IAAABmklEQVRYw+3YXZeCIBAGYPETB0RRB/T//9GtxK1MFGr2nL3ovetAT5ADzSlJvvkPqZTqSEGOyEnBjhocECtKD3JiMJuIwQZpQTHTglBfPMwIN2xIQWiuG6YDRb14RKBolEEqULOuVm55gSBkTV/7kiprDd7DzrkqtbPxZsLnnIK6t9v3HOYM1LVBpAT7SO8MzGakBft1Xr6XcRzzOLB1G5atvwjago8P4HEdZsukEs5OigwDoVomFQGHrwxaIQ+t/gRA0oIXUnpBJt4BEyh9YKfqrrplWED36jmZ2IICPb8pHI1d4qpmtntRabOpJukFQzLhND+3RsA+Am+xDQR0DhEgzt2mt+Efgjiz83YuCsQ+BByq4hZX/bzYCXcXjXkon2ofFG1QYWt3fB++RdAaPjh6xTLaxPXMB6BeRod40NOiiXjQXbA9ePtLjGvTW/cge7Ez5tqtkOv3HvcgjUpfsvYzOcSA7PcqeMk6EtkDy7ODUkIcuFavL3kb3f4drrGM9q4HdPQuj0PyToBxWb5EcvYe5/+c7/8Df54fPkhZV22++60AAAAASUVORK5CYII=") no-repeat center; }

.toast { z-index: 3; position: absolute; left: 6px; right: 6px; top: 155px; background: rgba(0, 0, 0, 0.86); color: #fff; height: 42px; line-height: 42px; text-align: center; border-radius: 5px; pointer-events: none; transition: opacity .2s ease-in-out; opacity: 0; max-width: 300px; margin: 0 auto; }

.__dark .toast { background: rgba(255, 255, 255, 0.9); color: #444; }

.icon-btn { display: inline-block; text-align: center; cursor: pointer; width: 28px; height: 28px; --mdc-icon-size: 22px; }

.gsm-lvl { float: right; }

.handsfree { display: none; }

.__handsfree .handsfree { display: inline-block; }

.neutral { display: none; }

.__neutral .neutral { display: inline-block; }

.moving-ban { display: none; }

.__ban .moving-ban { display: inline-block; }

.version { position: absolute; bottom: 5px; right: 5px; opacity: .3; font-size: .7em; line-height: .7em; }

.wrapper { overflow: hidden; position: relative; height: 270px; padding: 20px 16px 0 16px; opacity: 0; transition: opacity .1s linear; font-size: 15px; line-height: 20px; color: #00aeef; }

.wrapper.__dark { color: #fff; }

.wrapper.__title { padding-top: 0 !important; }

.container { position: relative; margin: 0 auto; }
`;
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
