import { SecretStorage, Event, EventEmitter, SecretStorageChangeEvent, ExtensionContext } from "vscode";

export class SecretService implements SecretStorage {
    private static instance: SecretService;
    private context: ExtensionContext ;
    private _onDidChange: EventEmitter<SecretStorageChangeEvent>;

    private constructor(context: ExtensionContext) {
        this.context = context;
        this._onDidChange = new EventEmitter<SecretStorageChangeEvent>();
    }

    static getInstance(context?: ExtensionContext): SecretService {
        if (!SecretService.instance) {
            if(context === undefined) {
                throw new Error("ExtensionContext is undefined");
            }
            SecretService.instance = new SecretService(context);
        }
        return SecretService.instance;
    }

    get(key: string): Thenable<string | undefined> {
        return this.context.secrets.get(key);
    }
    
    store(key: string, value: string): Thenable<void> {
        return this.context.secrets.store(key, value);
    }
    
    delete(key: string): Thenable<void> {
        return this.context.secrets.delete(key);
    }
    
    get onDidChange(): Event<SecretStorageChangeEvent> {
        return this._onDidChange.event;
    }
}