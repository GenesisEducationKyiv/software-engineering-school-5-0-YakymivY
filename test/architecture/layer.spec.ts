import 'tsarch/dist/jest';
import { filesOfProject } from 'tsarch';

describe('Layered Architecture: Weather Module', () => {
  const files = filesOfProject().inFolder('src/weather');

  it('domain should not depend on application, infrastructure or presentation', () => {
    const rule = files
      .inFolder('domain')
      .shouldNot()
      .dependOnFiles()
      .inFolder('application')
      .inFolder('infrastructure')
      .inFolder('presentation');

    expect(rule).toPassAsync();
  });

  it('application should not depend on infrastructure or presentation', () => {
    const rule = files
      .inFolder('application')
      .shouldNot()
      .dependOnFiles()
      .inFolder('infrastructure')
      .inFolder('presentation');

    expect(rule).toPassAsync();
  });

  it('infrastructure should not depend on presentation', () => {
    const rule = files
      .inFolder('infrastructure')
      .shouldNot()
      .dependOnFiles()
      .inFolder('presentation');

    expect(rule).toPassAsync();
  });

  it('each layer should be free of dependency cycles', () => {
    const rule = files.should().beFreeOfCycles();
    expect(rule).toPassAsync();
  });
});
