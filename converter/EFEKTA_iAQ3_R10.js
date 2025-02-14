const fz = require('zigbee-herdsman-converters/converters/fromZigbee');
const tz = require('zigbee-herdsman-converters/converters/toZigbee');
const exposes = require('zigbee-herdsman-converters/lib/exposes');
const reporting = require('zigbee-herdsman-converters/lib/reporting');
const constants = require('zigbee-herdsman-converters/lib/constants');
const e = exposes.presets;
const ea = exposes.access;
const {calibrateAndPrecisionRoundOptions} = require('zigbee-herdsman-converters/lib/utils');


const tzLocal = {
    PM_config: {
        key: ['report_delay'],
        convertSet: async (entity, key, rawValue, meta) => {
			const endpoint = meta.device.getEndpoint(1);
            const lookup = {'OFF': 0x00, 'ON': 0x01};
            const value = lookup.hasOwnProperty(rawValue) ? lookup[rawValue] : parseInt(rawValue, 10);
            const payloads = {
                report_delay: ['genPowerCfg', {0x0201: {value, type: 0x21}}],
            };
            await endpoint.write(payloads[key][0], payloads[key][1]);
            return {
                state: {[key]: rawValue},
            };
        },
    },
	CO2_config: {
        key: ['forced_recalibration', 'factory_reset_co2', 'set_altitude', 'manual_forced_recalibration', 'automatic_scal'],
        convertSet: async (entity, key, rawValue, meta) => {
			const endpoint = meta.device.getEndpoint(2);
            const lookup = {'OFF': 0x00, 'ON': 0x01};
            const value = lookup.hasOwnProperty(rawValue) ? lookup[rawValue] : parseInt(rawValue, 10);
            const payloads = {
                forced_recalibration: ['msCO2', {0x0202: {value, type: 0x10}}],
				automatic_scal: ['msCO2', {0x0402: {value, type: 0x10}}],
                factory_reset_co2: ['msCO2', {0x0206: {value, type: 0x10}}],
                set_altitude: ['msCO2', {0x0205: {value, type: 0x21}}],
                manual_forced_recalibration: ['msCO2', {0x0207: {value, type: 0x21}}],
            };
            await endpoint.write(payloads[key][0], payloads[key][1]);
            return {
                state: {[key]: rawValue},
            };
        },
    },
	
	PM_config: {
        key: ['auto_brightness', 'night_onoff_backlight', 'forced_recalibration', 'factory_reset_co2', 'long_chart_period', 
		     'long_chart_period2', 'set_altitude', 'manual_forced_recalibration', 'rotate', 'automatic_scal', 
			 'night_on_backlight', 'night_off_backlight', 'external_or_internal'],
        convertSet: async (entity, key, rawValue, meta) => {
			const endpoint = meta.device.getEndpoint(2);
            const lookup = {'OFF': 0x00, 'ON': 0x01};
            const value = lookup.hasOwnProperty(rawValue) ? lookup[rawValue] : parseInt(rawValue, 10);
            const payloads = {
                auto_brightness: ['msCO2', {0x0203: {value, type: 0x10}}],
				night_onoff_backlight: ['msCO2', {0x0401: {value, type: 0x10}}],
                forced_recalibration: ['msCO2', {0x0202: {value, type: 0x10}}],
				automatic_scal: ['msCO2', {0x0402: {value, type: 0x10}}],
                factory_reset_co2: ['msCO2', {0x0206: {value, type: 0x10}}],
				long_chart_period: ['msCO2', {0x0204: {value, type: 0x10}}],
				long_chart_period2: ['msCO2', {0x0404: {value, type: 0x10}}],
                set_altitude: ['msCO2', {0x0205: {value, type: 0x21}}],
                manual_forced_recalibration: ['msCO2', {0x0207: {value, type: 0x21}}],
				rotate: ['msCO2', {0x0285: {value, type: 0x21}}],
				night_on_backlight: ['msCO2', {0x0405: {value, type: 0x20}}],
				night_off_backlight: ['msCO2', {0x0406: {value, type: 0x20}}],
				external_or_internal: ['msCO2', {0x0288: {value, type: 0x10}}],
            };
            await endpoint.write(payloads[key][0], payloads[key][1]);
            return {
                state: {[key]: rawValue},
            };
        },
    },
/*	
	voc_config: {
        key: ['voc_raw_data'],
		 convertGet: async (entity, key, meta) => {
			const endpoint = meta.device.getEndpoint(2);
            const payloads = {
                voc_raw_data: ['genAnalogInput', 0x0065],
            };
            await endpoint.read(payloads[key][0], [payloads[key][1]]);
        },
    },
*/	
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
	air_quality: {
        cluster: 'genAnalogInput',
        type: ['attributeReport', 'readResponse'],
        convert: (model, msg, publish, options, meta) => {
			const result = {};
            //if (msg.data.hasOwnProperty(0x0065)) {
            //    result.voc_raw_data = msg.data[0x0065];
            //}
			if (msg.data.hasOwnProperty('presentValue')) {
			    result.voc_index = msg.data.presentValue;
			}
			return result;
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
			if (msg.data.hasOwnProperty(0x0404)) {
                result.long_chart_period2 = ['OFF', 'ON'][msg.data[0x0404]];
            }
            if (msg.data.hasOwnProperty(0x0205)) {
                result.set_altitude = msg.data[0x0205];
            }
            if (msg.data.hasOwnProperty(0x0207)) {
                result.manual_forced_recalibration = msg.data[0x0207];
            }
			if (msg.data.hasOwnProperty(0x0405)) {
                result.night_on_backlight = msg.data[0x0405];
            }
			if (msg.data.hasOwnProperty(0x0406)) {
                result.night_off_backlight = msg.data[0x0406];
            }
			if (msg.data.hasOwnProperty(0x0285)) {
                result.rotate = msg.data[0x0285];
            }
			if (msg.data.hasOwnProperty(0x0288)) {
                result.external_or_internal = ['OFF', 'ON'][msg.data[0x0288]];
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
        zigbeeModel: ['EFEKTA_iAQ3'],
        model: 'EFEKTA_iAQ3',
        vendor: 'Efekta',
        description: '[CO2 Monitor with IPS TFT Display, outdoor temperature and humidity, date and time.](http://efektalab.com/iAQ)',
        fromZigbee: [fz.temperature, fz.humidity, fzLocal.illuminance, fzLocal.co2, fzLocal.air_quality, fzLocal.temperaturef_config, fzLocal.humidity_config, fzLocal.co2_config, fzLocal.co2_gasstat_config],
        toZigbee: [tz.factory_reset, tzLocal.co2_config, tzLocal.temperaturef_config, tzLocal.humidity_config, tzLocal.co2_gasstat_config],
		meta: {multiEndpoint: true},
        configure: async (device, coordinatorEndpoint, logger) => {
            const endpoint = device.getEndpoint(1);
			const endpoint2 = device.getEndpoint(2);
            await reporting.bind(endpoint, coordinatorEndpoint, [
                'msTemperatureMeasurement', 'msRelativeHumidity', 'msCO2']);
		    await reporting.bind(endpoint2, coordinatorEndpoint, ['msIlluminanceMeasurement', 'genAnalogInput', 'msTemperatureMeasurement', 'msRelativeHumidity']);
			const payload1 = [{attribute: {ID: 0x0000, type: 0x39},
            minimumReportInterval: 10, maximumReportInterval: 600, reportableChange: 0.000001}];
            await endpoint.configureReporting('msCO2', payload1);
			const payload2 = [{attribute: {ID: 0x0000, type: 0x29},
            minimumReportInterval: 10, maximumReportInterval: 600, reportableChange: 10}];
            await endpoint.configureReporting('msTemperatureMeasurement', payload2);
			const payload3 = [{attribute: {ID: 0x0000, type: 0x21},
            minimumReportInterval: 10, maximumReportInterval: 600, reportableChange: 20}];
			await endpoint.configureReporting('msRelativeHumidity', payload3);
			const payload4 = [{attribute: {ID: 0x0055, type: 0x39},
            minimumReportInterval: 10, maximumReportInterval: 600, reportableChange: 1}];
			await endpoint2.configureReporting('genAnalogInput', payload4);
			const payload5 = [{attribute: {ID: 0x0000, type: 0x21},
            minimumReportInterval: 10, maximumReportInterval: 600, reportableChange: 10}];
			await endpoint2.configureReporting('msIlluminanceMeasurement', payload5);
			const payload6 = [{attribute: {ID: 0x0000, type: 0x29},
            minimumReportInterval: 10, maximumReportInterval: 600, reportableChange: 10}];
            await endpoint2.configureReporting('msTemperatureMeasurement', payload6);
			const payload7 = [{attribute: {ID: 0x0000, type: 0x21},
            minimumReportInterval: 10, maximumReportInterval: 600, reportableChange: 20}];
			await endpoint2.configureReporting('msRelativeHumidity', payload7);
        },
        icon: 'data:image/gif;base64,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',
        exposes: [e.co2(), 
			exposes.numeric('temperature', ea.STATE).withEndpoint('1').withUnit('°C').withDescription('Measured value of the built-in temperature sensor'),
			exposes.numeric('temperature', ea.STATE).withEndpoint('2').withUnit('°C').withDescription('Measured value of the external temperature sensor'),
			exposes.numeric('humidity', ea.STATE).withEndpoint('1').withUnit('%').withDescription('Measured value of the built-in humidity sensor'),
			exposes.numeric('humidity', ea.STATE).withEndpoint('2').withUnit('%').withDescription('Measured value of the external humidity sensor'),
		    exposes.numeric('voc_index', ea.STATE).withUnit('VOC Index points').withDescription('VOC INDEX'),
			e.illuminance(), e.illuminance_raw(),
            exposes.binary('auto_brightness', ea.STATE_SET, 'ON', 'OFF')
			    .withDescription('Enable or Disable Auto Brightness of the Display'),
		    exposes.binary('night_onoff_backlight', ea.STATE_SET, 'ON', 'OFF')
			    .withDescription('Complete shutdown of the backlight at night mode'),
			exposes.numeric('night_on_backlight', ea.STATE_SET).withUnit('Hr').withDescription('Night mode activation time')
                .withValueMin(0).withValueMax(23),
			exposes.numeric('night_off_backlight', ea.STATE_SET).withUnit('Hr').withDescription('Night mode deactivation time')
                .withValueMin(0).withValueMax(23),
			exposes.enum('rotate', ea.STATE_SET, [0, 90, 180, 270]).withDescription('Display rotate)'),
			exposes.binary('long_chart_period', ea.STATE_SET, 'ON', 'OFF')
			    .withDescription('The period of plotting the CO2 level(OFF - 1H | ON - 24H)'),
			exposes.binary('long_chart_period2', ea.STATE_SET, 'ON', 'OFF')
			    .withDescription('The period of plotting the VOC Index points(OFF - 1H | ON - 24H)'),
			exposes.numeric('set_altitude', ea.STATE_SET).withUnit('meters')
			    .withDescription('Setting the altitude above sea level (for high accuracy of the CO2 sensor)')
                .withValueMin(0).withValueMax(3000),
			exposes.numeric('temperature_offset', ea.STATE_SET).withUnit('°C').withValueStep(0.1).withDescription('Adjust temperature')
                .withValueMin(-50.0).withValueMax(50.0),
            exposes.numeric('humidity_offset', ea.STATE_SET).withUnit('%').withDescription('Adjust humidity')
                .withValueMin(-50).withValueMax(50),
			exposes.binary('external_or_internal', ea.STATE_SET, 'ON', 'OFF')
			    .withDescription('Display data from external or internal TH sensor'),
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
