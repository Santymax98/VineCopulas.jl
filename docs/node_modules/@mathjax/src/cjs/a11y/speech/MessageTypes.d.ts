export type Message = {
    [key: string]: any;
};
export type WorkerCommand = {
    cmd: string;
    debug: boolean;
    data: Message;
};
export type ClientCommand = {
    cmd: string;
    data: WorkerCommand | Message;
};
export type Structure = {
    [id: string]: any;
};
