export interface IConnection{
    readonly url: string;
    readonly port: string;
    readonly username: string;
    readonly password?: string;
}