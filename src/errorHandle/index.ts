import { error } from "console";
import { OrErrorEvent } from "..";

export class OrError {
    private message: string;
    private level: "info" | "error" | "warning" | "debug" | "success" | "critical" | "alert" | "emergency";
    private status?: number;
    private code?: string;
    private entity?: string;
    private action?: string;
    private data?: any;
    private created_by?: string;
    private stack?: string;
    private system?: string;
    private timestamp?: Date;

    constructor(data: TOrError) {
        this.message = data.message;
        this.level = data.level ?? "error";
        this.status = data.status ?? 500;
        this.code = data.code;
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

    private newThrow(outputMessage?: TypeErrorMessageOutput): never {
        let atts = { ...outputMessage, level: true, status: true, code: true, timestamp: true };
        const data: TOrError = this.getError(atts);
        const dataToString: string = this.ErrorMessage(data);
        throw new Error(dataToString);
    }

    emit(emit: TypeErrorEmit): void {
        const data = this.getAll();
        if (emit.errorOnly) {
            OrErrorEvent.emit("error", data);
            return;
        }
        if (emit.error) OrErrorEvent.emit("error", data); // Tornar possível emitir o evento "error" mesmo sem chamar a função throw
        if (this.level) OrErrorEvent.emit(this.level!, data);
        if (this.status) OrErrorEvent.emit(this.status.toString(), data);
        if (this.code) OrErrorEvent.emit(this.code!, data);
        if (this.entity) OrErrorEvent.emit(this.entity, data);
        if (this.action) OrErrorEvent.emit(this.action, data);
        if (this.system) OrErrorEvent.emit(this.system, data);
        if (this.created_by) OrErrorEvent.emit(this.created_by, data);
    }

    getAll(): TOrError {
        const data = {
            message: this.message,
            level: this.level,
            status: this.status,
            code: this.code,
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
        let errorEvent: TOrError = {
            message: this.message
        };
        if (atts?.level) errorEvent.level = this.level;
        if (atts?.status) errorEvent.status = this.status;
        if (atts?.code) errorEvent.code = this.code;
        if (atts?.entity) errorEvent.entity = this.entity;
        if (atts?.action) errorEvent.action = this.action;
        if (atts?.data) errorEvent.data = this.data;
        if (atts?.created_by) errorEvent.created_by = this.created_by;
        if (atts?.stack) errorEvent.stack = this.stack;
        if (atts?.system) errorEvent.system = this.system;
        if (atts?.timestamp) errorEvent.timestamp = this.timestamp;

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
    message: string;
    level?: "info" | "error" | "warning" | "debug" | "success" | "critical" | "alert" | "emergency";
    status?: number;
    code?: string;
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
    level?: boolean;
    status?: boolean;
    code?: boolean;
    entity?: boolean;
    action?: boolean;
    data?: boolean;
    timestamp?: boolean;
    created_by?: boolean;
    system?: boolean;
    stack?: boolean;
};
