import { QuestionModalAction } from './question-modal-action';

export interface QuestionModalData {
  readonly actions: Array<QuestionModalAction>;
  readonly title: string;
  readonly text: string;
}
