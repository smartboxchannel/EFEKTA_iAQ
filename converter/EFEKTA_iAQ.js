const fz = require('zigbee-herdsman-converters/converters/fromZigbee');
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const reporting = require('zigbee-herdsman-converters/lib/reporting');
//const extend = require('zigbee-herdsman-converters/lib/extend');
const constants = require('zigbee-herdsman-converters/lib/constants');
const e = exposes.presets;
const ea = exposes.access;
const {calibrateAndPrecisionRoundOptions} = require('zigbee-herdsman-converters/lib/utils');

async function onEventSetLocalTime(type, data, device) {
 
    if (data.type === 'attributeReport' && data.cluster === 'genTime') {
        try {	
        	const endpoint = device.getEndpoint(1);
	    	const time = Math.round((((new Date()).getTime() - constants.OneJanuary2000) / 1000) + (((new Date()).getTimezoneOffset() * -1) * 60));
	    	await endpoint.write('genTime', {time: time});
        }catch (error) {
            // endpoint.write can throw an error which needs to
            // be caught or the zigbee-herdsman may crash
            // Debug message is handled in the zigbee-herdsman
        }
    }
}


const tzLocal = {
    node_config: {
        key: ['report_delay'],
        convertSet: async (entity, key, rawValue, meta) => {
            const lookup = {'OFF': 0x00, 'ON': 0x01};
            const value = lookup.hasOwnProperty(rawValue) ? lookup[rawValue] : parseInt(rawValue, 10);
            const payloads = {
                report_delay: ['genPowerCfg', {0x0201: {value, type: 0x21}}],
            };
            await entity.write(payloads[key][0], payloads[key][1]);
            return {
                state: {[key]: rawValue},
            };
        },
    },
	co2_config: {
        key: ['auto_brightness', 'forced_recalibration', 'factory_reset_co2', 'long_chart_period', 'set_altitude', 'manual_forced_recalibration'],
        convertSet: async (entity, key, rawValue, meta) => {
            const lookup = {'OFF': 0x00, 'ON': 0x01};
            const value = lookup.hasOwnProperty(rawValue) ? lookup[rawValue] : parseInt(rawValue, 10);
            const payloads = {
                auto_brightness: ['msCO2', {0x0203: {value, type: 0x10}}],
                forced_recalibration: ['msCO2', {0x0202: {value, type: 0x10}}],
                factory_reset_co2: ['msCO2', {0x0206: {value, type: 0x10}}],
                long_chart_period: ['msCO2', {0x0204: {value, type: 0x10}}],
                set_altitude: ['msCO2', {0x0205: {value, type: 0x21}}],
                manual_forced_recalibration: ['msCO2', {0x0207: {value, type: 0x21}}],
            };
            await entity.write(payloads[key][0], payloads[key][1]);
            return {
                state: {[key]: rawValue},
            };
        },
    },
	temperature_config: {
        key: ['temperature_offset'],
        convertSet: async (entity, key, rawValue, meta) => {
            const value = parseInt(rawValue, 10)
            const payloads = {
                temperature_offset: ['msTemperatureMeasurement', {0x0210: {value, type: 0x29}}],
            };
            await entity.write(payloads[key][0], payloads[key][1]);
            return {
                state: {[key]: rawValue},
            };
        },
    },
	temperaturef_config: {
        key: ['temperature_offset'],
        convertSet: async (entity, key, rawValue, meta) => {
            const value = parseFloat(rawValue)*10;
            const payloads = {
                temperature_offset: ['msTemperatureMeasurement', {0x0210: {value, type: 0x29}}],
            };
            await entity.write(payloads[key][0], payloads[key][1]);
            return {
                state: {[key]: rawValue},
            };
        },
    },
	humidity_config: {
        key: ['humidity_offset'],
        convertSet: async (entity, key, rawValue, meta) => {
            const value = parseInt(rawValue, 10)
            const payloads = {
                humidity_offset: ['msRelativeHumidity', {0x0210: {value, type: 0x29}}],
            };
            await entity.write(payloads[key][0], payloads[key][1]);
            return {
                state: {[key]: rawValue},
            };
        },
    },
	co2_gasstat_config: {
        key: ['high_gas', 'low_gas', 'enable_gas', 'invert_logic_gas'],
        convertSet: async (entity, key, rawValue, meta) => {
            const lookup = {'OFF': 0x00, 'ON': 0x01};
            const value = lookup.hasOwnProperty(rawValue) ? lookup[rawValue] : parseInt(rawValue, 10);
            const payloads = {
                high_gas: ['msCO2', {0x0221: {value, type: 0x21}}],
                low_gas: ['msCO2', {0x0222: {value, type: 0x21}}],
                enable_gas: ['msCO2', {0x0220: {value, type: 0x10}}],
                invert_logic_gas: ['msCO2', {0x0225: {value, type: 0x10}}],
            };
            await entity.write(payloads[key][0], payloads[key][1]);
            return {
                state: {[key]: rawValue},
            };
        },
    },
};

