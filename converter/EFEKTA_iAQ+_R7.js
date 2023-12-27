const fz = require('zigbee-herdsman-converters/converters/fromZigbee');
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const reporting = require('zigbee-herdsman-converters/lib/reporting');
const extend = require('zigbee-herdsman-converters/lib/extend');
const constants = require('zigbee-herdsman-converters/lib/constants');
const e = exposes.presets;
const ea = exposes.access;
const {postfixWithEndpointName} = require('zigbee-herdsman-converters/lib/utils');
const {calibrateAndPrecisionRoundOptions} = require('zigbee-herdsman-converters/lib/utils');


const tzLocal = {
	co2_config: {
        key: ['reading_interval', 'auto_backlight', 'night_onoff_backlight', 'onoff_brightness', 'forced_recalibration', 'factory_reset_co2', 'long_chart_period', 'set_altitude', 'manual_forced_recalibration', 'rotate', 'automatic_scal', 'night_on_backlight', 'night_off_backlight'],
        convertSet: async (entity, key, rawValue, meta) => {
            const lookup = {'OFF': 0x00, 'ON': 0x01};
			const endpoint = meta.device.getEndpoint(1);
            const value = lookup.hasOwnProperty(rawValue) ? lookup[rawValue] : parseInt(rawValue, 10);
            const payloads = {
                auto_backlight: ['msCO2', {0x0203: {value, type: 0x10}}],
				night_onoff_backlight: ['msCO2', {0x0401: {value, type: 0x10}}],
				automatic_scal: ['msCO2', {0x0402: {value, type: 0x10}}],
                forced_recalibration: ['msCO2', {0x0202: {value, type: 0x10}}],
                factory_reset_co2: ['msCO2', {0x0206: {value, type: 0x10}}],
				long_chart_period: ['msCO2', {0x0204: {value, type: 0x10}}],
                set_altitude: ['msCO2', {0x0205: {value, type: 0x21}}],
                manual_forced_recalibration: ['msCO2', {0x0207: {value, type: 0x21}}],
				rotate: ['msCO2', {0x0285: {value, type: 0x21}}],
				night_on_backlight: ['msCO2', {0x0405: {value, type: 0x20}}],
				night_off_backlight: ['msCO2', {0x0406: {value, type: 0x20}}],
				reading_interval: ['msCO2', {0x0201: {value, type: 0x21}}],
            };
            await endpoint.write(payloads[key][0], payloads[key][1]);
            return {
                state: {[key]: rawValue},
            };
        },
    },
	temperature_config: {
        key: ['temperature_offset'],
        convertSet: async (entity, key, rawValue, meta) => {
			const endpoint = meta.device.getEndpoint(1);
            const value = parseInt(rawValue, 10)
            const payloads = {
                temperature_offset: ['msTemperatureMeasurement', {0x0210: {value, type: 0x29}}],
            };
            await endpoint.write(payloads[key][0], payloads[key][1]);
            return {
                state: {[key]: rawValue},
            };
        },
    },
	temperaturef_config: {
        key: ['temperature_offset'],
        convertSet: async (entity, key, rawValue, meta) => {
			const endpoint = meta.device.getEndpoint(1);
            const value = parseFloat(rawValue)*10;
            const payloads = {
                temperature_offset: ['msTemperatureMeasurement', {0x0210: {value, type: 0x29}}],
            };
            await endpoint.write(payloads[key][0], payloads[key][1]);
            return {
                state: {[key]: rawValue},
            };
        },
    },
	humidity_config: {
        key: ['humidity_offset'],
        convertSet: async (entity, key, rawValue, meta) => {
			const endpoint = meta.device.getEndpoint(1);
            const value = parseInt(rawValue, 10)
            const payloads = {
                humidity_offset: ['msRelativeHumidity', {0x0210: {value, type: 0x29}}],
            };
            await endpoint.write(payloads[key][0], payloads[key][1]);
            return {
                state: {[key]: rawValue},
            };
        },
    },
	co2_gasstat_config: {
        key: ['high_gas', 'low_gas', 'enable_gas', 'invert_logic_gas'],
        convertSet: async (entity, key, rawValue, meta) => {
			const endpoint = meta.device.getEndpoint(1);
            const lookup = {'OFF': 0x00, 'ON': 0x01};
            const value = lookup.hasOwnProperty(rawValue) ? lookup[rawValue] : parseInt(rawValue, 10);
            const payloads = {
                high_gas: ['msCO2', {0x0221: {value, type: 0x21}}],
                low_gas: ['msCO2', {0x0222: {value, type: 0x21}}],
				enable_gas: ['msCO2', {0x0220: {value, type: 0x10}}],
				invert_logic_gas: ['msCO2', {0x0225: {value, type: 0x10}}],
            };
            await endpoint.write(payloads[key][0], payloads[key][1]);
            return {
                state: {[key]: rawValue},
            };
        },
    },
};

