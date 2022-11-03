
import { PumpTypes } from "../../index";
import { Inbound } from "../SLMessage";


export class EquipmentMessage{
  public static decodeEquipmentStateResponse(msg: Inbound){
    let data: SLEquipmentStateData;
    let ok = msg.readInt32LE();
    let freezeMode = msg.readUInt8();
    let remotes = msg.readUInt8();
    let poolDelay = msg.readUInt8();
    let spaDelay = msg.readUInt8();
    let cleanerDelay = msg.readUInt8();
    msg.incrementReadOffset(3);
    let airTemp = msg.readInt32LE();
    let bodiesCount = msg.readInt32LE();
    if (bodiesCount > 2) {
      bodiesCount = 2;
    }

    let currentTemp = new Array(bodiesCount);
    let heatStatus = new Array(bodiesCount);
    let setPoint = new Array(bodiesCount);
    let coolSetPoint = new Array(bodiesCount);
    let heatMode = new Array(bodiesCount);

    let bodies = [{ id: 1 } as any, bodiesCount > 1 ? { id: 2 } : undefined];

    for (let i = 0; i < bodiesCount; i++) {
      let bodyType = msg.readInt32LE();
      if (bodyType < 0 || bodyType >= 2) {
        bodyType = 0;
      }
      bodies[bodyType].currentTemp = currentTemp[bodyType] = msg.readInt32LE();
      bodies[bodyType].heatStatus = heatStatus[bodyType] = msg.readInt32LE();
      bodies[bodyType].setPoint = setPoint[bodyType] = msg.readInt32LE();
      bodies[bodyType].coolSetPoint = coolSetPoint[bodyType] = msg.readInt32LE();
      bodies[bodyType].heatMode = heatMode[bodyType] = msg.readInt32LE();
    }

    let circuitCount = msg.readInt32LE();
    let circuitArray = new Array(circuitCount);
    for (let i = 0; i < circuitCount; i++) {
      circuitArray[i] = {
        id: msg.readInt32LE() - 499,
        state: msg.readInt32LE(),
        colorSet: msg.readUInt8(),
        colorPos: msg.readUInt8(),
        colorStagger: msg.readUInt8(),
        delay: msg.readUInt8(),
      };
    }

    let pH = msg.readInt32LE() / 100;
    let orp = msg.readInt32LE();
    let saturation = msg.readInt32LE() / 100;
    let saltPPM = msg.readInt32LE() * 50;
    let pHTank = msg.readInt32LE();
    let orpTank = msg.readInt32LE();
    let alarms = msg.readInt32LE();

    data = {
      ok,
      freezeMode,
      remotes,
      poolDelay,
      spaDelay,
      cleanerDelay,
      airTemp,
      bodiesCount,
      bodies,
      currentTemp,
      heatStatus,
      setPoint,
      coolSetPoint,
      heatMode,
      circuitArray,
      pH,
      orp,
      saturation,
      saltPPM,
      pHTank,
      orpTank,
      alarms,
    };
    return data;
  }
  public static decodeControllerConfig(msg: Inbound){
    let controllerId = msg.readInt32LE();

    let minSetPoint = new Array(2);
    let maxSetPoint = new Array(2);
    for (let i = 0; i < 2; i++) {
      minSetPoint[i] = msg.readUInt8();
      maxSetPoint[i] = msg.readUInt8();
    }

    let degC = msg.readUInt8() !== 0;
    let controllerType = msg.readUInt8();
    let hwType = msg.readUInt8();
    let controllerData = msg.readUInt8();
    let equipFlags = msg.readInt32LE();
    let genCircuitName = msg.readSLString();

    let circuitCount = msg.readInt32LE();
    let bodyArray = new Array(circuitCount);
    for (let i = 0; i < circuitCount; i++) {
      bodyArray[i] = {
        circuitId: msg.readInt32LE() - 499,
        name: msg.readSLString(),
        nameIndex: msg.readUInt8(),
        function: msg.readUInt8(),
        interface: msg.readUInt8(),
        flags: msg.readUInt8(),
        colorSet: msg.readUInt8(),
        colorPos: msg.readUInt8(),
        colorStagger: msg.readUInt8(),
        deviceId: msg.readUInt8(),
        dfaultRt: msg.readUInt16LE(),
      };
      msg.incrementReadOffset(2);
    }

    let colorCount = msg.readInt32LE();
    let colorArray = new Array(colorCount);
    for (let i = 0; i < colorCount; i++) {
      colorArray[i] = {
        name: msg.readSLString(),
        color: {
          r: msg.readInt32LE() & 0xff,
          g: msg.readInt32LE() & 0xff,
          b: msg.readInt32LE() & 0xff,
        },
      };
    }

    let pumpCircCount = 8;
    let pumpCircArray = new Array(pumpCircCount);
    for (let i = 0; i < pumpCircCount; i++) {
      pumpCircArray[i] = msg.readUInt8();
    }

    let interfaceTabFlags = msg.readInt32LE();
    let showAlarms = msg.readInt32LE();

    let data: SLControllerConfigData = {
      controllerId,
      minSetPoint,
      maxSetPoint,
      degC,
      controllerType,
      hwType,
      controllerData,
      equipFlags,
      genCircuitName,
      circuitCount,
      bodyArray,
      colorCount,
      colorArray,
      pumpCircCount,
      pumpCircArray,
      interfaceTabFlags,
      showAlarms
    }
    return data;
  }
  public static decodeSystemTime(msg: Inbound){
    let date = msg.readSLDateTime();
    let year = date.getFullYear();
    let month = date.getMonth() + 1; // + 1 is for backward compatibility, SLTime represents months as 1-based
    let dayOfWeek = date.getDay(); // should probably be tweaked to adjust what days are 0-6 as SLTime and Javascript start on different days of the week
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();
    let millisecond = date.getMilliseconds();
    var adjustForDST = msg.readInt32LE() === 1;
    let data: SLSystemTimeData = {
      date,
      year,
      month,
      dayOfWeek,
      day,
      hour,
      minute,
      second,
      millisecond,
      adjustForDST
    }
    return data;
  }
  public static decodeCancelDelay(msg: Inbound){
    // ack
    return true;
  }
  public static decodeSetSystemTime(msg: Inbound){
    // ack
    return true;
  }
  public static decodeEquipmentConfiguration(msg: Inbound){
    let getNumPumps = function() {
      if (flowDataArray === null) {
        return 0;
      }
  
      let numPumps = 0;
      for (var i = 0; i < flowDataArray.length; i += 45) {
        if (flowDataArray[i + 2] !== 0) {
          numPumps++;
        }
      }
  
      return numPumps;
    }
    let getPumpType= function(pumpIndex) {
      if (typeof (pumpIndex) !== 'number') {
        return 0;
      }
  
      if (flowDataArray === null || flowDataArray.length < (pumpIndex + 1) * 45) {
        return 0;
      }
  
      let pumpType = flowDataArray[(45 * pumpIndex) + 2];
      if (pumpType <= 3) {
        return pumpType as PumpTypes;
      }
  
      return 0;
    }
    let isValvePresent = function(valveIndex, loadCenterValveData) {
      if (valveIndex < 2) {
        return true;
      } else {
        return msg.isBitSet(loadCenterValveData, valveIndex);
      }
    }
    let controllerType = msg.readUInt8();
    let hardwareType = msg.readUInt8();
    msg.readUInt8();
    msg.readUInt8();
    let controllerData = msg.readInt32LE();
    let versionDataArray = msg.readSLArray();
    let version = 0;
    let speedDataArray = msg.readSLArray();
    let valveDataArray = msg.readSLArray(); // decodeValveData()
    let remoteDataArray = msg.readSLArray();
    let heaterConfigDataArray = msg.readSLArray(); // decodeSensorData()
    let delayDataArray = msg.readSLArray(); // decodeDelayData()
    let macroDataArray = msg.readSLArray();
    let miscDataArray = msg.readSLArray(); // decodeMiscData()
    let lightDataArray = msg.readSLArray();
    let flowDataArray = msg.readSLArray();
    let sgDataArray = msg.readSLArray();
    let spaFlowDataArray = msg.readSLArray();
    
    let expansionsCount = (controllerData & 0x11000000) >> 6;
    if (versionDataArray === null || versionDataArray.length < 2) {
       version = 0;
    }
    else version = (versionDataArray[0] * 1000) + (versionDataArray[1]);
    let numPumps = getNumPumps();

    let pumps = [];
    for (let i = 0; i < numPumps; i++){
      let pump:any = {id: i + 1};
      pump.type = getPumpType(i);
    }

    // let sensors = msg.decodeHeaterConfigData(heaterConfigDataArray);

    ///// Heater config
    let heaterConfig = {
      poolSolarPresent: msg.isBitSet(heaterConfigDataArray[0], 1),
      spaSolarPresent: msg.isBitSet(heaterConfigDataArray[0], 4),
      thermaFloCoolPresent: msg.isBitSet(heaterConfigDataArray[1], 1),
      solarHeatPumpPresent: msg.isBitSet(heaterConfigDataArray[2], 4),
      thermaFloPresent: msg.isBitSet(heaterConfigDataArray[2], 5)
     };
    ///// End heater config
    ///// Valve decode
    var isSolarValve0 = false;
    var isSolarValve1 = false;

    // if (!heaterConfig) {
    //   msg.decodeHeaterConfigData();
    // }

    if (heaterConfig.poolSolarPresent && !heaterConfig.solarHeatPumpPresent) {
      isSolarValve0 = true;
    }

    if (controllerType === 5) {
      // dual body
      if (heaterConfig.spaSolarPresent && !heaterConfig.thermaFloPresent) {
        isSolarValve1 = true;
      }
    }

    var valves:Valves[] = [];

    for (var loadCenterIndex = 0; loadCenterIndex <= expansionsCount; loadCenterIndex++) {
      var loadCenterValveData = valveDataArray[loadCenterIndex];

      for (var valveIndex = 0; valveIndex < 5; valveIndex++) {
        let loadCenterIndex: number;
        let valveIndex: number;
        let valveName: string;
        let loadCenterName: string;
        let deviceId: number;   

        var isSolarValve = false;
        if (loadCenterIndex === 0) {
          if (valveIndex === 0 && isSolarValve0) {
            isSolarValve = true;
          }
          if (valveIndex === 1 && isSolarValve1) {
            isSolarValve = true;
          }
        }
        if (isValvePresent(valveIndex, loadCenterValveData)) {
          var valveDataIndex = (loadCenterIndex * 5) + 4 + valveIndex;
          deviceId = valveDataArray[valveDataIndex];
          if (deviceId === 0) {
            // console.log('unused valve, loadCenterIndex = ' + loadCenterIndex + ' valveIndex = ' + valveIndex);
          } else if (isSolarValve === true){
            // console.log('used by solar');
          } else {
            loadCenterIndex = loadCenterIndex;
            valveIndex = valveIndex;
            valveName = String.fromCharCode(65 + valveIndex);
            loadCenterName = (loadCenterIndex + 1).toString();
            deviceId = deviceId;
            let v: Valves = {
              loadCenterIndex,
              valveIndex,
              valveName,
              loadCenterName,
              deviceId
            }
            valves.push(v);
          }
        }
      }

    }
    // msg.valves = valveArray;

    ///// End Valve decode

    ///// Delays
    let delays = {
      poolPumpOnDuringHeaterCooldown: msg.isBitSet(delayDataArray[0], 0),
      spaPumpOnDuringHeaterCooldown: msg.isBitSet(delayDataArray[0], 1),
      pumpOffDuringValveAction: msg.isBitSet(delayDataArray[0], 7)
    } as Delays;
    ///// End Delays
    let misc = {
      intelliChem: msg.isBitSet(miscDataArray[3], 0),
      spaManualHeat: miscDataArray[4] !== 0
    } as Misc;
    let data:SLEquipmentConfigurationData = {
      controllerType,
      hardwareType,
      expansionsCount,
      version,

      heaterConfig,
      valves,
      delays,
      misc
    };
    return data;
  }
  public static decodeWeatherMessage(msg: Inbound){
    let version = msg.readInt32LE();
    let zip = msg.readSLString();
    let lastUpdate = msg.readSLDateTime();
    let lastRequest = msg.readSLDateTime();
    let dateText = msg.readSLString();
    let text = msg.readSLString();
    let currentTemperature = msg.readInt32LE();
    let humidity = msg.readInt32LE();
    let wind = msg.readSLString();
    let pressure = msg.readInt32LE();
    let dewPoint = msg.readInt32LE();
    let windChill = msg.readInt32LE();
    let visibility = msg.readInt32LE();
    let numDays = msg.readInt32LE();
    let dayData:SLWeatherForecastDayData[] = new Array(numDays);
    for (let i = 0; i < numDays; i++) {
      dayData[i] = {
        dayTime: msg.readSLDateTime(),
        highTemp: msg.readInt32LE(),
        lowTemp: msg.readInt32LE(),
        text: msg.readSLString(),
      };
    }
    
    let sunrise = msg.readInt32LE();
    let sunset = msg.readInt32LE();
    let data: SLWeatherForecastData = {
      version,
      zip,
      lastUpdate,
      lastRequest,
      dateText,
      text,
      currentTemperature,
      humidity,
      wind,
      pressure,
      dewPoint,
      windChill,
      visibility,
      dayData,
      sunrise,
      sunset
    };
    return data;
  }
  public static decodeGetHistory(msg: Inbound){
    let readTimeTempPointsPairs = function() {
      let retval:TimeTempPointPairs[] = [];
      // 4 bytes for the length
      if (msg.length >= msg.readOffset + 4) {
        let points = msg.readInt32LE();
        // 16 bytes per time, 4 bytes per temperature
        if (msg.length >= msg.readOffset + (points * (16 + 4))) {
          for (let i = 0; i < points; i++) {
            let time = msg.readSLDateTime();
            let temp = msg.readInt32LE();
            retval.push({
              time: time,
              temp: temp,
            });
          }
        }
      }
  
      return retval;
    }
    let readTimeTimePointsPairs = function () {
      let retval:TimeTimePointPairs[] = [];
      // 4 bytes for the length
      if (msg.length >= msg.readOffset + 4) {
        let points = msg.readInt32LE();
        // 16 bytes per on time, 16 bytes per off time
        if (msg.length >= msg.readOffset + (points * (16 + 16))) {
          for (let i = 0; i < points; i++) {
            let onTime = msg.readSLDateTime();
            let offTime = msg.readSLDateTime();
            retval.push({
              on: onTime,
              off: offTime,
            });
          }
        }
      }
  
      return retval;
    }
    let airTemps = readTimeTempPointsPairs();
    let poolTemps = readTimeTempPointsPairs();
    let poolSetPointTemps = readTimeTempPointsPairs();
    let spaTemps = readTimeTempPointsPairs();
    let spaSetPointTemps = readTimeTempPointsPairs();
    let poolRuns = readTimeTimePointsPairs();
    let spaRuns = readTimeTimePointsPairs();
    let solarRuns = readTimeTimePointsPairs();
    let heaterRuns = readTimeTimePointsPairs();
    let lightRuns = readTimeTimePointsPairs();
    let data: SLHistoryData = {
      airTemps,
      poolTemps,
      poolSetPointTemps,
      spaTemps,
      spaSetPointTemps,
      poolRuns,
      spaRuns,
      solarRuns,
      heaterRuns,
      lightRuns
    };
    return data;

  }

}

