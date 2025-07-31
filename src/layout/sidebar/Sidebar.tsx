import { useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import {
  DoubleLeftOutlined,
  DoubleRightOutlined,
  PieChartOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu, MenuProps } from 'antd';

import styles from './sidebar.module.scss';

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
  { label: <NavLink to="/">Dashboard</NavLink>, key: '/', icon: <PieChartOutlined /> },
  { label: <NavLink to="/users">Users</NavLink>, key: '/users', icon: <UserOutlined /> },
  { label: <NavLink to="/orders">Orders</NavLink>, key: '/orders', icon: <ShoppingCartOutlined /> },
  { label: <NavLink to="/products">Products</NavLink>, key: '/products', icon: <ShopOutlined /> },
  // getItem('Team', 'sub2', <TeamOutlined />, [getItem('Team 1', '6'), getItem('Team 2', '8')]),
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} trigger={null}>
      <div className={styles.content}>
        <Menu className={styles.menu} mode="inline" items={items} selectedKeys={[location.pathname]} />
        <div className={styles.bottom}>
          <Button type="text" className={styles['toggle-icon']} onClick={() => setCollapsed((prev) => !prev)}>
            {collapsed ? <DoubleRightOutlined /> : <DoubleLeftOutlined />}
          </Button>
        </div>
      </div>
    </Sider>
  );
};
