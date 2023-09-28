import { ClientLoggerConfig, DBClientLogger, LogType } from '../src'


(async () => {

    const config: ClientLoggerConfig = {
        sessionID: `${Math.round(Math.random() * 10000)}`,
        appName: 'testing',
        environment: 'dev',
        loggingEndPoint: 'http://localhost:3051/logger',
        sendThreshHold: 5
    }
    const logger = new DBClientLogger(config)
    // const result = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(async (e) => await logger.sendSingleLog(LogType.error, 'testingTitle', undefined, ["testing tag"]))
    // await Promise.all(result)
    await logger.general('testingTitle', '1', ["testing tag"])
        .then(async () => await logger.general('testingTitle', '2', ["testing tag"]))
        .then(async () => await logger.general('testingTitle', '3', ["testing tag"]))
        .then(async () => await logger.general('testingTitle', '4', ["testing tag"]))
        .then(async () => await logger.general('testingTitle', '5', ["testing tag"]))
        .then(async () => await logger.general('testingTitle', '6', ["testing tag"]))
        .then(async () => await logger.general('testingTitle', '7', ["testing tag"]))

})();