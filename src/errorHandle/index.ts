import { OrErrorEvent } from "..";
import { ExceptionCode, HttpStatusCode } from "./types";
import { randomUUID } from "node:crypto";

export class OrError {
    private message: string;
    private level: "info" | "error" | "warning" | "debug" | "success" | "critical" | "alert" | "emergency";
    private idLog?: string;
    private status?: HttpStatusCode;
    private exceptionCode?: ExceptionCode;
    private specificException?: string;
    private entity?: string;
    private action?: string;
    private data?: any;
    private created_by?: string;
    private stack?: string;
    private system?: string;
    private timestamp?: Date;

    constructor(data: TOrError) {
        if (!data.message) throw new Error("Message is required");
        this.message = data.message;
        this.level = data.level ?? "error";
        this.idLog = data.idLog ?? randomUUID();
        this.status = data.status ?? 500;
        this.exceptionCode = data.exceptionCode;
        this.specificException = data.specificException;
        this.entity = data.entity;
        this.action = data.action;
        this.data = data.data;
        this.created_by = data.created_by;
        this.stack = new Error().stack;
        this.system = data.system ?? process.env.SYSTEM_NAME;
        this.timestamp = data.timestamp ?? new Date();
    }

    throw(outputMessage?: TypeErrorMessageOutput): never {
        try {
            this.emit({ errorOnly: true });
            this.newThrow(outputMessage);
        } catch (error: any) {
            throw error;
        }
    }

    throwWithoutEmit(outputMessage?: TypeErrorMessageOutput): never {
        this.newThrow(outputMessage);
    }

    private newThrow(outputMessage?: TypeErrorMessageOutput): never {
        const atts: TypeErrorMessageOutput = this.getOutputDefault(outputMessage);
        const data: TOrError = this.getError(atts);
        const dataToString: string = this.ErrorMessage(data);
        throw new Error(dataToString);
    }

    private getOutputDefault(outputMessage?: TypeErrorMessageOutput): TypeErrorMessageOutput {
        let outputDefault: TypeErrorMessageOutput = { idLog: true, message: true, data: true, level: true, status: true, timestamp: true };
        if (outputMessage) outputDefault = outputMessage;
        return outputDefault;
    }

    emit(emit?: TypeErrorEmit): OrError {
        const data = this.getAll();

        if (!emit || emit.errorOnly) {
            OrErrorEvent.emit("error", data);
            return this;
        }
        if (emit.error) OrErrorEvent.emit("error", data); // Tornar possível emitir o evento "error" mesmo sem chamar a função throw
        if (emit.level && this.level) OrErrorEvent.emit(this.level, data);
        if (emit.status && this.status) OrErrorEvent.emit(this.status!.toString(), data);
        if (emit.exceptionCode && this.exceptionCode) OrErrorEvent.emit(this.exceptionCode, data);
        if (emit.specificException && this.specificException) OrErrorEvent.emit(this.specificException, data);
        if (emit.entity && this.entity) OrErrorEvent.emit(this.entity, data);
        if (emit.action && this.action) OrErrorEvent.emit(this.action, data);
        if (emit.system && this.system) OrErrorEvent.emit(this.system, data);
        if (emit.created_by && this.created_by) OrErrorEvent.emit(this.created_by, data);
        return this;
    }

    getAll(): TOrError {
        const data = {
            message: this.message,
            level: this.level,
            idLog: this.idLog,
            status: this.status,
            exceptionCode: this.exceptionCode,
            specificException: this.specificException,
            entity: this.entity,
            action: this.action,
            data: this.data,
            created_by: this.created_by,
            stack: this.stack,
            system: this.system,
            timestamp: this.timestamp
        };
        return data;
    }

    getError(atts?: TypeErrorMessageOutput): TOrError {
        let errorEvent: TOrError = {};
        if (atts?.message) errorEvent.message = this.message;
        if (atts?.level) errorEvent.level = this.level;
        if (atts?.idLog) errorEvent.idLog = this.idLog;
        if (atts?.status) errorEvent.status = this.status;
        if (atts?.exceptionCode) errorEvent.exceptionCode = this.exceptionCode;
        if (atts?.specificException) errorEvent.specificException = this.specificException;
        if (atts?.entity) errorEvent.entity = this.entity;
        if (atts?.action) errorEvent.action = this.action;
        if (atts?.data) errorEvent.data = this.data;
        if (atts?.created_by) errorEvent.created_by = this.created_by;
        if (atts?.stack) errorEvent.stack = this.stack;
        if (atts?.system) errorEvent.system = this.system;
        if (atts?.timestamp) errorEvent.timestamp = this.timestamp;
        if (Object.keys(errorEvent).length === 0) errorEvent = { message: this.message };

        return errorEvent;
    }

    getMessage(): string {
        const message = `[${this.level}] ${this.message}`;
        return message;
    }

    private ErrorMessage(data: TOrError): string {
        return JSON.stringify(data);
    }
}

export type TOrError = {
    message?: string;
    level?: "info" | "error" | "warning" | "debug" | "success" | "critical" | "alert" | "emergency";
    idLog?: string;
    status?: HttpStatusCode;
    exceptionCode?: ExceptionCode;
    specificException?: string;
    entity?: string;
    action?: string;
    data?: any;
    timestamp?: Date;
    created_by?: string;
    system?: string;
    stack?: string;
};

export type TypeErrorEmit = TypeErrorMessageOutput & { error?: boolean; errorOnly?: boolean };

export type TypeErrorMessageOutput = {
    idLog?: boolean;
    message?: boolean;
    level?: boolean;
    status?: boolean;
    exceptionCode?: boolean;
    specificException?: boolean;
    entity?: boolean;
    action?: boolean;
    data?: boolean;
    timestamp?: boolean;
    created_by?: boolean;
    system?: boolean;
    stack?: boolean;
};
