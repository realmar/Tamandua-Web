import { QuestionModalModule } from './question-modal.module';

describe('QuestionModalModule', () => {
  let questionModalModule: QuestionModalModule;

  beforeEach(() => {
    questionModalModule = new QuestionModalModule();
  });

  it('should create an instance', () => {
    expect(questionModalModule).toBeTruthy();
  });
});
