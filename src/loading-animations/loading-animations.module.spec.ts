import { LoadingAnimationsModule } from './loading-animations.module';

describe('LoadingAnimationsModule', () => {
  let loadingAnimationsModule: LoadingAnimationsModule;

  beforeEach(() => {
    loadingAnimationsModule = new LoadingAnimationsModule();
  });

  it('should create an instance', () => {
    expect(loadingAnimationsModule).toBeTruthy();
  });
});