const fzLocal = {
	local_time: {
        cluster: 'genTime',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            return {local_time: msg.data.localTime};
        },
    },
    node_config: {
        cluster: 'genPowerCfg',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            const result = {};
            if (msg.data.hasOwnProperty(0x0201)) {
                result.report_delay = msg.data[0x0201];
            }
            return result;
        },
    },
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
                result.auto_brightness = ['OFF', 'ON'][msg.data[0x0203]];
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
	illuminance: {
        cluster: 'msIlluminanceMeasurement',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
            const result = {};
            if (msg.data.hasOwnProperty('measuredValue')) {
                const illuminance_raw = msg.data['measuredValue'];
                const illuminance = illuminance_raw === 0 ? 0 : Math.pow(10, (illuminance_raw - 1) / 10000);
                result.illuminance = illuminance;
                result.illuminance_raw = illuminance_raw;
                }
            return result;
        },
    },
};

const definition = {
        zigbeeModel: ['EFEKTA_iAQ'],
        model: 'EFEKTA_iAQ',
        vendor: 'Custom devices (DiY)',
        description: '[CO2 Monitor with IPS TFT Display, outdoor temperature and humidity, date and time.](http://efektalab.com/iAQ)',
        fromZigbee: [fz.temperature, fz.humidity, fzLocal.illuminance, fzLocal.co2, fzLocal.co2_config,
            fzLocal.temperaturef_config, fzLocal.humidity_config, fzLocal.local_time, fzLocal.co2_gasstat_config],
        toZigbee: [tz.factory_reset, tzLocal.co2_config, tzLocal.temperaturef_config, tzLocal.humidity_config, tzLocal.co2_gasstat_config],
        onEvent: onEventSetLocalTime,
        configure: async (device, coordinatorEndpoint, logger) => {
            const endpoint = device.getEndpoint(1);
            const endpoint2 = device.getEndpoint(2);
            await reporting.bind(endpoint, coordinatorEndpoint, [
                'genTime', 'msTemperatureMeasurement', 'msRelativeHumidity', 'msCO2']);
            await reporting.bind(endpoint2, coordinatorEndpoint, ['msIlluminanceMeasurement']);
        },
        icon: 'data:image/jpeg;base64,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/////////////////////////////wPoAAAAAP////////////////////////////8D6AAAAAD/////////////////////////////A+gAAAAA/////////////////////////////wPoAAA4QklNBAAAAAAAAAIAADhCSU0EAgAAAAAAAgAAOEJJTQQwAAAAAAABAQA4QklNBC0AAAAAAAYAAQAAAAI4QklNBAgAAAAAABAAAAABAAACQAAAAkAAAAAAOEJJTQQeAAAAAAAEAAAAADhCSU0EGgAAAAADPQAAAAYAAAAAAAAAAAAAAH0AAAB9AAAABABpAEEAUQAyAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAB9AAAAfQAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAABAAAAABAAAAAAAAbnVsbAAAAAIAAAAGYm91bmRzT2JqYwAAAAEAAAAAAABSY3QxAAAABAAAAABUb3AgbG9uZwAAAAAAAAAATGVmdGxvbmcAAAAAAAAAAEJ0b21sb25nAAAAfQAAAABSZ2h0bG9uZwAAAH0AAAAGc2xpY2VzVmxMcwAAAAFPYmpjAAAAAQAAAAAABXNsaWNlAAAAEgAAAAdzbGljZUlEbG9uZwAAAAAAAAAHZ3JvdXBJRGxvbmcAAAAAAAAABm9yaWdpbmVudW0AAAAMRVNsaWNlT3JpZ2luAAAADWF1dG9HZW5lcmF0ZWQAAAAAVHlwZWVudW0AAAAKRVNsaWNlVHlwZQAAAABJbWcgAAAABmJvdW5kc09iamMAAAABAAAAAAAAUmN0MQAAAAQAAAAAVG9wIGxvbmcAAAAAAAAAAExlZnRsb25nAAAAAAAAAABCdG9tbG9uZwAAAH0AAAAAUmdodGxvbmcAAAB9AAAAA3VybFRFWFQAAAABAAAAAAAAbnVsbFRFWFQAAAABAAAAAAAATXNnZVRFWFQAAAABAAAAAAAGYWx0VGFnVEVYVAAAAAEAAAAAAA5jZWxsVGV4dElzSFRNTGJvb2wBAAAACGNlbGxUZXh0VEVYVAAAAAEAAAAAAAlob3J6QWxpZ25lbnVtAAAAD0VTbGljZUhvcnpBbGlnbgAAAAdkZWZhdWx0AAAACXZlcnRBbGlnbmVudW0AAAAPRVNsaWNlVmVy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OjA2OjM5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIiB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKFdpbmRvd3MpIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyMy0wNi0xNFQxOToyOToyMCswMzowMCIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMy0xMS0zMFQyMjoyNTo1NCswMzowMCIgeG1wOk1vZGlmeURhdGU9IjIwMjMtMTEtMzBUMjI6MjU6NTQrMDM6MDAiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6ZTNjYzgwYTktYTNiNS01NTQ4LWI4NzQtODY0MzkzZmUwYjRjIiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6YjYwZWYzOTctMjZlZC0xMTQ0LWI2YjYtNmRmNGM2ODQzZjZjIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6NWZjNjc3YWEtYjQ4ZS05OTQwLTkzYTUtMzAwZDM2NjM4NGRmIiBkYzpmb3JtYXQ9ImltYWdlL2pwZWciIHBob3Rvc2hvcDpDb2xvck1vZGU9IjMiIHBob3Rvc2hvcDpJQ0NQcm9maWxlPSJBZG9iZSBSR0IgKDE5OTgpIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo1ZmM2NzdhYS1iNDhlLTk5NDAtOTNhNS0zMDBkMzY2Mzg0ZGYiIHN0RXZ0OndoZW49IjIwMjMtMDYtMTRUMTk6Mjk6MjArMDM6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE4IChXaW5kb3dzKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MjIwODhkMTgtODM3Yi1lMTQ1LTg0M2EtNjFiZjI5YTJjMmMwIiBzdEV2dDp3aGVuPSIyMDIzLTA2LTE0VDE5OjI5OjIwKzAzOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249InNhdmVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjNjODE3M2E4LWRmOTItMDU0OC05ZjgwLWQyNmQ0MWRmYjVmNiIgc3RFdnQ6d2hlbj0iMjAyMy0xMS0zMFQyMjoyNTo1NCswMzowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKFdpbmRvd3MpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjb252ZXJ0ZWQiIHN0RXZ0OnBhcmFtZXRlcnM9ImZyb20gaW1hZ2UvcG5nIHRvIGltYWdlL2pwZWciLz4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImRlcml2ZWQiIHN0RXZ0OnBhcmFtZXRlcnM9ImNvbnZlcnRlZCBmcm9tIGltYWdlL3BuZyB0byBpbWFnZS9qcGVnIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDplM2NjODBhOS1hM2I1LTU1NDgtYjg3NC04NjQzOTNmZTBiNGMiIHN0RXZ0OndoZW49IjIwMjMtMTEtMzBUMjI6MjU6NTQrMDM6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCBDQyAyMDE4IChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6M2M4MTczYTgtZGY5Mi0wNTQ4LTlmODAtZDI2ZDQxZGZiNWY2IiBzdFJlZjpkb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6MzViMmQ3MDctZDc0MS01ZDQ0LTliYzUtZTYyOWY2N2Y1MDMyIiBzdFJlZjpvcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6NWZjNjc3YWEtYjQ4ZS05OTQwLTkzYTUtMzAwZDM2NjM4NGRmIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDw/eHBhY2tldCBlbmQ9InciPz7/4gJASUNDX1BST0ZJTEUAAQEAAAIwQURCRQIQAABtbnRyUkdCIFhZWiAHzwAGAAMAAAAAAABhY3NwQVBQTAAAAABub25lAAAAAAAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLUFEQkUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAApjcHJ0AAAA/AAAADJkZXNjAAABMAAAAGt3dHB0AAABnAAAABRia3B0AAABsAAAABRyVFJDAAAB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',
        exposes: [e.co2(), e.temperature(), e.humidity(), e.illuminance(), e.illuminance_raw(),
            exposes.binary('auto_brightness', ea.STATE_SET, 'ON', 'OFF')
                .withDescription('Enable or Disable Auto Brightness of the Display'),
            exposes.binary('long_chart_period', ea.STATE_SET, 'ON', 'OFF')
                .withDescription('The period of plotting the CO2 level(OFF - 1H | ON - 24H)'),
            exposes.numeric('set_altitude', ea.STATE_SET).withUnit('meters')
                .withDescription('Setting the altitude above sea level (for high accuracy of the CO2 sensor)')
                .withValueMin(0).withValueMax(3000),
            exposes.numeric('temperature_offset', ea.STATE_SET).withUnit('°C').withValueStep(0.1).withDescription('Adjust temperature')
                .withValueMin(-50.0).withValueMax(50.0),
            exposes.numeric('humidity_offset', ea.STATE_SET).withUnit('%').withDescription('Adjust humidity')
                .withValueMin(0).withValueMax(99),
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
