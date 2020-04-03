import {EventParameters} from './event-parameters.interface';
import {OperationType} from './operation-type';

export interface Event {
  BlockHash: string;
  From: string;
  To: string;
  Amount: string;
  BlockNumber: number;
  TransactionHash: string;
  TransactionIndex: number;
  LogIndex: number;
  Address: string;
  EventName: OperationType;
  EventSignature: string;
  Parameters: EventParameters[];
  Timestamp: Date;
}
