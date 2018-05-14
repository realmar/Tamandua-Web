import { QuestionModalAction } from './question-modal-action';
import { isNullOrUndefined } from '../utils/misc';

function undefinedCallbackToEmpty (callback: () => void): () => void {
  if (isNullOrUndefined(callback)) {
    callback = () => {
    };
  }

  return callback;
}

export function createYesAction (callback?: () => void): QuestionModalAction {
  return {
    label: 'Yes',
    callback: undefinedCallbackToEmpty(callback)
  };
}

export function createNoAction (callback?: () => void): QuestionModalAction {
  return {
    label: 'No',
    callback: undefinedCallbackToEmpty(callback)
  };
}
