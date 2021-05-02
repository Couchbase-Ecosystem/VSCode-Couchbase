export interface IConnection{
    readonly url: string;
    readonly username: string;
    readonly password?: string;
    readonly connectionIdentifier: string;
}