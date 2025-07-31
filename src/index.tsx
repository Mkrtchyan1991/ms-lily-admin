/* eslint-disable simple-import-sort/imports */
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router';
import { Spin } from 'antd';
import { PersistGate } from 'redux-persist/integration/react';

import './configs/axios.config';

import App from './App/App.tsx';
import { ThemeProvider } from './providers/theme/theme.provider.tsx';
import { persistor, store } from './store/store.ts';

import 'modern-normalize/modern-normalize.css';
import './styles/index.scss';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <BrowserRouter>
      <Provider store={store}>
        <PersistGate
          loading={
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
              <Spin size="large" />
            </div>
          }
          persistor={persistor}
        >
          <App />
        </PersistGate>
      </Provider>
    </BrowserRouter>
  </ThemeProvider>,
);
