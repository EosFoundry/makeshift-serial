/// <reference types="node" />
import { EventEmitter } from 'node:events';
import { LogLevel, Msger } from '@eos-makeshift/msg';
import { Message } from './messages.js';
export declare class Plugin extends EventEmitter implements Msger {
    private _id;
    get id(): string;
    private _name;
    get name(): string;
    private _manifest;
    get manifest(): any;
    private _functions;
    get functions(): string[];
    private sock;
    private _logLevel;
    get logLevel(): LogLevel;
    set logLevel(l: LogLevel);
    private _msgenerator;
    private log;
    handleMessage(this: Plugin, m: Message): void;
    callFunction(name: string, message?: any): void;
    send(label: string, data: any): void;
    runFunction(name: string, args?: any[]): void;
    constructor(path: string, manifest: any);
}
