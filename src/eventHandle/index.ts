import EventEmitter from "node:events";

export class OrErrorEvent extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(10);
    }

    public close(): void {
        this.removeAllListeners();
    }

    emit(event: string | symbol, ...args: any[]): boolean {
        return super.emit(event, ...args);
    }
}

export default new OrErrorEvent();
