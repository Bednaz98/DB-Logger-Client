

export enum LogType {
    general,
    warn,
    error,
    verbose,
}


export interface ClientLoggerConfig {
    sessionID: string
    appName: string
    environment: string
    osVersion?: string
    deviceType?: string
    user?: string
    appVersion?: string
    defaultTags?: string
    loggingEndPoint: string
    sendThreshHold?: number
    sendLogsType?: LogType[]
    print?: boolean | LogType[]
}

export interface LogData {
    title: string
    tags?: string[]
    message?: string
    sessionID?: string
}


export interface ClientDBLogger {
    log: (title: string, message?: string, tags?: string[]) => Promise<void>
    general: (title: string, message?: string, tags?: string[]) => Promise<void>
    warn: (title: string, message?: string, tags?: string[]) => Promise<void>
    verbose: (title: string, message?: string, tags?: string[]) => Promise<void>
    error: (title: string, message?: string, tags?: string[]) => Promise<void>
    batchSendLogs: () => Promise<boolean>
}