export interface SLEquipmentStateData {
  ok: number;
  freezeMode: number;
  remotes: number;
  poolDelay: number;
  spaDelay: number;
  cleanerDelay: number;
  airTemp: number;
  bodiesCount: number;
  bodies: {}[],
  currentTemp: any[];
  heatStatus: any[];
  setPoint: any[];
  coolSetPoint: any[];
  heatMode: any[];
  circuitArray: any[];
  pH: number;
  orp: number;
  saturation: number;
  saltPPM: number;
  pHTank: number;
  orpTank: number;
  alarms: number;
}
export interface SLControllerConfigData {
  controllerId: number;
  minSetPoint: number[];
  maxSetPoint: number[];
  degC: boolean;
  controllerType;
  circuitCount: number,
  hwType;
  controllerData;
  equipFlags;
  genCircuitName;
  interfaceTabFlags: number;
  bodyArray: any[];
  colorCount: number;
  colorArray: any[];
  pumpCircCount: number;
  pumpCircArray: any[];
  showAlarms: number;
}

export interface SLSystemTimeData {
  date: Date;
  year: any;
  month: any;
  dayOfWeek: any;
  day: any;
  hour: any;
  minute: any;
  second: any;
  millisecond: any;
  adjustForDST: boolean;
}

export interface SLEquipmentConfigurationData {
controllerType: number;
hardwareType: number;
expansionsCount: number;
version: number;
heaterConfig: HeaterConfig;
valves: any[];
delays: Delays;
misc: Misc;
}

