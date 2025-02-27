// ############################################################################//
//                                                                             //
//    ... перезагрузить z2m, что бы конвертер применился                       //
//                                                                             //
//#############################################################################//

const {
    binary,
    enumLookup,
    numeric,
	co2,
    temperature,
	humidity,
	illuminance,
	deviceEndpoints,
} = require('zigbee-herdsman-converters/lib/modernExtend');

const defaultReporting = {min: 0, max: 300, change: 0};
const normalReporting = {min: 0, max: 3600, change: 0};
const rareReporting = {min: 0, max: 21600, change: 0};
const rarestReporting = {min: 0, max: 64800, change: 0};
const oneReporting = {min: 45, max: 1800, change: 1};
const twoReporting = {min: 45, max: 1800, change: 10};
const threeReporting = {min: 30, max: 1800, change: 1};
const fourReporting = {min: 30, max: 1800, change: 10};
const fiveReporting = {min: 1800, max: 10600, change: 1};
const sixReporting = {min: 3600, max: 21600, change: 1};
const co2Reporting = {min: 10, max: 600, change: 0.000001};
const pmReporting = {min: 10, max: 600, change: 0.1};
const pm2Reporting = {min: 10, max: 600, change: 0.01};

const definition = {
        zigbeeModel: ["EFEKTA_iAQ3"],
        model: "EFEKTA_iAQ3",
        vendor: "EFEKTA",
        description: "CO2 Monitor with IPS TFT Display, outdoor temperature and humidity, date and time",
        extend: [
            deviceEndpoints({endpoints: {"1": 1, "2": 2}}),
            co2({
				reporting: co2Reporting,
				access: "STATE",
				}),
            temperature({
                endpointNames: ["1"],
                description: "Measured value of the built-in temperature sensor",
                reporting: fourReporting,
				access: "STATE",
            }),
            temperature({
                endpointNames: ["2"],
                description: "Measured value of the external temperature sensor",
                reporting: fourReporting,
				access: "STATE",
            }),
            humidity({
                endpointNames: ["1"],
                description: "Measured value of the built-in humidity sensor",
                reporting: fourReporting,
				access: "STATE",
            }),
            humidity({
                endpointNames: ["2"],
                description: "Measured value of the external humidity sensor",
                reporting: fourReporting,
				access: "STATE",
            }),
            numeric({
                name: "voc_index",
                unit: "VOC Index points",
                cluster: "genAnalogInput",
                attribute: "presentValue",
                description: "VOC index",
                access: "STATE",
                reporting: defaultReporting,
            }),
            illuminance({
                access: "STATE",
                reporting: defaultReporting,
            }),
            binary({
                name: "auto_brightness",
                valueOn: ["ON", 1],
                valueOff: ["OFF", 0],
                cluster: "msCO2",
                attribute: {ID: 0x0203, type: 0x10},
                description: "Enable or Disable Auto Brightness of the Display",
				access: "STATE_SET",
            }),
            binary({
                name: "night_onoff_backlight",
                valueOn: ["ON", 1],
                valueOff: ["OFF", 0],
                cluster: "msCO2",
                attribute: {ID: 0x0401, type: 0x10},
                description: "Complete shutdown of the backlight at night mode",
				access: "STATE_SET",
            }),
            numeric({
                name: "night_on_backlight",
                unit: "Hr",
                valueMin: 0,
                valueMax: 23,
                cluster: "msCO2",
                attribute: {ID: 0x0405, type: 0x20},
                description: "Night mode activation time",
				access: "STATE_SET",
            }),
            numeric({
                name: "night_off_backlight",
                unit: "Hr",
                valueMin: 0,
                valueMax: 23,
                cluster: "msCO2",
                attribute: {ID: 0x0406, type: 0x20},
                description: "Night mode deactivation time",
				access: "STATE_SET",
            }),
            enumLookup({
                name: "rotate",
                lookup: {"0": 0, "90": 90, "180": 180, "270": 270},
                cluster: "msCO2",
                attribute: {ID: 0x0285, type: 0x21},
                description: "Display rotation angle",
				access: "STATE_SET",
            }),
            enumLookup({
                name: "long_chart_period",
                //valueOn: ["ON", 1],
                //valueOff: ["OFF", 0],
				lookup: {"1H": 0, "24H": 1},
                cluster: "msCO2",
                attribute: {ID: 0x0204, type: 0x10},
                description: "The period of plotting the CO2 level(OFF - 1H | ON - 24H)",
				access: "STATE_SET",
            }),
            enumLookup({
                name: "long_chart_period2",
                //valueOn: ["ON", 1],
                //valueOff: ["OFF", 0],
				lookup: {"1H": 0, "24H": 1},
                cluster: "msCO2",
                attribute: {ID: 0x0404, type: 0x10},
                description: "The period of plotting the VOC Index points(OFF - 1H | ON - 24H)",
				access: "STATE_SET",
            }),
            numeric({
                name: "set_altitude",
                unit: "meters",
                valueMin: 0,
                valueMax: 3000,
                cluster: "msCO2",
                attribute: {ID: 0x0205, type: 0x21},
                description: "Setting the altitude above sea level (for high accuracy of the CO2 sensor)",
				access: "STATE_SET",
            }),
            numeric({
                name: "temperature_offset",
                unit: "°C",
                valueMin: -50,
                valueMax: 50,
                valueStep: 0.1,
                scale: 10,
                cluster: "msTemperatureMeasurement",
                attribute: {ID: 0x0210, type: 0x29},
                description: "Adjust temperature",
				access: "STATE_SET",
            }),
            numeric({
                name: "humidity_offset",
                unit: "%",
                valueMin: -50,
                valueMax: 50,
                valueStep: 1,
                cluster: "msRelativeHumidity",
                attribute: {ID: 0x0210, type: 0x29},
                description: "Adjust humidity",
				access: "STATE_SET",
            }),
            enumLookup({
                name: "th_sensor",
                //valueOn: ["EXTERNAL", 1],
                //valueOff: ["INTERNAL", 0],
				lookup: {"INTERNAL": 0, "EXTERNAL": 1},
                cluster: "msCO2",
                attribute: {ID: 0x0288, type: 0x10},
                description: "Display data from internal or external TH sensor",
				access: "STATE_SET",
            }),
            binary({
                name: "automatic_scal",
                valueOn: ["ON", 1],
                valueOff: ["OFF", 0],
                cluster: "msCO2",
                attribute: {ID: 0x0402, type: 0x10},
                description: "Automatic self calibration",
				access: "STATE_SET",
            }),
            binary({
                name: "forced_recalibration",
                valueOn: ["ON", 1],
                valueOff: ["OFF", 0],
                cluster: "msCO2",
                attribute: {ID: 0x0202, type: 0x10},
                description: "Start FRC (Perform Forced Recalibration of the CO2 Sensor)",
				access: "STATE_SET",
            }),
            binary({
                name: "factory_reset_co2",
                valueOn: ["ON", 1],
                valueOff: ["OFF", 0],
                cluster: "msCO2",
                attribute: {ID: 0x0206, type: 0x10},
                description: "Factory Reset CO2 sensor",
				access: "STATE_SET",
            }),
            numeric({
                name: "manual_forced_recalibration",
                unit: "ppm",
                valueMin: 0,
                valueMax: 5000,
                cluster: "msCO2",
                attribute: {ID: 0x0207, type: 0x21},
                description: "Start Manual FRC (Perform Forced Recalibration of the CO2 Sensor)",
				access: "STATE_SET",
            }),
            binary({
                name: "enable_gas",
                valueOn: ["ON", 1],
                valueOff: ["OFF", 0],
                cluster: "msCO2",
                attribute: {ID: 0x0220, type: 0x10},
                description: "Enable CO2 Gas Control",
				access: "STATE_SET",
            }),
            binary({
                name: "invert_logic_gas",
                valueOn: ["ON", 1],
                valueOff: ["OFF", 0],
                cluster: "msCO2",
                attribute: {ID: 0x0225, type: 0x10},
                description: "Enable invert logic CO2 Gas Control",
				access: "STATE_SET",
            }),
            numeric({
                name: "high_gas",
                unit: "ppm",
                valueMin: 400,
                valueMax: 5000,
                cluster: "msCO2",
                attribute: {ID: 0x0221, type: 0x21},
                description: "Setting High CO2 Gas Border",
				access: "STATE_SET",
            }),
            numeric({
                name: "low_gas",
                unit: "ppm",
                valueMin: 400,
                valueMax: 5000,
                cluster: "msCO2",
                attribute: {ID: 0x0222, type: 0x21},
                description: "Setting Low CO2 Gas Border",
				access: "STATE_SET",
            }),
        ],
    };

module.exports = definition;