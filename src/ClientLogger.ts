import { ClientDBLogger, ClientLoggerConfig, LogData, LogType } from "./type";
import axios from 'axios'

export class DBClientLogger implements ClientDBLogger {
    private config: ClientLoggerConfig
    private LogData: LogData[] = []
    constructor(config: ClientLoggerConfig) {
        this.config = config
    }
    private shouldPrint(logType: LogType) {
        if (this.config.print === true) return true;
        else if (this.config.print === false) return false;
        else if (this.config.print !== undefined && this.config.print.includes(logType)) return true;
        else return false;
    }
    private shouldSendLogs(logType: LogType) {
        if (this.config?.sendLogsType === undefined) return true
        if (this.config?.sendLogsType?.includes(logType)) return true;
        else return false;
    }
    private sendThreshHold() {
        return this.LogData.length >= (this.config?.sendThreshHold ?? 0);
    }
    private clearLogs() {
        this.LogData = [];
    }
    private getGeneralTags() {
        return [
            `application: ${this.config.appName}`,
            `environment: ${this.config.environment}`,
            `appVersion: ${this.config?.appVersion ?? 'N/A'}`,
            `os: ${this.config?.osVersion ?? 'N/A'} `,
            `deviceType: ${this.config?.deviceType ?? 'N/A'} `,
            `user: ${this.config?.user ?? 'N/A'} `,
            ... (this.config?.defaultTags ?? []),
        ];

    }
    private async handleLogs(logType: LogType, log: LogData) {
        const temp = { ...log, sessionID: this.config.sessionID, tags: [...this.getGeneralTags(), ...(log.tags ?? []), `type: ${LogType[logType]}`] };
        const shouldSend = this.shouldSendLogs(logType);
        const includeLog = this.config.sendLogsType?.includes(logType) ?? true;
        const logThreshHold = this.sendThreshHold();

        if (includeLog) this.LogData.push(temp);
        if (shouldSend && logThreshHold) {
            try {
                await this.batchSendLogs()
            } catch (error) {
                console.error(error);
            }
        }
    }
    async log(title: string, message?: string | undefined, tags?: string[] | undefined) {
        if (this.shouldPrint(LogType.general)) console.log(title, message ?? "")
        await this.handleLogs(LogType.general, { title, message, tags: [...(tags ?? []), "type: general"] })
    }
    async general(title: string, message?: string | undefined, tags?: string[] | undefined) {
        await this.handleLogs(LogType.general, { title, message, tags: [...(tags ?? []), "type: general"] })
        if (this.shouldPrint(LogType.general)) console.log(title, message ?? "")
    }
    async warn(title: string, message?: string | undefined, tags?: string[] | undefined) {
        await this.handleLogs(LogType.warn, { title, message, tags: [...(tags ?? []), "type: general"] })
        if (this.shouldPrint(LogType.warn)) console.log(title, message ?? "")
    }
    async verbose(title: string, message?: string | undefined, tags?: string[] | undefined) {
        await this.handleLogs(LogType.verbose, { title, message, tags: [...(tags ?? []), "type: general"] })
        if (this.shouldPrint(LogType.verbose)) console.log(title, message ?? "")
    }
    async error(title: string, message?: string | undefined, tags?: string[] | undefined) {
        await this.handleLogs(LogType.error, { title, message, tags: [...(tags ?? []), "type: general"] })
        if (this.shouldPrint(LogType.error)) console.log(title, message ?? "")
    }

    async sendSingleLog(logType: LogType, title: string, message?: string | undefined, tags?: string[] | undefined) {
        try {
            const endPoint = this.config.loggingEndPoint + '/singleLog';
            const data = { sessionID: this.config.sessionID, title, message, tags: [...this.getGeneralTags(), ... (tags ?? []), `type: ${LogType[logType]}`] }
            return await axios.post(endPoint, data).then(this.clearLogs).then(() => true);
        } catch (error) {
            //@ts-ignore
            console.error(error)
            return false;
        }
    }
    async batchSendLogs() {
        try {
            const logs = [...this.LogData];
            console.log(logs.map(e => e.sessionID))
            this.clearLogs();
            await axios.post(this.config.loggingEndPoint + "/batchLogs", logs)
            return true;
        } catch (error) {
            //@ts-ignore
            console.error(error)
            return false;
        }
    }
}