export interface HeaterConfig {
poolSolarPresent: boolean,
spaSolarPresent: boolean,
thermaFloCoolPresent: boolean,
solarHeatPumpPresent: boolean,
thermaFloPresent: boolean,
}

export interface Delays {
poolPumpOnDuringHeaterCooldown: boolean,
spaPumpOnDuringHeaterCooldown: boolean,
pumpOffDuringValveAction
}

export interface Misc {
intelliChem: boolean,
spaManualHeat: boolean
}

export interface Valves {
loadCenterIndex: number,
valveIndex: number,
valveName: string,
loadCenterName: string,
deviceId: any
}

export interface SLWeatherForecastData {
  version: number;
  zip: string;
  lastUpdate: Date;
  lastRequest: Date;
  dateText: string;
  text: string;
  currentTemperature: number;
  humidity: number;
  wind: string;
  pressure: number;
  dewPoint: number;
  windChill: number;
  visibility: number;
  dayData: SLWeatherForecastDayData[];
  sunrise: number;
  sunset: number;
}
export interface SLWeatherForecastDayData {
    dayTime: Date;
    highTemp: number;
    lowTemp: number;
    text: string;
}

export interface TimeTimePointPairs {
  on: Date;
  off: Date;
}
export interface TimeTempPointPairs {
  time: Date;
  temp: number;
}

export interface SLHistoryData {
  airTemps: TimeTempPointPairs[];
  poolTemps: TimeTempPointPairs[];
  poolSetPointTemps: TimeTempPointPairs[];
  spaTemps: TimeTempPointPairs[];
  spaSetPointTemps: TimeTempPointPairs[];
  poolRuns: TimeTimePointPairs[];
  spaRuns: TimeTimePointPairs[];
  solarRuns: TimeTimePointPairs[];
  heaterRuns: TimeTimePointPairs[];
  lightRuns: TimeTimePointPairs[];
}