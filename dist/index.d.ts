/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import 'source-map-support/register';
import * as net from 'net';
import { EventEmitter } from 'events';
import * as SLGateway from './messages/SLGatewayDataMessage';
import { BodyCommands, ChemCommands, ChlorCommands, CircuitCommands, ConnectionCommands, EquipmentCommands, PumpCommands, ScheduleCommands } from './messages/OutgoingMessages';
import { SLControllerConfigData, SLEquipmentStateData, SLSystemTimeData } from './messages/state/EquipmentStateMessage';
import { SLIntellichlorData } from './messages/state/ChlorMessage';
import { SLChemData } from './messages/state/ChemMessage';
import { SLScheduleData } from './messages/state/ScheduleMessage';
import { Inbound } from './messages/SLMessage';
export declare class FindUnits extends EventEmitter {
    constructor();
    private finder;
    private bound;
    private message;
    search(): void;
    foundServer(msg: any, remote: any): void;
    sendServerBroadcast(): void;
    close(): void;
}
export declare class RemoteLogin extends EventEmitter {
    constructor(systemName: any);
    systemName: string;
    private _client;
    private _gateway;
    connect(): Promise<SLGateway.SLGateWayData>;
    private close;
}
export declare class UnitConnection extends EventEmitter {
    constructor();
    private serverPort;
    private serverAddress;
    private password;
    protected client: net.Socket;
    private _clientId;
    get clientId(): number;
    set clientId(val: number);
    private _controllerId;
    get controllerId(): number;
    set controllerId(val: number);
    private _buffer;
    private _bufferIdx;
    private _senderId;
    get senderId(): number;
    set senderId(val: number);
    controller: Controller;
    netTimeout: number;
    private _keepAliveDuration;
    private _keepAliveTimer;
    private _expectedMsgLen;
    circuits: Circuit;
    equipment: Equipment;
    bodies: Body;
    chem: Chem;
    chlor: Chlor;
    schedule: Schedule;
    pump: Pump;
    init(address: string, port: number, password: string, senderId?: number): void;
    write(val: Buffer | string): void;
    keepAliveAsync(): void;
    processData(msg: Buffer): void;
    close(): Promise<void>;
    connect(): Promise<unknown>;
    login(challengeString: string): void;
    getVersion(): Promise<string>;
    addClient(clientId?: number): Promise<boolean>;
    removeClient(): Promise<unknown>;
    pingServer(): Promise<boolean>;
    onClientMessage(msg: Inbound): void;
}
export declare let screenlogic: UnitConnection;
export declare class Equipment {
    setSystemTime(date: Date, shouldAdjustForDST: boolean): Promise<unknown>;
    getWeatherForecast(): Promise<unknown>;
    getHistoryData(fromTime?: Date, toTime?: Date): Promise<unknown>;
    getEquipmentConfiguration(): Promise<unknown>;
    cancelDelay(): Promise<boolean>;
    getSystemTime(): Promise<SLSystemTimeData>;
    getControllerConfig(): Promise<SLControllerConfigData>;
    getEquipmentState(): Promise<SLEquipmentStateData>;
}
export declare class Circuit extends UnitConnection {
    sendLightCommand(command: LightCommands): Promise<unknown>;
    setCircuitRuntimebyId(circuitId: any, runTime: any): Promise<unknown>;
    setCircuitState(circuitId: number, circuitState: boolean): Promise<unknown>;
}
export declare class Body extends UnitConnection {
    setSetPoint(bodyIndex: BodyIndex, temperature: any): Promise<unknown>;
    setHeatMode(bodyIndex: BodyIndex, heatMode: HeatModes): Promise<unknown>;
}
export declare class Pump extends UnitConnection {
    setPumpSpeed(pumpId: number, circuitId: number, speed: number, isRPMs?: boolean): Promise<unknown>;
    getPumpStatus(pumpId: any): Promise<unknown>;
}
export declare class Schedule extends UnitConnection {
    setScheduleEventById(scheduleId: number, circuitId: number, startTime: number, stopTime: number, dayMask: number, flags: number, heatCmd: number, heatSetPoint: number): Promise<unknown>;
    addNewScheduleEvent(scheduleType: SchedTypes): Promise<unknown>;
    deleteScheduleEventById(scheduleId: number): Promise<unknown>;
    getScheduleData(scheduleType: SchedTypes): Promise<SLScheduleData[]>;
}
export declare class Chem extends UnitConnection {
    getChemHistoryData(fromTime?: Date, toTime?: Date): Promise<unknown>;
    getChemicalData(): Promise<SLChemData>;
}
export declare class Chlor extends UnitConnection {
    setIntellichlorOutput(poolOutput: number, spaOutput: number): Promise<unknown>;
    getIntellichlorConfig(): Promise<SLIntellichlorData>;
}
export declare enum LightCommands {
    LIGHT_CMD_LIGHTS_OFF = 0,
    LIGHT_CMD_LIGHTS_ON = 1,
    LIGHT_CMD_COLOR_SET = 2,
    LIGHT_CMD_COLOR_SYNC = 3,
    LIGHT_CMD_COLOR_SWIM = 4,
    LIGHT_CMD_COLOR_MODE_PARTY = 5,
    LIGHT_CMD_COLOR_MODE_ROMANCE = 6,
    LIGHT_CMD_COLOR_MODE_CARIBBEAN = 7,
    LIGHT_CMD_COLOR_MODE_AMERICAN = 8,
    LIGHT_CMD_COLOR_MODE_SUNSET = 9,
    LIGHT_CMD_COLOR_MODE_ROYAL = 10,
    LIGHT_CMD_COLOR_SET_SAVE = 11,
    LIGHT_CMD_COLOR_SET_RECALL = 12,
    LIGHT_CMD_COLOR_BLUE = 13,
    LIGHT_CMD_COLOR_GREEN = 14,
    LIGHT_CMD_COLOR_RED = 15,
    LIGHT_CMD_COLOR_WHITE = 16,
    LIGHT_CMD_COLOR_PURPLE = 17
}
export declare enum HeatModes {
    HEAT_MODE_OFF = 0,
    HEAT_MODE_SOLAR = 1,
    HEAT_MODE_SOLARPREFERRED = 2,
    HEAT_MODE_HEATPUMP = 3,
    HEAT_MODE_HEATER = 3,
    HEAT_MODE_DONTCHANGE = 4
}
export declare enum PumpTypes {
    PUMP_TYPE_INTELLIFLOVF = 1,
    PUMP_TYPE_INTELLIFLOVS = 2,
    PUMP_TYPE_INTELLIFLOVSF = 3
}
export declare enum BodyIndex {
    POOL = 0,
    SPA = 1
}
export interface Controller {
    circuits: CircuitCommands;
    connection: ConnectionCommands;
    equipment: EquipmentCommands;
    chlor: ChlorCommands;
    chem: ChemCommands;
    schedules: ScheduleCommands;
    pumps: PumpCommands;
    bodies: BodyCommands;
}
export declare enum SchedTypes {
    RECURRING = 0,
    RUNONCE = 1
}
