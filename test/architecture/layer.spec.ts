import 'tsarch/dist/jest';
import { filesOfProject } from 'tsarch';

interface ModuleConfig {
  name: string;
  path: string;
}

const testModuleArchitecture = ({ name, path }: ModuleConfig) => {
  describe(`Layered Architecture: ${name} Module`, () => {
    const files = filesOfProject().inFolder(path);

    it('domain layer should only depend on itself', () => {
      const rule = files
        .inFolder('domain')
        .shouldNot()
        .dependOnFiles()
        .inFolder('application')
        .inFolder('infrastructure')
        .inFolder('presentation');

      expect(rule).toPassAsync();
    });

    it('application layer should only depend on domain', () => {
      const rule = files
        .inFolder('application')
        .shouldNot()
        .dependOnFiles()
        .inFolder('infrastructure')
        .inFolder('presentation');

      expect(rule).toPassAsync();
    });

    it('infrastructure layer should not depend on presentation', () => {
      const rule = files
        .inFolder('infrastructure')
        .shouldNot()
        .dependOnFiles()
        .inFolder('presentation');

      expect(rule).toPassAsync();
    });

    it('should be free of dependency cycles', () => {
      const rule = files.should().beFreeOfCycles();
      expect(rule).toPassAsync();
    });
  });
};

// Test each module
describe('Architecture Tests', () => {
  testModuleArchitecture({
    name: 'Weather',
    path: 'apps/weather-app/src',
  });

  testModuleArchitecture({
    name: 'Mail',
    path: 'apps/mail/src',
  });
});
