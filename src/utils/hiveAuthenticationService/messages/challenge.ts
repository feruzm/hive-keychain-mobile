import {encodeMemo} from 'components/bridge';
import Crypto from 'crypto-js';
import {ModalComponent} from 'utils/modal.enum';
import {goBack, navigate} from 'utils/navigation';
import HAS from '..';
import {HAS_Session} from '../has.types';
import {getChallengeData} from '../helpers/challenge';
import {getLeastDangerousKey} from '../helpers/keys';
import {validatePayloadAndGetData} from '../helpers/sign';
import {
  HAS_ChallengeDecryptedData,
  HAS_ChallengePayload,
} from '../payloads.types';

export const processChallengeRequest = (
  has: HAS,
  payload: HAS_ChallengePayload,
) => {
  const {session, data} = validatePayloadAndGetData<HAS_ChallengeDecryptedData>(
    has,
    payload,
  );

  payload.decrypted_data = data;
  navigate('ModalScreen', {
    name: ModalComponent.HAS_CHALLENGE,
    data: {
      ...payload,
      callback: answerChallengeReq,
      domain: session.token.app,
      session,
      has,

      onForceCloseModal: async () => {
        const challenge = Crypto.AES.encrypt(
          payload.uuid,
          session.auth_key,
        ).toString();
        has.send(
          JSON.stringify({
            cmd: 'challenge_nack',
            uuid: payload.uuid,
            data: challenge,
            pok: await encodeMemo(
              getLeastDangerousKey(session.account).value,
              has.getServerKey(),
              `#${payload.uuid}`,
            ),
          }),
        );
        goBack();
      },
    },
  });
};

const answerChallengeReq = async (
  has: HAS,
  payload: HAS_ChallengePayload,
  approve: boolean,
  session: HAS_Session,
  callback: (success: boolean) => void,
) => {
  if (approve) {
    const challengeData = await getChallengeData(
      session,
      payload.account,
      payload.decrypted_data,
      true,
    );
    has.send(
      JSON.stringify({
        cmd: 'challenge_ack',
        data: challengeData,
        uuid: payload.uuid,
        pok: await encodeMemo(
          getLeastDangerousKey(payload.account).value,
          has.getServerKey(),
          `#${payload.uuid}`,
        ),
      }),
    );
    callback(true);
  }
};