const fzLocal = {
	co2: {
        cluster: 'msCO2',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
			if (msg.data.hasOwnProperty('measuredValue')) {
				return {co2: Math.round(msg.data.measuredValue * 1000000)};
			}
        },
    },
	co2_config: {
        cluster: 'msCO2',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            const result = {};
            if (msg.data.hasOwnProperty(0x0203)) {
                result.auto_backlight = ['OFF', 'ON'][msg.data[0x0203]];
            }
			if (msg.data.hasOwnProperty(0x0401)) {
                result.night_onoff_backlight = ['OFF', 'ON'][msg.data[0x0401]];
            }
			if (msg.data.hasOwnProperty(0x0402)) {
                result.automatic_scal = ['OFF', 'ON'][msg.data[0x0402]];
            }
            if (msg.data.hasOwnProperty(0x0202)) {
                result.forced_recalibration = ['OFF', 'ON'][msg.data[0x0202]];
            }
            if (msg.data.hasOwnProperty(0x0206)) {
                result.factory_reset_co2 = ['OFF', 'ON'][msg.data[0x0206]];
            }
			if (msg.data.hasOwnProperty(0x0204)) {
                result.long_chart_period = ['OFF', 'ON'][msg.data[0x0204]];
            }
            if (msg.data.hasOwnProperty(0x0205)) {
                result.set_altitude = msg.data[0x0205];
            }
            if (msg.data.hasOwnProperty(0x0207)) {
                result.manual_forced_recalibration = msg.data[0x0207];
            }
			if (msg.data.hasOwnProperty(0x0285)) {
                result.rotate = msg.data[0x0285];
            }
			if (msg.data.hasOwnProperty(0x0405)) {
                result.night_on_backlight = msg.data[0x0405];
            }
			 if (msg.data.hasOwnProperty(0x0406)) {
                result.night_off_backlight = msg.data[0x0406];
            }
			if (msg.data.hasOwnProperty(0x0201)) {
                result.reading_interval = msg.data[0x0201];
            }
            return result;
        },
    },
	temperature_config: {
        cluster: 'msTemperatureMeasurement',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            const result = {};
            if (msg.data.hasOwnProperty(0x0210)) {
                result.temperature_offset = msg.data[0x0210];
            }
            return result;
        },
    },
	temperaturef_config: {
        cluster: 'msTemperatureMeasurement',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            const result = {};
            if (msg.data.hasOwnProperty(0x0210)) {
                result.temperature_offset = parseFloat(msg.data[0x0210])/10.0;
            }
            return result;
        },
    },
	humidity: {
        cluster: 'msRelativeHumidity',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
			if (msg.data.hasOwnProperty('measuredValue')) {
			    const humidity = parseFloat(msg.data['measuredValue']) / 100.0;
			    const prope = postfixWithEndpointName('humidity', msg, model, meta);
			    return {[prope]: humidity};
			}
        },
    },
	
    humidity_config: {
        cluster: 'msRelativeHumidity',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            const result = {};
            if (msg.data.hasOwnProperty(0x0210)) {
                result.humidity_offset = msg.data[0x0210];
            }
            return result;
        },
    },
	co2_gasstat_config: {
        cluster: 'msCO2',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            const result = {};
            if (msg.data.hasOwnProperty(0x0221)) {
                result.high_gas = msg.data[0x0221];
            }
			if (msg.data.hasOwnProperty(0x0222)) {
                result.low_gas = msg.data[0x0222];
            }
            if (msg.data.hasOwnProperty(0x0220)) {
                result.enable_gas = ['OFF', 'ON'][msg.data[0x0220]];
            }
			if (msg.data.hasOwnProperty(0x0225)) {
                result.invert_logic_gas = ['OFF', 'ON'][msg.data[0x0225]];
            }
            return result;
        },
    },
};

