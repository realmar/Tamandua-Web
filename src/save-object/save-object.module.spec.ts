import { SaveObjectModule } from './save-object.module';

describe('SaveObjectModule', () => {
  let saveObjectModule: SaveObjectModule;

  beforeEach(() => {
    saveObjectModule = new SaveObjectModule();
  });

  it('should create an instance', () => {
    expect(saveObjectModule).toBeTruthy();
  });
});
