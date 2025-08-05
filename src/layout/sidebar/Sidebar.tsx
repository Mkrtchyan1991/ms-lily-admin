import { useState } from 'react';
import { NavLink, useLocation } from 'react-router';
import {
  CommentOutlined,
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
  { label: <NavLink to="/orders">Orders</NavLink>, key: '/orders', icon: <ShoppingCartOutlined /> },
  { label: <NavLink to="/products">Products</NavLink>, key: '/products', icon: <ShopOutlined /> },
  {
    label: 'Catalog',
    key: 'catalog',
    icon: <PieChartOutlined />,
    children: [
      { label: <NavLink to="/categories">Categories</NavLink>, key: '/categories' },
      { label: <NavLink to="/brands">Brands</NavLink>, key: '/brands' },
      { label: <NavLink to="/tags">Tags</NavLink>, key: '/tags' },
      { label: <NavLink to="/colors">Colors</NavLink>, key: '/colors' },
      { label: <NavLink to="/sizes">Sizes</NavLink>, key: '/sizes' },
    ],
  },
  { label: <NavLink to="/users">Users</NavLink>, key: '/users', icon: <UserOutlined /> },
  { label: <NavLink to="/comments">Comments</NavLink>, key: '/comments', icon: <CommentOutlined /> },
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