const definition = {
        zigbeeModel: ['EFEKTA_iAQ+'],
        model: 'EFEKTA_iAQ+',
        vendor: 'Custom devices (DiY)',
        description: '[CO2 Monitor with IPS TFT Display, outdoor temperature and humidity, date and time.](http://efektalab.com/iAQ)',
        fromZigbee: [fz.temperature, fzLocal.humidity, fz.illuminance, fzLocal.co2, fzLocal.co2_config,
            fzLocal.temperaturef_config, fzLocal.humidity_config, fzLocal.co2_gasstat_config],
        toZigbee: [tz.factory_reset, tzLocal.co2_config, tzLocal.temperaturef_config, tzLocal.humidity_config, tzLocal.co2_gasstat_config],
		meta: {multiEndpoint: true},
        configure: async (device, coordinatorEndpoint, logger) => {
            const endpoint = device.getEndpoint(1);
			const endpoint2 = device.getEndpoint(2);
            await reporting.bind(endpoint, coordinatorEndpoint, [
                'genTime', 'msTemperatureMeasurement', 'msRelativeHumidity', 'msCO2']);
		    await reporting.bind(endpoint2, coordinatorEndpoint, ['msIlluminanceMeasurement', 'msTemperatureMeasurement', 'msRelativeHumidity']);
			const payload1 = [{attribute: {ID: 0x0000, type: 0x39},
            minimumReportInterval: 0, maximumReportInterval: 300, reportableChange: 0}];
            await endpoint.configureReporting('msCO2', payload1);
			const payload2 = [{attribute: {ID: 0x0000, type: 0x29},
            minimumReportInterval: 0, maximumReportInterval: 300, reportableChange: 0}];
            await endpoint.configureReporting('msTemperatureMeasurement', payload2);
			const payload3 = [{attribute: {ID: 0x0000, type: 0x21},
            minimumReportInterval: 0, maximumReportInterval: 300, reportableChange: 0}];
			await endpoint.configureReporting('msRelativeHumidity', payload3);
			const payload4 = [{attribute: {ID: 0x0000, type: 0x21},
            minimumReportInterval: 0, maximumReportInterval: 300, reportableChange: 0}];
			await endpoint2.configureReporting('msIlluminanceMeasurement', payload4);
			const payload5 = [{attribute: {ID: 0x0000, type: 0x29},
            minimumReportInterval: 0, maximumReportInterval: 300, reportableChange: 0}];
            await endpoint2.configureReporting('msTemperatureMeasurement', payload5);
			const payload6 = [{attribute: {ID: 0x0000, type: 0x21},
            minimumReportInterval: 0, maximumReportInterval: 300, reportableChange: 0}];
			await endpoint2.configureReporting('msRelativeHumidity', payload6);
        },
        icon: 'data:image/jpeg;base64,/9j/4QfKRXhpZgAATU0AKgAAAAgADAEAAAMAAAABA+gAAAEBAAMAAAABA+gAAAECAAMAAAADAAAAngEGAAMAAAABAAIAAAESAAMAAAABAAEAAAEVAAMAAAABAAMAAAEaAAUAAAABAAAApAEbAAUAAAABAAAArAEoAAMAAAABAAIAAAExAAIAAAAiAAAAtAEyAAIAAAAUAAAA1odpAAQAAAABAAAA7AAAASQACAAIAAgAFfkAAAAnEAAV+QAAACcQQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKFdpbmRvd3MpADIwMjM6MTE6MjkgMTY6Mjk6MjgAAAAABJAAAAcAAAAEMDIyMaABAAMAAAAB//8AAKACAAQAAAABAAAAZKADAAQAAAABAAAAZAAAAAAAAAAGAQMAAwAAAAEABgAAARoABQAAAAEAAAFyARsABQAAAAEAAAF6ASgAAwAAAAEAAgAAAgEABAAAAAEAAAGCAgIABAAAAAEAAAZAAAAAAAAAAEgAAAABAAAASAAAAAH/2P/tAAxBZG9iZV9DTQAB/+4ADkFkb2JlAGSAAAAAAf/bAIQADAgICAkIDAkJDBELCgsRFQ8MDA8VGBMTFRMTGBEMDAwMDAwRDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAENCwsNDg0QDg4QFA4ODhQUDg4ODhQRDAwMDAwREQwMDAwMDBEMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwM/8AAEQgAMgAyAwEiAAIRAQMRAf/dAAQABP/EAT8AAAEFAQEBAQEBAAAAAAAAAAMAAQIEBQYHCAkKCwEAAQUBAQEBAQEAAAAAAAAAAQACAwQFBgcICQoLEAABBAEDAgQCBQcGCAUDDDMBAAIRAwQhEjEFQVFhEyJxgTIGFJGhsUIjJBVSwWIzNHKC0UMHJZJT8OHxY3M1FqKygyZEk1RkRcKjdDYX0lXiZfKzhMPTdePzRieUpIW0lcTU5PSltcXV5fVWZnaGlqa2xtbm9jdHV2d3h5ent8fX5/cRAAICAQIEBAMEBQYHBwYFNQEAAhEDITESBEFRYXEiEwUygZEUobFCI8FS0fAzJGLhcoKSQ1MVY3M08SUGFqKygwcmNcLSRJNUoxdkRVU2dGXi8rOEw9N14/NGlKSFtJXE1OT0pbXF1eX1VmZ2hpamtsbW5vYnN0dXZ3eHl6e3x//aAAwDAQACEQMRAD8A9VWH9Z/rb0v6t4wflE25VgJx8Ssje+NNzifbVTu+nc//AK36tn6Na2Zl04WHfm5B20Y1b7rSBJDK2mx5j+q1fPPW+s5vWM+3qWY4+vlHeG9q6xLaaK/o+2tv6P8Az7f5y5JT0nVf8an1myLC7Huq6dUJiuljXujt6t2U23c7/i6cdDq/xjfXLpuW6jNyC+2kgW4+RXWCO8P9Out/0T/plznTsPLsruzK2MGJjFlWTZa5jWfpzsbUHWts97mtc9762b6qla6103OoqN9zaWUU5JxD6djHh2QWMvs/SU1VMZ6VNlFd3qu9l3qf4X7QncPW0cY2p9Z+qv8AjA6d10txsgDFzSQ0NJ9rifohu76D3/mN97P9HdZYusXzSDfh5DmbgLKHlhLHhzZBh2y2olr2fy617r9RfrA/r31fqyLzuy8dxx8lx03OYGuZb/16iyq2z/hfUQ06KD0KSSSCX//Q7L/GG6xv1L6qa5DvRAMful7BZ/4HuXiLMLLzco04lZtsbW1+0EN9gazc79I5jfpWL3v62UDI+rHVqiJ3Yd8DzFb3M/6QXhOPSy+ujKNQyfsJa7KxiY9TGY71N7SPdtZ78bK2/wAzV6OR/N+olrrVA9LF/wDeq06rYmT1bAbfiVsuZTc4NyqBWNx2bqnsa+yq30Xurstot9P+dpsfRb+iVy67q+TU59bvs9WbY7JvbkGqyy2z1Ld1lr2Ytdn2f1dz2YVv6H7T+t11fpKlGmurLr9LF6QzeWtp+0S97GveK3sssZRVv32Nw8r0Nn/ci7+c9JV8fp9mO82/Za+qMAl2w2BtZpfTbkixz66Wvf6JbRZ/PVsryv8Ai04xka4ZAa78NrYyiDc48X9W+H/nNXKpyqbrWZVfp2MeWP2ta1m5vs/R+i1tG32f4L6a9L/xMOs9DqrT/N7qCB/KIuDv+i1i82ybMfJsFmPi14dLWtZsrLnSQ1oc5z7PpPft3/R9i9S/xOUx0fqF/wDpMkMn+rXW/wD9HIHxN+ISLrXR9BSSSQS//9H1DJpbkY9tDvo2scw/Bw2r5wxbLaPSsqe6q6oyyxhLXNcO7Xfmr6UXzr1en7B1fPw7fY6jJubtcQ0xvdsdDvzX17XsSUlZ1V4lwY/HteQ6y3CsOPvcA4NssxYfjep73+6j7P8Azlirm5opOPWbfs7judQ6yKyRt9z6qtu/+br/AMxVjaJ0tqie/P8A58S9X/haf9f+uI2VUOyR7gdCRuHDQIAC9c/xR1lv1Wsf/pMuxw+TKav/AEWvH3XV7Y3sJ8Q4f+SK9t/xZ0Op+pmCXNLHXOuthwIkOut9J+v5tlXpvYkp6lJJJBT/AP/S9VWF1v8Apbf+S/5sf0/+d5d9H/gl85JJKfeT/wDU7z3TeP8A4nF4Okgl95H0v/Wd+XK7AcD+HC+VkkVF+qkl8qpJIf/Z/+0PllBob3Rvc2hvcCAzLjAAOEJJTQQEAAAAAAAPHAFaAAMbJUccAgAAAgAAADhCSU0EJQAAAAAAEM3P+n2ox74JBXB2rq8Fw044QklNBDoAAAAAAPcAAAAQAAAAAQAAAAAAC3ByaW50T3V0cHV0AAAABQAAAABQc3RTYm9vbAEAAAAASW50ZWVudW0AAAAASW50ZQAAAABJbWcgAAAAD3ByaW50U2l4dGVlbkJpdGJvb2wAAAAAC3ByaW50ZXJOYW1lVEVYVAAAAAEAAAAAAA9wcmludFByb29mU2V0dXBPYmpjAAAAFQQfBDAEQAQwBDwENQRCBEAESwAgBEYEMgQ1BEIEPgQ/BEAEPgQxBEsAAAAAAApwcm9vZlNldHVwAAAAAQAAAABCbHRuZW51bQAAAAxidWlsdGluUHJvb2YAAAAJcHJvb2ZDTVlLADhCSU0EOwAAAAACLQAAABAAAAABAAAAAAAScHJpbnRPdXRwdXRPcHRpb25zAAAAFwAAAABDcHRuYm9vbAAAAAAAQ2xicmJvb2wAAAAAAFJnc01ib29sAAAAAABDcm5DYm9vbAAAAAAAQ250Q2Jvb2wAAAAAAExibHNib29sAAAAAABOZ3R2Ym9vbAAAAAAARW1sRGJvb2wAAAAAAEludHJib29sAAAAAABCY2tnT2JqYwAAAAEAAAAAAABSR0JDAAAAAwAAAABSZCAgZG91YkBv4AAAAAAAAAAAAEdybiBkb3ViQG/gAAAAAAAAAAAAQmwgIGRvdWJAb+AAAAAAAAAAAABCcmRUVW50RiNSbHQAAAAAAAAAAAAAAABCbGQgVW50RiNSbHQAAAAAAAAAAAAAAABSc2x0VW50RiNQeGxAYgAAAAAAAAAAAAp2ZWN0b3JEYXRhYm9vbAEAAAAAUGdQc2VudW0AAAAAUGdQcwAAAABQZ1BDAAAAAExlZnRVbnRGI1JsdAAAAAAAAAAAAAAAAFRvcCBVbnRGI1JsdAAAAAAAAAAAAAAAAFNjbCBVbnRGI1ByY0BZAAAAAAAAAAAAEGNyb3BXaGVuUHJpbnRpbmdib29sAAAAAA5jcm9wUmVjdEJvdHRvbWxvbmcAAAAAAAAADGNyb3BSZWN0TGVmdGxvbmcAAAAAAAAADWNyb3BSZWN0UmlnaHRsb25nAAAAAAAAAAtjcm9wUmVjdFRvcGxvbmcAAAAAADhCSU0D7QAAAAAAEACQAAAAAQABAJAAAAABAAE4QklNBCYAAAAAAA4AAAAAAAAAAAAAP4AAADhCSU0EDQAAAAAABAAAAB44QklNBBkAAAAAAAQAAAAeOEJJTQPzAAAAAAAJAAAAAAAAAAABADhCSU0nEAAAAAAACgABAAAAAAAAAAE4QklNA/UAAAAAAEgAL2ZmAAEAbGZmAAYAAAAAAAEAL2ZmAAEAoZmaAAYAAAAAAAEAMgAAAAEAWgAAAAYAAAAAAAEANQAAAAEALQAAAAYAAAAAAAE4QklNA/gAAAAAAHAAAP////////////////////////////8D6AAAAAD/////////////////////////////A+gAAAAA/////////////////////////////wPoAAAAAP////////////////////////////8D6AAAOEJJTQQAAAAAAAACAAA4QklNBAIAAAAAAAIAADhCSU0EMAAAAAAAAQEAOEJJTQQtAAAAAAAGAAEAAAACOEJJTQQIAAAAAAAQAAAAAQAAAkAAAAJAAAAAADhCSU0EHgAAAAAABAAAAAA4QklNBBoAAAAAAzsAAAAGAAAAAAAAAAAAAABkAAAAZAAAAAMAaQBhAHEAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAGQAAABkAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAEAAAAAAABudWxsAAAAAgAAAAZib3VuZHNPYmpjAAAAAQAAAAAAAFJjdDEAAAAEAAAAAFRvcCBsb25nAAAAAAAAAABMZWZ0bG9uZwAAAAAAAAAAQnRvbWxvbmcAAABkAAAAAFJnaHRsb25nAAAAZAAAAAZzbGljZXNWbExzAAAAAU9iamMA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Oi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjNlYzU1N2I5LTBjMjItNDQ0NS05MjQ3LWNhZTM2NTkyYmIyNiIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpiZTRiZjY4MC1mYTdkLTQzNDEtOTNkMS01MTRjZWE2YzJiYzYiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0iRkNBQTg4MTA5NDdCNzAzNkMyNkQ1QTUxMTk2RDFGQTMiIGRjOmZvcm1hdD0iaW1hZ2UvanBlZyIgcGhvdG9zaG9wOkxlZ2FjeUlQVENEaWdlc3Q9IkU4RjE1Q0YzMkZDMTE4QTFBMjdCNjdBREM1NjRENUJBIiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiBwaG90b3Nob3A6SUNDUHJvZmlsZT0iQWRvYmUgUkdCICgxOTk4KSIgeG1wOkNyZWF0ZURhdGU9IjIwMjItMTEtMDdUMTk6MDc6MzkrMDM6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDIzLTExLTI5VDE2OjI5OjI4KzAzOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIzLTExLTI5VDE2OjI5OjI4KzAzOjAwIiB4bXA6Q3JlYXRvclRvb2w9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE4IChXaW5kb3dzKSI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmYwMThmNGJjLTE3ZTctMzI0OC1hOGY0LTg3YTBjMTNlMDA4ZiIgc3RFdnQ6d2hlbj0iMjAyMy0wMS0wOFQxNjozNTowMSswMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo0YzQwYTljMy1lM2RkLWY0NDEtOTVjYi1kMzg5MjljNTNiMzciIHN0RXZ0OndoZW49IjIwMjMtMDEtMDlUMTM6Mjg6MTIrMDM6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE4IChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY29udmVydGVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJmcm9tIGltYWdlL2pwZWcgdG8gaW1hZ2UvcG5nIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJkZXJpdmVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJjb252ZXJ0ZWQgZnJvbSBpbWFnZS9qcGVnIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6ZDU0NWU4MDMtMWQzMy0yZTRlLWIwODUtYmM1NGU0ZTdlMDBhIiBzdEV2dDp3aGVuPSIyMDIzLTAxLTA5VDEzOjI4OjEyKzAzOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmE2YmQwZjFkLWRlZGUtZjA0NC1iMmVlLTM1NGIyMjYwYTE0MiIgc3RFdnQ6d2hlbj0iMjAyMy0xMS0yOVQxNjoyOToyOCswMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjb252ZXJ0ZWQiIHN0RXZ0OnBhcmFtZXRlcnM9ImZyb20gaW1hZ2UvcG5nIHRvIGltYWdlL2pwZWciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImRlcml2ZWQiIHN0RXZ0OnBhcmFtZXRlcnM9ImNvbnZlcnRlZCBmcm9tIGltYWdlL3BuZyB0byBpbWFnZS9qcGVnIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDpiZTRiZjY4MC1mYTdkLTQzNDEtOTNkMS01MTRjZWE2YzJiYzYiIHN0RXZ0OndoZW49IjIwMjMtMTEtMjlUMTY6Mjk6MjgrMDM6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE4IChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6YTZiZDBmMWQtZGVkZS1mMDQ0LWIyZWUtMzU0YjIyNjBhMTQyIiBzdFJlZjpkb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6NmM1NzczYzItNWRiOS01ZTQxLWJlNjUtZGViNzRiYTYyZjMxIiBzdFJlZjpvcmlnaW5hbERvY3VtZW50SUQ9IkZDQUE4ODEwOTQ3QjcwMzZDMjZENUE1MTE5NkQxRkEzIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAg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',
		exposes: [e.co2(), 
		    exposes.numeric('temperature', ea.STATE).withEndpoint('1').withUnit('°C').withDescription('Measured value of the built-in temperature sensor'),
			exposes.numeric('temperature', ea.STATE).withEndpoint('2').withUnit('°C').withDescription('Measured value of the external temperature sensor'),
			exposes.numeric('humidity', ea.STATE).withEndpoint('1').withUnit('%').withDescription('Measured value of the built-in humidity sensor'),
			exposes.numeric('humidity', ea.STATE).withEndpoint('2').withUnit('%').withDescription('Measured value of the external humidity sensor'),
			e.illuminance_lux(), e.illuminance(),
			exposes.numeric('reading_interval', ea.STATE_SET).withUnit('Seconds').withDescription('Setting the sensor reading interval Setting the time in seconnds, by default 30 seconds')
                .withValueMin(15).withValueMax(300),
            exposes.binary('auto_backlight', ea.STATE_SET, 'ON', 'OFF')
			    .withDescription('Enable or Disable Auto Brightness of the Display'),
		    exposes.binary('night_onoff_backlight', ea.STATE_SET, 'ON', 'OFF')
			    .withDescription('Complete shutdown of the backlight at night mode'),
			exposes.numeric('night_on_backlight', ea.STATE_SET).withUnit('Hr').withDescription('Night mode activation time')
                .withValueMin(0).withValueMax(23),
			exposes.numeric('night_off_backlight', ea.STATE_SET).withUnit('Hr').withDescription('Night mode deactivation time')
                .withValueMin(0).withValueMax(23),
			exposes.binary('long_chart_period', ea.STATE_SET, 'ON', 'OFF')
			    .withDescription('The period of plotting the CO2 level(OFF - 1H | ON - 24H)'),
			exposes.enum('rotate', ea.STATE_SET, [0, 90, 180, 270]).withDescription('Display rotate)'),
			exposes.numeric('set_altitude', ea.STATE_SET).withUnit('meters')
			    .withDescription('Setting the altitude above sea level (for high accuracy of the CO2 sensor)')
                .withValueMin(0).withValueMax(3000),
			exposes.numeric('temperature_offset', ea.STATE_SET).withUnit('°C').withValueStep(0.1).withDescription('Adjust temperature')
                .withValueMin(-50.0).withValueMax(50.0),
            exposes.numeric('humidity_offset', ea.STATE_SET).withUnit('%').withDescription('Adjust humidity')
                .withValueMin(-50).withValueMax(50),
			exposes.binary('automatic_scal', ea.STATE_SET, 'ON', 'OFF')
			    .withDescription('Automatic self calibration'),
			exposes.binary('forced_recalibration', ea.STATE_SET, 'ON', 'OFF')
			    .withDescription('Start FRC (Perform Forced Recalibration of the CO2 Sensor)'),
			exposes.binary('factory_reset_co2', ea.STATE_SET, 'ON', 'OFF').withDescription('Factory Reset CO2 sensor'),
            exposes.numeric('manual_forced_recalibration', ea.STATE_SET).withUnit('ppm')
			    .withDescription('Start Manual FRC (Perform Forced Recalibration of the CO2 Sensor)')
                .withValueMin(0).withValueMax(5000),
		    exposes.binary('enable_gas', ea.STATE_SET, 'ON', 'OFF').withDescription('Enable CO2 Gas Control'),
			exposes.binary('invert_logic_gas', ea.STATE_SET, 'ON', 'OFF').withDescription('Enable invert logic CO2 Gas Control'),
            exposes.numeric('high_gas', ea.STATE_SET).withUnit('ppm').withDescription('Setting High CO2 Gas Border')
                .withValueMin(400).withValueMax(5000),
            exposes.numeric('low_gas', ea.STATE_SET).withUnit('ppm').withDescription('Setting Low CO2 Gas Border')
                .withValueMin(400).withValueMax(5000)],
};

module.exports = definition;