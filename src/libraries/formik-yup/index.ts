import * as fs from 'fs-extra';
import * as path from 'path';
import { BaseLibrary } from '../baseLibrary';

export class FormikYupLibrary extends BaseLibrary {
  name = 'Formik + Yup';
  packages = 'formik yup';
  devPackages = '@types/yup';

  async setup(projectPath: string): Promise<void> {
    await fs.ensureDir(path.join(projectPath, 'src/components/forms'));
    await fs.copy(
      path.join(__dirname, 'templates'),
      path.join(projectPath, 'src/components/forms')
    );
  }
}
