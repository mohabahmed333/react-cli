import { LibraryRegistry } from './types';
import { ReduxToolkitLibrary } from './redux-toolkit';
import { ReactRouterLibrary } from './react-router';
import { AxiosLibrary } from './axios';
import { TanStackQueryLibrary } from './tanstack-query';
import { StyledComponentsLibrary } from './styled-components';
import { MaterialUILibrary } from './material-ui';
import { ZustandLibrary } from './zustand';
import { FormikYupLibrary } from './formik-yup';
import { ReactIconsLibrary } from './react-icons';
import { TailwindCSSLibrary } from './tailwind';

const libraries: LibraryRegistry = {
  'Redux Toolkit': new ReduxToolkitLibrary(),
  'React Router': new ReactRouterLibrary(),
  'Axios': new AxiosLibrary(),
  'TanStack Query': new TanStackQueryLibrary(),
  'Styled Components': new StyledComponentsLibrary(),
  'Material UI': new MaterialUILibrary(),
  'Zustand': new ZustandLibrary(),
  'Formik + Yup': new FormikYupLibrary(),
  'React Icons': new ReactIconsLibrary(),
  'Tailwind CSS': new TailwindCSSLibrary()
};

export default libraries;
