import { Typography } from 'antd';

import styles from './dashboard.module.scss';

export const DashboardPage = () => {
  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <div>
          <Typography.Title>Welcome,</Typography.Title>
          <Typography.Text>wish you a productive day...</Typography.Text>
        </div>
      </div>
    </div>
  );
};
