// src/events/ConnectionEvents.ts
import { EventEmitter } from 'vscode';
import { IConnection } from '../../types/IConnection';

// Define the types of events and their payloads
interface ConnectionEventMap {
  CONNECTION_REMOVED: (connection?: IConnection) => void;
  CONNECTION_CHANGED: (connection: IConnection) => void;
}

class ConnectionEvents {
  private eventEmitters: { [K in keyof ConnectionEventMap]: EventEmitter<Parameters<ConnectionEventMap[K]>[0]> } = {
    CONNECTION_REMOVED: new EventEmitter<IConnection | undefined>(),
    CONNECTION_CHANGED: new EventEmitter<IConnection>(),
  };

  public onConnectionRemoved(listener: ConnectionEventMap['CONNECTION_REMOVED']) {
    this.eventEmitters.CONNECTION_REMOVED.event(listener);
  }

  public emitConnectionRemoved(connection?: IConnection) {
    this.eventEmitters.CONNECTION_REMOVED.fire(connection);
  }

  public onConnectionChanged(listener: ConnectionEventMap['CONNECTION_CHANGED']) {
    this.eventEmitters.CONNECTION_CHANGED.event(listener);
  }

  public emitConnectionChanged(connection: IConnection) {
    this.eventEmitters.CONNECTION_CHANGED.fire(connection);
  }
}

// Export a singleton instance
export default new ConnectionEvents();