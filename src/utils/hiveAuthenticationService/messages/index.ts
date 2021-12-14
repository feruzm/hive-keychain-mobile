import {addServerKey} from 'actions/hiveAuthenticationService';
import {store} from 'store';
import HAS from '..';
import {HAS_Payload, HAS_PayloadType} from '../payloads.types';
import {processAuthenticationRequest} from './authenticate';
import {processChallengeRequest} from './challenge';
import {processSigningRequest} from './sign';

export const onMessageReceived = async (
  event: WebSocketMessageEvent,
  has: HAS,
) => {
  console.log(`[RECV] ${event.data}`);
  try {
    const payload: HAS_Payload =
      typeof event.data == 'string' ? JSON.parse(event.data) : event.data;
    if (!payload.cmd || typeof payload.cmd !== 'string') {
      throw new Error(`invalid payload (cmd)`);
    }
    switch (payload.cmd) {
      // Process HAS <-> PKSA protocol
      case HAS_PayloadType.CONNECTED:
        // connection confirmation from the HAS
        //console.log('HAS confirm connection', payload);
        return;
      case HAS_PayloadType.ERROR:
        // error from the HAS
        console.log('HAS error', payload);
        return;
      case HAS_PayloadType.REGISTER:
        // registration confirmation from the HAS
        console.log('HAS register_ack', payload);
        return;
      case HAS_PayloadType.KEY_ACK:
        // server public key received
        store.dispatch(addServerKey(has.host, payload.key));
        console.log('HAS key ack ', payload.key);
        if (has.awaiting_registration.length) {
          has.registerAccounts(has.awaiting_registration);
        }
        break;
      case HAS_PayloadType.AUTH:
        processAuthenticationRequest(has, payload);
        break;

      case HAS_PayloadType.SIGN:
        processSigningRequest(has, payload);
        break;
      case HAS_PayloadType.CHALLENGE:
        processChallengeRequest(has, payload);
        break;
      default:
        throw new Error('Invalid payload (unknown cmd)');
    }
  } catch (e) {
    console.log(e);
    //TODO: Think about how to handle this
    //has.send(JSON.stringify({cmd: 'error', error: (e as any).message}));
  }
  console.debug('message processed');
};
