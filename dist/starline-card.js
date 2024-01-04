/**
 * lovelace-starline-card v1.2.1
 * Thu, 04 Jan 2024 14:52:39 GMT
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
};

class StarlineCard extends HTMLElement {
    constructor() {
        super();
        this._config = {
            controls: ['arm', 'ign', 'horn', 'webasto', 'out'],
            info: ['balance', 'battery', 'ctemp', 'etemp', 'gps'],
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

.car-body { top: 19px; left: 63px; background: url("data:image/png;base64,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") no-repeat center; width: 158px; height: 113px; background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJ4AAABxBAMAAADWuQcfAAAACXBIWXMAAC4jAAAuIwF4pT92AAAALVBMVEVHcEwwruQwruQwruQwruQwruQwruQwruQwruQwruQwruQwruQwruQwruQwruSBWxtOAAAADnRSTlMAiFTvrtuaxA4/H2Z3LQQaVSAAAAWeSURBVGje7VnraxxVFJ8mbTqZZCHR2IqJZe2XNlZCJaZVwSVUmw8qi4+uUbShgRgoDUskLguiy2Aa0YqyREVRDEux0IjKkhYfJC2tiiBdQkCQVjSY7G7WvM7f4Ny5M7PzOHfuvfNVz8fJvb+99zx+53duFOV/s+3cren5Uvue0ccsGxgd7irNdf91UR5K/awjkwCW9b06dq8U3Fc54NlzB8XhDvg39xLzfSvfJQr3EV0/ONBlOOvLi7rzh7fPfW249PpIhiLeKQb3Fln7wBU9ZIl2D3FIOS8Cpw0ZK09zA/adAbgigvebASdyk48NwFP8ZTEjTR4X8sslgDX+qimATTE/a4YPr3FX5aAcF8yDswDrvDWtAmvcv61zliwDxIXxDN/0c39yTbyOtASshq9oAXheos57oBp+4UmAJQm8nQBtoQvSMtc1L7wRmswAD0oR2yJUOOcvSuFNhftnGWpyPN4QnjFJXvyR/NoOcS/AuCReT1gAm2SKg9ougAIS1/v2DC+R7KvKNsIGMwPfHR37QXdxLWmNqyT6m7J4yhDJMML+VZvT1dvN7lJT1IRk9tEM3FKaaX96wckhs58RrmqTxps0OKvFaqFFq8ao6bhvOWbEsLjDQqC1Z+uKwlm54rVLtJxvshC2TPfZDT+vLG5HUE3J15TdFgI9jo13tNDcHwHvQ711yH0+x3/wUDRZpyZtgEcoJz8KnvjI2pS9/WmbamZ/mTA/bEfCo8c7cZuHuM53DIEsWVEjyXz0zCdYIkE+Ah4JLsapM8DvporEvpyT4PLuW0WFBkSpD82sfR0TGsCXI2j9YhdWaY5fi8AvxDaRTknsKWm8q5TsltDPElrNHUYIqJ6YRVoVebpCNzo1KBsQm0p9nk/in/nWaG9cR39FOiA99sZqwVcz0QJSHxzHPTIOPJQtVx3UVrwUES0gO1w761Jln+trMVo4DHvYzYgRA9Lj2lkJJB/g1CMUDtfVyHWfXDhuxV3GgZbQKL8yf0f9wqRkyER5/mWcekLsA3PH63k6bVYcarFi/Sc5fk18AGkleXbkoMMAeTuZ7blYI8eu/bhfzL4lcMdcc/i4Vbsunx0AKXM9crRYxRXzFtnvMnDV7z2xrlgp7hH1X0icLu7LRZ0q9LhPwYraSb/UL9LGpjNrMvx4Bf++fvM4tYBkN+zFMOn7ThopJWN0OIyOqDP8RtKcgMAspVF9kbNkpZe+eIPDIqKe6PQffAMgVckbHCbJgBHw06Ypn9cR0uUpt90IledI3WpIz0jwB5EmRGOYbyMxRObmhPDWg8rNiKI2kjmJSDoeyexEjnE8+wTrlYM7B++SEZ8CD2eNrFbd3Jcd6Or+wx9f3kvhN76UV28duj6SOeE0t/LgQGf3Tfq3C8B/R5hxtI46e8h5oa3UBZeNeoPSLq9tEr1Y7dxvICW8LVPDueMfDt4+dNeaa1z1Gk8XJVl4Co7He5jAH/dXmH/h6CzGrbZs9gxYjT8EMm6F45W5z7aYrfolTd2WeOXLiiIeKY4ObMQ3bbufD7x2ildumG0wM5NTID34pr/rk5ZcgaTZh1hmhyrsVQ21frZr1yKks8k4jNBXOa+IzCRjpGboINIE7CJg/VY8vHswizQGbN+G/FcDs4pvBAvkuhz70RiisRocm/s0BG96oWOCQX8IoVbP3BRoqrN7Ezie//NLJOrvTc+XSu24lW7MfU70yJtJhE4Duf6MIT9/nuCK3cHOgqKlsZryEmBFVy8nxIaFu6lM9TextK+kfxLW92/4eGYDmQ+KDaOGJblYR4xVw7o3sQ/7HiPMV2haoLx/UN+vI4VHRcr7WB/SFtrD7Fcd60ttwd4i+YTq7Zv5IPmsyOGp2FlyErol7AHBpvQLAReIG7ZX3ZtJpXp7e/tS2dOScIp6OZt6lmxNZY8p/0H7F9EPvEnlgZsyAAAAAElFTkSuQmCC") no-repeat center; }

.__dark .car-body { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJ4AAABxCAMAAAATSeoeAAAACXBIWXMAAC4jAAAuIwF4pT92AAAANlBMVEVHcEz///////////////////////////////////////////////////////////////////+GUsxbAAAAEXRSTlMA7R/fDqy9iFaa+HfPZjssST6DOvsAAAWOSURBVHja7VvnjvQqDB16D8z7v+yX3jOYUK50tf61WmXAHOzjAnw+f/InR6HYd0E6Z4wQQinFztL/TwlhjHEyhM5j2kSrzgnGCfqmiyaWKyNxNd2w4fqbLUSFGkhKHoMHrRL5EonSGHZ2P7zlTInequRgVRjTOzgopRj72UKF4pbsoNeiJIJUrZox170eGQexmgcK5Yxuhk6rLn+lbtkHUUg7j2aLKbQh3WzFqqR2rKA5O1RMP0rGoVxZjpp22OSPNO6EDoWZgLJRv2xbNlW0W5aNMs3Zj0Qga8THcX9Z3iC2nItd7G/0j6x9ccMItlK2IccQnDE4RUXs90lYJjurels7bu9g2Po1n/oSzhWlBZYFvqun3Uz5PgM8WzX7lhnwsWzHBxLXK/hwffA+n/Da+VSteHGBD+i8XvZZtxIT1lQ3AG+2PjFnqn3xae6zceq2MiysTu+qq/chK3nxrZg7RQIq9iUiXwIGalA8myXx6/bFnO0u2cNWiS2/EvW1m4xowMEdq0138oKd0AlzjRuoN03eKyNOZfM2+bn4x1M2q1poN7L/UFaeMVozfXou44eNN/pttEmnf4v3nvE9FXL0jB7i/feBtdHu07HemAz5PqF3wbVoEZ9QGR1sb7d3jl/aNq6ldvasmxX+3AAxyup77etb367BxoV8nBpLwchGzo2Mb7F4Beovqe+3ao1xW/KC86olurC24EG3y27s3NbyQNmbuRJjVcEbmwEMr9u8Vzfp9u9IN25OlNwSd0XOQylke6Bv0kA9+RQqHpsqm4RmrLKkoTTeL0sxhhLpFHRGek4b6juHeE5UIkA3cY5LKqK7OONtttDSMWZ/xD8q9rvEuZlj/Apu+Pakrm7kwLdHguJnqG3oHOL+yDKAv6ybNT8crSL8lNU0dQ75NCmLMV6TyGEfJ3W3W6uZcYYdVSXVrO8YQTUXzglyt71zMON4qTgUqR/Z9qkbNwuDzaeV7Eo/B4f2ZuUkXqVoM+vB+PHyw3xA25394kJxeIH6y40sK06hBTd5n5fwE3i3NhZi9y/y5P5OhjvC5395qFe6lnLW0R8ezQ5u+8xvmNVB7rkwC4d4RWJVnKmgHfGRhvPCfT4eW0V57HB0PrbDxkL53b6+pUW7nRnLeLRDu0JTwRoNmRy9MjGHJFp4Q8bAwmPuUYIBBnK9fYQg/Q1X5mbR3CdGoGRh8g3QcnCh3J7DcnC7YoFh86IyTSsFy3H5uggP6/3xkupFc0i2uiFWjFviQT/IP+oADsOI5cwlLzv7fNdWamzyMl0DnephHSLTXVAZ/POqsC5S9uIYuVPfheGu6WBw/FqjITKo6mTnDwS83M/MPU3o7no3FE8qHa+/zovwz2F7QHW4YOuYLtSQXEtH20Mw3A1gJ5Uu6uGkTCMzqCWlPqN6NEm9roSDAUVtQQ0qmT0NkjKX2Pl60opeZwRJUJj0FeW5bnixUzbpXUORdA8mMt1c86JuWs0XXvwmyzfQCyTUt5VvpFHsnDikVYmkRMyAye1BVcW4od4A4b8v/KlwN/RXBxc1Mr40Ul6zmjTXta1Mz7/r8NA2pqdfrko2yQe2XUr0jbdtlrfTJLLl2+tLiV1MlexRhA+5ffeyDBwLCmahPLG1c0BPG50vdP6yf00HUi+2IGL8vs5zxowPXxNkeAnrZFiBp5JBaS/mUmR0VRoMfGN+vYPlwuGpeQIliJ8Z33B1cn/pukjfe7w9GHQ824vx5RCYDfoWl+EkTMbTqVjY6DGWapYSR0RoGUzRn1aFYBXKgUWCzTW94ztQBaq5qIYsYmIFl+izB/89v7s2EF755Rt1b5AGWDsigBZRXigwbbOVeiqvey7H7jMm/wV48Hmp4NaSXua3+/1flqv6d4OpY+O866z9vJaFz5/8/+UfMP5mZYQqTlwAAAAASUVORK5CYII=") no-repeat center; }

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

.__alarm_hbrake .car-hbrake { background: url("data:image/png;base64,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") no-repeat center; }

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

.control-icon-arm .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5BAMAAABTxLEMAAAAJ1BMVEVHcEyvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAoPa+wnAAAADHRSTlMAaVbtqjmQIQ7Y98IBGOzHAAABa0lEQVRIx2NgoD1o9FxzaooEYXUhZ8DAlZC6ljNQ4IFfHasNTOHhALwKtc7AwSK8Bq5BKDyFz8hikIppqkGZINocj0IfoPwkEEMTyDiCWx0TSLoBxOIAaVHAqZAbKOsAYbIAmRtwKqw5c+ZkA4TJMefMmaM4FeacOXMIxtY5c2YZToV7zpyZAGNznjlzGqdCYLQkwNhswMjBpY4D2aegEGjAoZAdKAeMDta0NBAJ5BTgV8h45owAvRVypKWlFRCjEApGlkJWFzBwBCkUcfEGKnQJwJkRgOAYSGEOhC0wOBVOgXjGk5DCI7Dg8SGg8BCrktqZM0lKAToEFB5jBxd8hwtkCCg8BTHqEKRcw+eZGWwgMqGToK+PgAqTkw0+hMNRoOrMmeWMRAT4UiCtEEWEQqC1YOsJKjzj0DmD5QwxCg+yQwKRoMJTAfDKAb/CM4bCZ4hTiADDSiH2uovDBl3dYRylfbQxGthK08YLAHhf6F71nbuXAAAAAElFTkSuQmCC") no-repeat center; }

.__dark .control-icon-arm .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5BAMAAABTxLEMAAAAJFBMVEVHcEwgQFckSGIqU3AfPVQdOU4bNUoaM0coT2wiQ1wmS2YrVXN4SMAdAAAAC3RSTlMAaaTuVjkhDtiFvOtPYbgAAAFfSURBVEjH5ZaxS8NAFMZbMYk6BRcHFw2KxUyidulStILQ5RAnXQKOLtHJUYog4iK4GLqI4OTUXITG98/5Xq6ppfbu3WAd9BtyH9yPd7z3uHepVKavixpAZ4nnjqDQOsddwkAbZs5plKAURnAfhtoxBoQRmUKeEXB3cPxEa90AvuH+DZlDNB96bha305icF6JtasEF3H3+ZifoHKAfK+vdA7xrwS5AVvo2QG7K5br0c6ZssC0PpZ/H5ug4bzRTqkCsAV3VDicIhGpSZAarAP5vg16SJJENOND/ArF1pFUCF4NNBF+E9iLQXSAwVN43gbkt+OMROyqZGgemZXlCBsyc1h7AWku0GTB3i8Enoy4DShUqc9hkbmfou3LFgikNk34c8nX0cUjWqxYF38W1eWoB4rHF8SyIiaiEWLDnRstWoBTD18YMwtYj2IFf+lPg5LfLa4xzUjPtT7bH9DrVn5dPTffAgdqg1GkAAAAASUVORK5CYII=") no-repeat center; }

.__arm .control-icon-arm .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5BAMAAABTxLEMAAAALVBMVEVHcEz////////////////////////////////////////////////////////NXt0CAAAADnRSTlMA7mlWiA+YeNsirDnEXh5U7e8AAAFKSURBVEjHY2AYVICVOGXTV7x72HaVsDqbd2CQSUjdnHdQ4IpfHbMcTOGLCXgV6r2DA2l86pgQ6t49xGfkPpCKI9Z7E0F0Kx6FfUD50yDGRSDjCW517HBp1nNAJm67GYGyBRBmDJCZgFOh3bt3r4AUZwAQA8PpKU6F6969ewmkeA4Aibp37x7jVAg0ZQGQygO5M+7du2e41HEC3XUBHJgGDAxc7969waWQG+LTfeBYAYbAQ3wKAxg4gYH5IgBkLk6FzGCFPKBYOUCEwrx34GBnImQ1LyRJGBA0cUZH47t3Eh2dhK1mYHn3ToGBgRoKudcAFa5atRikUGsVmLMBp4FA8BykMA/CVsCqkJdYhaMmjjgTn7DOnBlAjIkPN0ByD0ET3z3s6JB7R4SJyAC/iQQVDgUTsSg0wF5Ny6GrexiAvajYI4gGTjMMLQAAreNM1kkE+coAAAAASUVORK5CYII=") no-repeat center; }

.__dark .__arm .control-icon-arm .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5CAMAAACWNFwNAAAAOVBMVEVHcEw51fkqrfgu0fo51vsqrfgqsvkqrfgqrvlTzfEzzfU2uOpN1PUvyfstvfow0Pswwe4tr+ZEv+wTCgFvAAAAEXRSTlMAwiqirwtDGDv50fzmc1eQ6XR2F7QAAAGQSURBVFjD7ZfdkoMgDIVrNIR/lPd/2IUmtnbbGRf0pjueC2fA8TNwQoDb7dK7kEArpbQGwhNwBGGy87IsbrZjhKNI1KnCVjkbDiGRwhZ3Rw6K+nkwLm9yc6Bu3rR8Uu4lPnkuV7lHq49IaQUYP6SQxsFk6fGqwxlU4ofxqWYgEajJrM5AR4AyYPO0FSn6dRqxPUAnPE48fqAQnW0OkThjsteMUjxtGOQ/sTVEsPxhEN4sZLE+j61Ga8cBAmekrUZUIkbXZQtGDmSiR1gSFIfufCswbEYsGcn5DAO/0V1ZfZ97irJGuDUdA24yvKyQYsxhIIrfYgUeBSJtSpgrxhwGKl/kuEYUqcNABK3jcE+huk/1DRlRy8oLUETAwFJwoJQc+RVQSxbaWYpAVdIMhFRbjzcNFYde9pI8CVDb127qBQ5K5vACXsAL+N1APWWTzXhWcXBDKbEhRH0WcMmp3iqU+tXbD6wH6yK3nAf8eNS+gN8NxPQXYGoAxux2eU3ndgre7Mi33c/KJX5H0H/L/W/6AS4CXHRtFCfHAAAAAElFTkSuQmCC") no-repeat center; }

.__arm .control-icon-arm.control { border: 3px solid #b0c80c; background-color: var(--paper-card-background-color); background-color: #b0c80c; }

.__arm .control-icon-arm.control:active { opacity: .8; }

.__dark .__arm .control-icon-arm.control { border: 4px solid #000; background: linear-gradient(to bottom, #3c4042 0%, #141c22 100%); }

.__dark .__arm .control-icon-arm.control { box-shadow: inset 0 2px 1px 0 #6ecaf1, inset 0 0 0 6px #2bafe5; }

.control-icon-ign .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA6BAMAAADVUMOiAAAALVBMVEVHcEyvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyArOdMeMAAAADnRSTlMAuVQg33cRZe7QQJ4uiEGOoF4AAAHpSURBVEjH5ZW/S8NAFMev1rbaWqg4SaHUunXoYJwl0M7ZMgmlQymO/gXSQZ0kuLqUIghOpZOLUDoKLv4JapVG297fYF7ucrl7l1AXEfEtuVw+d/d9P+6FkB+1lU3ZxvFghsrW/ydg2jCMPWDq3sBYEsssgJffCPovgTe2bR8CeGaDteK4FFWtEAeeIHAaV2SIoy4+O7vlP2oBUCekRUre4Ant1JsId30rB9mcqwnuUQ/sdG4D7g1mj2D0oYCrFEAL+TDyh8cymMCgGeo4B+C+WCzz6KkgbLPOhjMALC42i0BfYpO/jBm48IsQgSAxGbxcMpB5ZamgyXSHq+CTH/oSXdi2o0isycmxeGiFnlBiOlx22miIONW0SsjhrLNkHihTIHGggUMA15QpOKSngQUiuxhITGkcuxsJLDEJt7qkCfJAKTxmZNOgXQbOw4AH9fKwBHQ7nnlBTiN/nrUd+XIcyWhwiJMQB/ZJ0qFxGrevBOqiiKmgKGq/rJsYNCVQOPop3VwlMzl+f/fFMe3oXJPHC/+x4QROj6KrRxhvAf0Mja5H1KVcnD6tE/C+N1PKccqqE/1K8vDpNU91EDdA8KI70MEX3EshI3eODr5rXdeb3KE6ONHANnWbEeBQ/xtWqhXFdgm5rlTJ37AvrufTv9+PINgAAAAASUVORK5CYII=") no-repeat center; }

.__dark .control-icon-ign .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE0AAAA5CAMAAABEZFZVAAAAGXRFWHRDb21tZW50AENyZWF0ZWQgd2l0aCBHSU1QV4EOFwAAAAlwSFlzAAAuIwAALiMBeKU/dgAAAEhQTFRFR3BMKE9rJEdgID9WK1VzIkRcJUljI0VfGTJFID9WKlNwKVFuHjtSGzVKHz5VHDdMKFBtHDdMGjNHGTFEK1VzIkNcGzRJJ05potCAiAAAABR0Uk5TALpCCe8zpRGIZXziVcvpc9McpOh+lOwRAAAB7UlEQVRYw+2X25aDIAxFC14QxWux/P+fjo5EgZKgzjzMmtXzVJS1TUgO0MfjowpRf4vWzXG1t2i5jmv40Eg1+Sag2GHOftIoEmjiN9ru/9MysakH2ihAN1z6spqB9tr1vMqrZo3LVNdgPQXTei5SAOXsNDKE1YVVs40T+4hqXyUOyzN4Y2yukuqC52x0CZV8g+nazhs7eNIRhejWT37TJreKoAZCm45nRCFKDbQytugQmjKRQqh2lQuvSRqsWta5T9t9KVfN/KBxkgahVcZrOuk5zwlupGgQWhGspy2EpTXuzkjQILQ2fDG5NDMeNLaOn4sMGpp8ezX3chF8XwVlMJoo6NhFDPYtO3D6WaGWhNCmuP+Pn31QBio0Tm8DsOyJ486GlnX6Cq2hQxPcqkFpzKcN9aIhCC0wd2/O0lik32ofVhCrN6Rp3G6SW2sKavVO0OBc2ZppMgStSdO8s1SSXTKcpjHMDQkaX5xXv81cE81aut9iNT1cGyZamZu0MF92xlquF4rSpWUsTHRMWss/dgR/YDiBbSFEo/vswUu0N0maog7/MXcSxRwlF5tAyeirSbHjBNoc/Nho98sFIr4nijrKoSVv6naeVGhzODSZvMVtS1LgzeHQTlw3VxwjHHXQ6itXaUT7lOzzd/4P6QuXQpAE6D6+dwAAAABJRU5ErkJggg==") no-repeat center; }

.__smoke .control-icon-ign .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA6CAMAAAAQoC6jAAAAOVBMVEVHcEz///////////////////////////////////////////////////////////////////////99PJZNAAAAEnRSTlMAQjSEvFYJ8HeZY+cpE/yPptGA/Tv8AAABl0lEQVRYw+3Wy7KDIAwAUFFBBUor//+xVQQkrTyCLHpnbpaKxwyBQNf94aBLNOrARUfjH/xpkIjJBs+Ckhzh4ZG4OL3JvZzLM53dN6+vV1VeAqzz4mClFwWxXk9tvHxRqA+J9546ESNDe0Njb05wavP6vEfCJscz+eU9MmoRtFZ1Mz+6bu9EkQfzG669h/mzAdm+zYvnb4jNnxkhvI3O7zHsMT88OPoM02AsP/uVgIuuAPz0KLONzj7ybY2WZfjpcZek++rpW2lRht+eVhJkuIKqiH3Tc5S3TSrIULOwKsj6clsmE+55X9RaEt7nKqBFe7fY05qDqtz3gqWpmnjnuummJl5w6mzjlbn53fIgOEUWNsKzyzINIrxtcB4E3jbnXN0DcV4eRHoXc2iOAFXpXVX5uIRMlV4M7IhynkB5+jzbBQBNC6/wgr3M+DrBq0iNB899CS83rJNo7+yHl3d2tBd07JyXuJwQKWX/dabUe1oG22Ft4AHw2cADIGnghaDIe0vWC8GhxGNzJvY73DGIlngN4te9+/EGvbejl9WxzWUAAAAASUVORK5CYII=") no-repeat center; }

.__dark .__smoke .control-icon-ign .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE0AAAA5CAMAAABEZFZVAAAAGXRFWHRDb21tZW50AENyZWF0ZWQgd2l0aCBHSU1QV4EOFwAAAAlwSFlzAAAuIwAALiMBeKU/dgAAAHtQTFRFR3BMKq75E+f6N736Kq34LrL5Kq34Kq34Kq34Kq34Kq34K6/5KrD5Jcv7Kq75Is/7adf1Usj6bNn2DPP/H9v8UdLzPMf6NcPvVMzwXND4NM/3Ss76GOr9WtD1R9r4M+D3Iuf8La/mKrToQ77rTMTtPrrqM7ToGNz2Isnvgl0g0gAAACF0Uk5TADf4hRRoHAUMASdHVJMtoe+F5vuw7XTl/LzFpNjQ2PTTozflxQAAA1JJREFUWMO9mG2bqiAQhqMQEAhqayl7OZtp1P//hWdAKNrVUvdc5+mLetntIzMwg5PJ/1BOKWsXpflgGmVEoRYpxTEdTGN8rtetmnM2mIbR4dquL4SH08SmbNdWkH9Jk3daftcbGnlLyynDhHD4Eczo+DfFDQwrmXlJRF7TcoY+a69LgNjmtN4ufBQAhuaroJNir9+VEeGfPNsHWr2fNUYEYQE2PfvHVB/ijTcwB4MCwyLmkTYX3F3xg5TAyuoje2fNxwvmEFMPGvyHwiUI4ECYi5f3RlJvpPGGGUtfswcMKyG9Mh1olc78BSEUIcOcEaSnIV7TmBnxwuogxDuYH5K7M6Sv56hIC6fVwsjXsNxHMCS0H+JrR+qWl8Us06/GzA25EpluVpo0Xj9VPWAdzijjYnZawUrjpx6cdMLeOnMLozmsbvZTYB/KbN4HFpzlPpcgae7LO1OHGzwLaIyvXdD6w2DKwIIvBFI42mRoVwYaHHWhGlgaTVcfKJanA2iNYrVgSie0njAjGhqf3ZyuWoVqAVd60J5hcKwVzuG/zcyzJ4GbV6VEWkeTistdX5i+fhlwF1cF+yVJQ8v9Oms/Z5k0u94wsCOhukodFwVOY7VzkPMUdOsNK+1tredQdENar+PAMaTv87A3DHR1zw9z8LJDT2HwvCGw53v+iFC0c5LZsuwdTT1tuckmNLn5JcwnWFo87QVkR8JcgoUWoEmR+gjajISlDYWjQb5Jke3Gwh60vKFJTsRuLOyHN0m+z9OfsHPZ29t32hBYmze1TuI6CNbijRJTFMXxMgL2yJC7N9+IC1nYwTD393v2oo11yew3CZjLox0KS+cC48tjvQi9ds4AVw2EJbMeBo6LbBn3AYATRzMMVl6ODxpNOgeHI0j2gNmqrqvQyVYFYq1dje+RZj2cVcV+vy9iI6s6tjjQifSBldVeolgXtobTX8GAhnCsWYtYs8bCgKZwqKfVsX33lcKSxq+DxkJJ2S5bd4YJ7LIwwkzrbm1hc0mMP/oQbbvWZ2eIiMwsO2WglcHI+CPS0spB4pqHM2ijoDnsFsGQVv4Ogtt6aWigppVX7WDUZWG3csjQvLmldU9JsdkXjaQasX///qaEh48BhNF/+N1ixHeKyeQvYNIfd9RVR/EAAAAASUVORK5CYII=") no-repeat center; }

.__smoke .control-icon-ign.control { border: 3px solid #b0c80c; background-color: var(--paper-card-background-color); background-color: #b0c80c; }

.__smoke .control-icon-ign.control:active { opacity: .8; }

.__dark .__smoke .control-icon-ign.control { border: 4px solid #000; background: linear-gradient(to bottom, #3c4042 0%, #141c22 100%); }

.__dark .__smoke .control-icon-ign.control { box-shadow: inset 0 2px 1px 0 #6ecaf1, inset 0 0 0 6px #2bafe5; }

.control-icon-out .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA6BAMAAADVUMOiAAAAMFBMVEVHcEyvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAr1b2GRAAAAD3RSTlMA1BSm8sF9Z+YmCJI5VkddSWRgAAACR0lEQVRIx91Wv0scURB+rrnIqTGiZTAnJH0O/QOOFGkEORErmzsjeGgKFSIBGwsLy7MK6bKgjZ0gWKjgKUKKELgUAVNFQrSwkUs2etHTcX68XVf3vb3UTrH3HvvtzDfzvpl3St1ra/70ZrPwsz7ufQ7InpTq4A5BW2U2FrcDgVWnYnBLELK/i1ZcMhUGQr8VuMfvX62PrRV5ZQveliVqW+x7hICnMQ49P9mvdpcOxeuh1QTVfRJ3NSMwgW/OOC4/W5FItdsEnENgmRaNFd5/wP2qJfIlrz4Kt5WsOfbDwEEG2vn3BxbdAFzG83WZou+5ET8tGSle+e+FpIOx01EgymtAU9RJKaxQXzSX4PU2roTkCz9I2B5h1VzlfBkdoiPxOgu7XNmLCLAF4I/6VgyJ52W+yZR2go7llh4r3Zi/FwE2cHUzIWCHasZn5BAfAPyT0gUOlUImEZk/BvitUxYbxF3KUHENbAk6xrUAJfSNy2HamEI3aKkkdLOSQ2MyCa1aDQRX5OGZCy4U2Chkky+Pu0eoz5etLDq6MIriAH9PNDAvH11aZUbNRwMjbZMZCbfGfQBPkxkWmkW4z4V5CrqwVXNwLsUvmZsLiWUXeLrkakzX1FwU6EolF1wpQpdKFk0CF5LegeP6I5AHQNo2UkLVaC3aRgqFgo1g+xYskaXW1XJ46uctg5RlM86ZzcQNUvWLD2++8G40BTEOhf9/DXv17Fa7LsZcNPs3OG8i9uqaDi6u13Uuw8+Sx/xx3evVOVrrXf9+v/9qXAMrTCo+qZKXjwAAAABJRU5ErkJggg==") no-repeat center; }

.__dark .control-icon-out .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFEAAAA5CAMAAAB59jczAAAAUVBMVEVHcEwpUW4aNEkqVHIrVXMmSmUcN0wfPlUePFMhQVkiQ1waNEgqVHEaM0YdOlAqU3ErVXMbNkoaNEgaNEglSWQdOlAaM0YiQ1wrVXMhQlsnTWn61forAAAAGHRSTlMA1s917FL8FD0IL2jDgSOQqOdalu+4o6kHXi9gAAACcklEQVRYw+2X2W6rMBCGjTdWGxNCArz/gx6It7EDrU2qSkfqXDXI/Zj194DQn/2/VlatGMdRtFX5EzgpMOeLNs7xWH3IY5gv6+xtXfjQ1td5FeYQZ6HD7SKvfhzwNBPLK8AGL/OZrQO7EPHgHaRdTwjpFfVM3mYDucP1jS88KezjReR6aHkkqiyzzCXLy9ICletpYck1scic1pxMDomvE3CpMvkc0kfoZoCgoI8Z+/AbgxxzYwZAuc4r6GuDTI5baGCPoIvzjGF99JEpcVbur9NFHbg4B04ipTs9zclWvx8eHl9PoJMlzcjk9DrbocjFyMn+9eieokPlGpfFuBg5+Va989bRs1Jr9b6JxyaRViA4npySd8lh60qrDY2HXb3XQHHXXck53oZaj06RnMZ9Qp6nalZsbjY6kQnEwldafQFEtf47YRJ1W0h0juxKcLD5nhi8uj8HwmAyiAfIrkaZRBj1AdIB06OOXx3mkjpgemU61z3wtzNH1N1DE7pHh/l0v+8hsQkFpUueQte5MsqjU4vnm4ieKkUoASwiinNB+SaRU6iWs71Un8H406StigTyrIPrKiQVlIbybgUlJWwKxXD3rdCxNbv3aw0lM/Hq0tVehSl14XNVdabYbEmuNHBy2UkyWlNYsRdbDlku2kzOfPuH8i310gMVSjYzJ/x4mW3MIkgzFn0T97yMB93R2tU3a8mv7P413Op4N7f3GMn8SPB7vPBLd9n6Xb9HmcYo+OB4iLZtX/esuxgJyraqCO7U3cA9e2Gz30JU57drg64ZKw55b7t5zkfSAfMTnm7nHkKpYh/ydELZ9nWkVE+YRH/2W/YPz4RlsHrwg1kAAAAASUVORK5CYII=") no-repeat center; }

.__out .control-icon-out .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA6CAMAAAAQoC6jAAAAOVBMVEVHcEz///////////////////////////////////////////////////////////////////////99PJZNAAAAEnRSTlMAUGHmBdfHET3xgaL7kh4scLSYbnl+AAACN0lEQVRYw+1X2baDIAxkkUWQRf7/Y2+VVVAL9r70nOatnjIkk2QSAPjZVxrjSCilhOXsH9CMoItLRhT/DA5SVxux02M43sJthtEzuEm6K6P6CXnEXdsMx8Odi+PrK8VCrTh/WuwoXkotViZlwdjstn3m31znFCbIkdSwGNyaSllE4EkE55eBklwbokzhUHB/wd2NgwJekUrpSI7dhADkWMBLQZJZDpyZeSho4e9XoHTQlS4CGCjuc9BfX57XS53W0EV8gEHeHCftrV0sekWgoHbQOdjwMncoD2sPR5Ug7SUdPe35xvvVzCAhae7qmawCcV3UqnoPqCI5kOJWZna/ZioAsA0zt13y6pFpvVQvwrbe2bHfA5KcY3mDByZP4vv284zpG82mHsQTYt4CuvJieY1XhtIPGFJ0htcNWIR8hkhTKfeGXF98zDVOeCEpurNsUNWJqQ7zfOktG1V1/XwM2Rw1hPaKTQpNVxzCYyQdraePB2EFKKKGdItDIC2KsY3d4Y4iHeSLDQusL23KgVlLCRsR2PDfUHCbvwSC7Qdfc5rVwAiIQ0qEJGM0lfudKZilYGRK7WNZ4+MuAgnav444mBKxjV3WsK4zXu+gT92xnO9DcXHA/WtndMGpk7KwcdMb2d/TelhkpN67xxZEmBZOInJkDNGmZboRC1EgUlj0GqjkpAUHosbnM9S33JOXBbsZowY8MojP3xTP31ITah8rWHz2hOSqxMQSTuBj09AqKaUS0ICffaP9AYLyTYwVSI7yAAAAAElFTkSuQmCC") no-repeat center; }

.__dark .__out .control-icon-out .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFEAAAA5CAMAAAB59jczAAAAgVBMVEVHcEwqrfgqrvkqrfgqrfgqrfgqrfgqrfgqrfgqrfgqsfkrsPkut/k/yPo1v/oh2fwxx/oN8/5n1fQd4/xczvlazfAX7P4k0/xQyPIi3vwU8P5g1Pk32PVEv+1i0/ce1/VIxvItw+9Hyfktr+Y1tehPxu4iye8puuo8uupGwOwX3veOb62uAAAAI3RSTlMAHUQsJTcXAwoQT1hkiG+uev3s0qn84ZrhxfK89vPT8c/tnlyFOhAAAAQrSURBVFjD3VjZcqMwEIwuBBJXAINvZ8PN/3/gji4fu65CdvZpVXlwbGh6RpqeHj4+/p/FOf93UGEUBAhRhIIgCn8MzMMAEYaFjNNYCswIDX4CCvQQwXGzq/efau3rMksxQ9G7mIDHRFN+LsMwtmqN47B81plUmO8AhhERzX4Z2sc1LvtMEoj9HYJ5vYzt3wswG0xfheQhxdl+aJ+vcdlJ8lrkACjLxQFMc9/3m76fp859tdTxS5AKsLYEu3lzPiSplDJOqnPvQMd9+gpkSIUF7ObikAo4hlT9MRxX2+kG6Z1LjnBpAKfNIWYUSiVCAkVhGFAmq5OhOdaShp6AEcsM4FwkmELlqWfUMdzPeYRYujWQQ4kDP5IhyRcLmDJ98NQzRns/HFP5ZSCPDfNKJQ9waQHdfnIkL+0xJ6HdNmEhNe/1FZFGxzwVbjc1xbZzQaqTsDVp3vmQdBS7TeIu1xTbK0mAJOnJxB1T7pHFRFOcz9e8a4rtjaQi/a3jnjIWrQeNd4aizRFXQV4Mo5xYIeNI6Li7o1jdbhthOx9wEGr1pkxkRjC6UjKqlTwEkvYhq3sDQevbNzkBLKXeeZNdbDVfdlkSC4wBl8iTDXsVkWWaTiEIzjOt3stN05bFKHkiKP7SiCWO/NIIQdN0f1XvBykbBhBIasJWiVxBDPAvjfjNApKcnstjt6lYQFP9uZdoZWsCoRH7hIQBew4JgBiFSOrz0+drJxIJc2FKOX8OaQC5ffScrCJKE4wqhqeQBvAumBc4fjxj6QD9EQOLmBOui/xPyN4CQiWMfnkMsEaYGytdVH49IG5i94PZ683qXkf25O6MBEAB/3rkmBpOIWlsJQR+NTOVRgI4ih/PuCNvK2E6r9YM1HVr86PTZf+9LlvIN0FZrWu4dDJhY6W3lrJyAV3rvtehNOPdg30SqeQ5VGJrguuL6qwxuy0OdHpLl0buoeGdJQMX6xbR9cW3xCLZKswjbC5ouOlFEHTk0WeMPLdH1WdAOACvEgyB19WYarNDGl+c0HOfXmh6yKjMEhJzUWkLCt0hIOJ7u8lpREVpsnjwathXkmBDCBWKn+uJ4ClxklMqdoPJol+/ht6ZG7c01GB60J3tVjwpWB8L2Fd+nkIVc2WdTZ0b33NnpSmLrc2C/os8zVmInA0ZwXMzN3CoyUZ5fWt9p8Lbmyn/KK3/Uj4+VmMMgkUJlo3z5jcT4+dxSbx1Znb5LLNcSiGhz5Z71xfnImcv2WZl6SZXyzDFQFNVfda1xk4ZwZetvTjM3X1TvdOgrj/HJHp5/EA42U5PeyEcejgCb4xIUCLVaer+wlPe/I2Zy5aIrLZ3Y0wHk02hvH707qgJPp7gtDpvYTxSQ1JxPuSCPZ75N2KHUyhEnCZpqgZsGEV+OrTrdwBwumGhf/EO4O41hXW3/8Vbl98PJ7C3M7x6eQAAAABJRU5ErkJggg==") no-repeat center; }

.__out .control-icon-out.control { border: 3px solid #b0c80c; background-color: var(--paper-card-background-color); background-color: #b0c80c; }

.__out .control-icon-out.control:active { opacity: .8; }

.__dark .__out .control-icon-out.control { border: 4px solid #000; background: linear-gradient(to bottom, #3c4042 0%, #141c22 100%); }

.__dark .__out .control-icon-out.control { box-shadow: inset 0 2px 1px 0 #6ecaf1, inset 0 0 0 6px #2bafe5; }

.control-icon-webasto .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5BAMAAABTxLEMAAAALVBMVEVHcEyvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyArOdMeMAAAADnRSTlMA9Ak4355RybJ4JRdjjKlwrRQAAAItSURBVEjHvZZLSgNBEEDHjIlJ/Cx0l0DIQtCVxAsEceFGCHOC4AUMwQMETyA5QTAHUBRciycQ8QBC/E2CWmewq7qrks50NwHBWtXMvOn610wU/YPknhcEi90FwYsT1q6CXH5UN1r5KAgOUtbuNkPcGvxwUL2gs/swYR/gPJSbloCPQTAPbLpcg5DpDsDYpBPg1c+ttgBG8sq3H1wHJQ1SewCpH7xFMEEtRu3BC77g44qcXfEmp4aPKZoV1FJ/WUiwK5ZI67tOSyglKFV1uUHalgPcTfgYsq3VtJ4F2yor9xrEaFe09uTIoHr52oAVqiXKW7Z2WJCmAVOTR0fcqgXqUxCjbYkX9kRR5dhHtNjR2kG2a/oSNUVrnPycA5WhQ8kj2c5p2x82V1C3JlIZHfeQlPdMY8PoMlqtMTjWLyuxU76Mt7qme7jeA1JuLHAPtO1bAbvssQ1SXkaNGSffcLBBBsM6Ec7U4mEQox2CjJrlIw7qHYO4gda0P/NR01jFEndDD9iXDcYSwSNMWw1rn8wvRa5XnsEnGhyVXFuG0lQ9AybUpBPPWN1Mw0mostn102bHOBw0HWcsR9GOPO1I70bxp3s9aXv5aXoKiXPVmhOpcpTwKOfdEn3JwNi/ydq88UquEZiRbW5nGoLD0IeD0zsIrkYcsKqs0/d6AHzhY4quVTI72xxpKds0ljSrMrxBy1HzRLpzK/hdPZWN5VzJDonHC/4DFI4XBMuXf/h3+QX/zBKQbyVycwAAAABJRU5ErkJggg==") no-repeat center; }

.__dark .control-icon-webasto .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFEAAAA5CAMAAAB59jczAAAAQlBMVEVHcEwjRmAeO1IoUGwfPVQhQVofPVMgP1cePFIdOU8fPlUePFMqU3EqVHIqU3EfPFMpUnAeOlAcN0wfPFMrVXMnTmsJQ2WGAAAAFHRSTlMA/Z+LYC9RdB8IQBO178zv3tO9367EtdUAAAIXSURBVFjD7VfbdoMgEPQCCHiJJsv//2qNIJddWxFz+tBTHjdlnJkdFlpVf2YJ9WHA7vVhQFZ3uCS7e4AgMeBL3ADUD5hRqV/GG8bKB8CQltTTDOWAagGAJq01BleurHU3RhQ1YX2tK4D296sNMJUCbrvBJJ1ptlJfqhm2ZaL08I01FObR7U72u4+81B2K8X61f6So23LfDcaTFHup1iUDAvx69KT2utIcbUUuARGe7qfWV8wF3WKxok2EWDOMCLXIHw1dapnVLbETwYrz0WBNZwmi063jUpM9Giid0O8xtkLnjgZ+hAg1R0YCLDkmvjPIDnx8739HQMUkDcsbh84fjhGtbgEHofphem2JqSWx7BvdRp4hLnETW4zoKA1R5SyTe6hteIlsMFu9n0PlbKqxNLwDgbRDiI/ZiF2q74AkjkE+oj3H1MkFHW+dq9qdYzURkjb9/oezoy1xXyVJkJPpDDm/ZSc8rDRGbJJBeX6wGekrPt1zLCfn2p5IX1GExvgvec50HPEJQd3xiKvsNu9KiEiqinZnDkmbMu/sKINOVNIdb103ytx7Jhin6TUbboI2/5kbBoGmHwE/Y688U7xxXlYfrCx7lDHUhCinpU9RqzIOx5w26/ozLxUdSJa/lgdEcXeSFyOulGZFjWiLAd+h1jT4043/izihw25pXjkSOqL4Ne9C3tMJMlSfXd3cfxhR8Op//eL6AnKRTryWiKNYAAAAAElFTkSuQmCC") no-repeat center; }

.__webasto .control-icon-webasto .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5CAMAAACWNFwNAAAAM1BMVEVHcEz////////////////////////////////////////////////////////////////P0YphAAAAEHRSTlMAUrJ45SI09gieY8aMFNVBXitE/gAAAhdJREFUWMPdV+2uwyAIbf2o2qrl/Z9269ROxTnqmtzk8msh2Slw4IDT9D9MW30vINtuxoMZ+aQdxzOgUMZSzMN4HABl7LwaruoKAHV6eoPhqi7qCchREYCNNowHDHgEzYYJAZSyPIL2Y3jzC68Khx0u5UbwnAiAovGRdQTQQrQ9c27BNZLzq1gvMxntybf+ECAoiZ2Zj9oyZ4A5Ldvp20Zm5LRzdLOvcGpkJmuPZCK1SeZTCw2PRUCRA55JZxGC17ThCE3ioLTIqs99lkatLvujZNUUzoUybCr82ivAyOre8H3r5XaEiVXfKkRnfZyDJhFgYHUufIKiLrzF8pvVsor93RLSERr3YZa0K5I2BPmLIa4YMDAtFTVnU/zPKYzIJlTGXnOLshssBoyE8czTkW5dF6sRokdz3gF0dYesH0PUJzFqIkUYO6RBtKnUvDsrop57h3sx3SArRRQNGosFl3Eppbu7CBY897iMaXr3731d1WxuyFWugZ6wqYoZ2NKl1WQltCm/tJjk1CLGZIO6URYAqlZFjH1XnLKa8wxtpRlVn+xAOoulwMkZPCrHd8yFm7VMTnvc2E/v5YuBt9gfOV0N3pGcKPkfiBFIi3WqrBh6Tqx47Dn8cLgG2RGFckax9YPvHYtjYeg2vnj9M/xC+6otPR0T9arYf0j4AJwbWkk8MJsp25b48ulOW4afd5+CFu5eQCmnP7EHnYxH0kT9Bf4AAAAASUVORK5CYII=") no-repeat center; }

.__dark .__webasto .control-icon-webasto .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFEAAAA5CAMAAAB59jczAAAAclBMVEVHcEwqrfgqr/kqrvkqrfgqrfgqrvkqrfgqrfgqrfgqrfgss/lCvew1xPostvkp1/sh5vwxwvpLyfQj3PYvyvsj3/wc6vw10fla0/kp0PtHy/JJzflh0/Nk1/c71fMhzPAtr+Yys+g7uepOx+8zye8nvet0B83TAAAAIHRSTlMALjcnEkQaCwIFIFL2emCz2WrK+4fE6qawlOCX9Nz8/GB3HE8AAAOJSURBVFjD3Vhrl6IwDLUP+gAR8IUPRtsi//8vbloQWmdGmO6cs+esH6NNk3uTm9TV6p98JOdS/qpDmmLGQ5uAz184RNWRBB4lRM1FvEOcH0/I9yg4QxWNxUFQlO/a3I9R8DQ5XFmkR8EhZd1kqZcjT7PylqUy0iHZHDvzkTAPBpYc7mCJw1GmSdkps02oj2txhztoJCtJcVeBR4Ah3ylzifMIp/c7pYLzMs2OSulLxuJytqf78+JJPS46MN02Mcw8T8P5isjnJZWNWpka84gQSX9aqXXxPE/xwVl0GVE+EOJBq+f5vqAFy+696VFgKn6M4mY4rfTjjF0fS7LvBtMuR4tbG3TAihfHxRAinD/2THBUjKbleQvKrHgJmpRq/DwOCXO3HCZTkSxTC0FJVoIwQNLd5FHtzghw8z2q3X5R3pKjjRMvSc6eQ5s3XANI+KYleTtpaK/gkaPa96g6mzdH/jUAxTzfICxlB3Iow3AcuWdMAQrjQ5ETvqBN7qrdo88eIcmKcJpsPZMpkznh5QSERa3rL7Luz8MP/CBve8Rnc7ZHLT5QzC8e1aPGFILUXtzljKoB8K5NbhsiATKtPudN0+zi2Wc0aCxqGySo7UV9kTcl1XqytGciF3WyLV6Orq9BOtwo3k8u18VbIOVYbbZ4YeStXz1qSw5NTiM7pnink8LTAdvHFH8O8nFGHPgb2WnfegxKEPKmLLt8ESSFDWD8oq2RfEt1HfRxSIIaB4Sdh8MXbf6W66AEh7zNK92WCmit2uVtZjYByXwuXN7J6QVKW1huSrq829PMAKN4+8Jrmm1Dl7qf3RxfrftmbshCQU5BassriFvIjm7d7He/1BDijJyJADhjeaUjCYHHlRUh85HN7nx+qQGvsErIV3aawSMuTFOR+TWA+0LgSkOG7OimVxuotPa6ZGTDVJhqsN1bGZABO889j5P6hBftuT5wvcfgErUe6kXSjLBlq48H3NAQPl/azaDhuSAX7hQjO7B+9w1hLVPSQ5Msf9HAmCd9Va7H1XjKe7ZJvq1KbRMcx5J4jkDTxL0RpNNam6CcZqR2KEaFODSEbvJJ8EUvlUua5NuZCOH4q5dL2/iX/HRfziEcHzGO6yXC8AbIqoFVTPgjqA6A/fnLKINZL0IcjL0k9gUsOKVchgvRGUCk8a90IWXYEZJdr4j+4l8LQnLG6K/+VwFBw/tBrP6Pzx/WyJS+jpS7/AAAAABJRU5ErkJggg==") no-repeat center; }

.__webasto .control-icon-webasto.control { border: 3px solid #b0c80c; background-color: var(--paper-card-background-color); background-color: #b0c80c; }

.__webasto .control-icon-webasto.control:active { opacity: .8; }

.__dark .__webasto .control-icon-webasto.control { border: 4px solid #000; background: linear-gradient(to bottom, #3c4042 0%, #141c22 100%); }

.__dark .__webasto .control-icon-webasto.control { box-shadow: inset 0 2px 1px 0 #6ecaf1, inset 0 0 0 6px #2bafe5; }

.control-icon-horn .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5BAMAAABTxLEMAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAKlBMVEVHcEyvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyAqvyArbOiNNAAAADXRSTlMAUWaZqnaIwQ7vIDXckYSdNAAAAYJJREFUSMdjYBjMoPY2kQrPEqtwLpEKOe4SqZCRWIXMxCrsvHuLOIW6RCrkmkukQva7RCr0vXv3BjHqlt8lTmHrXOIUbgOpw6aQa6MgHEgLqnneBYMLGOpE5t7FBjAULrl7lyiF3HNxKJyApnDNXSIV1t4lzmrGu0QqBEbq3ZslLnDgbFKDXeFaoFAFqlBjDjaFskADG9BDTBxLzOjevXsFM640MRXG3r17DVMh91kiFTKsRE64UngUMiIrrC1VUlICJuXrSnCguAEmaYusEEso37SCB9stApGXAJFkQSoAsCu8DglVJoIK7zpAUj1hhZcwij0cCqExilSQ1k4xNjYGqr5jDAfmIJUK6EVzIJYA3wl3pKAE3ihkAio8gDWzoynkwJqhocnsMjIfp0Jgwr2DloUmYFUIygoGqJm3AKtCHqDMndRQKAgGlQYBWBWy4gpwjIrnLLrCqzgKw53oCgtwVlGo4E4DrvJ1D6pCD9zVYwyyump8ZfbCsDQoSJJgGHoAAGrjBC6YgJYTAAAAAElFTkSuQmCC") no-repeat center; }

.__dark .control-icon-horn .control-icon { background: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAA5CAMAAACWNFwNAAAACXBIWXMAAC4jAAAuIwF4pT92AAAAS1BMVEVHcEwjRF0ZMUQhQloqVHIrVXMjRV8bNUkZMUUrVXMfPlUfPlYePFIfPlUrVXMaNEkrVXMcN0wbNUkZMUUlSWQrVXMrVXMhQFkmTWlQh0LgAAAAFnRSTlMAC+5578qKZ8xVOUdZI6+c2P69/bfpmcI1EwAAAX9JREFUWMPt192ygiAUBWARBRT509rw/k96KmmmYyJsY+aci9atzici0KppvvkP4ctCq4IUoC7IaoOX2mAHwGt6EiqDpjI4hhs4VQQF1AVNqAsaDzVBJVYPZB3OuAC1QCKpcHF4hSCZzCxSaRfnAwAG5K33IRnYZMwOb/aASQ4kIkBVcEZ6OXDCejlwft7X7eVq7XULHn9lFQeoVXqS1cBsMTitN/XZg0sXghRKN/xoi0BWuFjvr65LHo4Am0YnQTmeAolNgcwJyh+5rCDjO5neHjMmQQh+TVw1fi/OtUa9vzRPz1w+3tGi32VWvtG8+TWL3ccgeFbQbTAgeJlvXygQ5nw/ZNDz4ZG4+umwExoPmvDyqfk+qFTRwiZx+74Q5JYPtp5crxpcxT0AyXr1givhByeIwoPxgBUk2S/vOx3TWeKHnNVenzlTj/oouqXd5tlnOoKt4Zkg/0fonNcTHEj6Y++q0PXvcIwW7d0y2BTXUdKcimS6f4tmw0num7/LD/NvXH77CpRlAAAAAElFTkSuQmCC") no-repeat center; }

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

.wrapper { overflow: hidden; position: relative; height: 270px; padding: 20px 16px 0 16px; opacity: 0; transition: opacity .1s linear; font-size: 15px; line-height: 20px; color: #00aeef; }

.wrapper.__dark { color: #fff; }

.wrapper.__title { padding-top: 0 !important; }

.container { position: relative; margin: 0 auto; }
`;
        card.innerHTML = `<div class="wrapper">
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
                if (state !== null && state !== data.value) {
                    this._info[key].value = state;
                    const unit = key === 'gps' ? '' :
                        this._getAttr(key, 'unit_of_measurement');
                    this._info[key].element.querySelector('.info-i-cnt').textContent = `${state} ${unit}`;
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
