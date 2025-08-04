import React, { useEffect, useState } from 'react';
import { User } from '@/service/service.types';
import { usersApi } from '@/service/users/users.api';
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  HomeOutlined,
  MailOutlined,
  PhoneOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { App, Avatar, Button, Empty, Input, Modal, Pagination, Select, Spin, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import styles from './users.module.scss';

import { UserCreateModal } from './components/UserCreateModal';
import { UserEditModal } from './components/UserEditModal';

const { Title } = Typography;
const { Option } = Select;
const { confirm } = Modal;

interface UsersTableData extends User {
  key: string;
}

export const Users: React.FC = () => {
  const { message } = App.useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<'admin' | 'user' | undefined>();

  const fetchUsers = async (page = 1, perPage = 10, role?: 'admin' | 'user') => {
    setLoading(true);
    try {
      const response = await usersApi.admin.getAllUsers({ page, per_page: perPage, role });

      setUsers(response.data.data);
      setTotal(response.data.total);
      setCurrentPage(response.data.current_page);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage, pageSize, roleFilter);
  }, [currentPage, pageSize, roleFilter]);

  const handleCreateUser = () => {
    setCreateModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    confirm({
      title: 'Delete User',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to delete ${user.name} ${user.last_name}?`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await usersApi.admin.deleteUser(user.id);
          message.success('User deleted successfully');
          fetchUsers(currentPage, pageSize, roleFilter);
        } catch (error) {
          console.error('Failed to delete user:', error);
          message.error('Failed to delete user');
        }
      },
    });
  };

  const handleRoleChange = async (user: User, newRole: User['role']) => {
    try {
      await usersApi.admin.updateUser(user.id, { ...user, role: newRole });
      message.success('User role updated successfully');
      fetchUsers(currentPage, pageSize, roleFilter);
    } catch (error) {
      console.error('Failed to update user role:', error);
      message.error('Failed to update user role');
    }
  };

  const handleRefresh = () => {
    fetchUsers(currentPage, pageSize, roleFilter);
  };

  const handlePageChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size) setPageSize(size);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    // Filter users locally based on search text
    // In a real app, you'd typically send this to the API
  };

  const getFilteredUsers = (): UsersTableData[] => {
    let filtered = users;

    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.last_name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.mobile_number.includes(searchText),
      );
    }

    return filtered.map((user) => ({
      ...user,
      key: user.id.toString(),
    }));
  };

  const columns: ColumnsType<UsersTableData> = [
    {
      title: 'User',
      dataIndex: 'name',
      key: 'user',
      render: (_, record) => (
        <div className={styles.userInfo}>
          <Avatar className={styles.avatar} size={40} icon={<UserOutlined />}>
            {record?.name?.charAt(0).toUpperCase()}
            {record?.last_name?.charAt(0).toUpperCase()}
          </Avatar>
          <div className={styles.details}>
            <div className={styles.name}>
              {record.name} {record.last_name}
            </div>
            <div className={styles.email}>
              <MailOutlined /> {record.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Contact',
      dataIndex: 'mobile_number',
      key: 'contact',
      render: (_, record) => (
        <div>
          <div>
            <PhoneOutlined /> {record.mobile_number}
          </div>
          {record.country && (
            <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>
              <HomeOutlined /> {record.country}
              {record.city && `, ${record.city}`}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: 'admin' | 'user', record) => (
        <Select
          value={role}
          style={{ width: 100 }}
          size="small"
          onChange={(newRole) => handleRoleChange(record, newRole)}
        >
          <Option value="user">User</Option>
          <Option value="admin">Admin</Option>
        </Select>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'email_verified_at',
      key: 'status',
      render: (verifiedAt) => (
        <Tag className={`${styles.statusTag} ${verifiedAt ? styles.verified : styles.unverified}`}>
          {verifiedAt ? 'Verified' : 'Unverified'}
        </Tag>
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => dayjs(date).format('MMM DD, YYYY'),
      sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className={styles.actionButtons}>
          <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => handleEditUser(record)}>
            Edit
          </Button>
          <Button type="primary" danger size="small" icon={<DeleteOutlined />} onClick={() => handleDeleteUser(record)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const filteredUsers = getFilteredUsers();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Title level={2} className={styles.title}>
          Users Management
        </Title>
        <div className={styles.actions}>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
            Refresh
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateUser}>
            Add User
          </Button>
        </div>
      </div>

      <div className={styles.filters}>
        <Input
          className={styles.searchInput}
          placeholder="Search users by name, email, or phone..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => handleSearch(e.target.value)}
          allowClear
        />

        <Select
          className={styles.filterItem}
          placeholder="Filter by role"
          value={roleFilter}
          onChange={setRoleFilter}
          allowClear
        >
          <Option value="admin">Admin</Option>
          <Option value="user">User</Option>
        </Select>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loading}>
            <Spin size="large" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className={styles.empty}>
            <UserOutlined className={styles.emptyIcon} />
            <div className={styles.emptyTitle}>No users found</div>
            <div className={styles.emptyDescription}>
              {searchText || roleFilter
                ? 'No users match your current filters.'
                : 'Get started by adding your first user.'}
            </div>
            {!searchText && !roleFilter && (
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateUser}>
                Add User
              </Button>
            )}
          </div>
        ) : (
          <>
            <Table
              className={styles.userTable}
              columns={columns}
              dataSource={filteredUsers}
              pagination={false}
              scroll={{ x: 800 }}
            />

            <div style={{ padding: '16px', textAlign: 'center', borderTop: '1px solid #f0f0f0' }}>
              <Pagination
                current={currentPage}
                total={total}
                pageSize={pageSize}
                showSizeChanger
                showQuickJumper
                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} users`}
                onChange={handlePageChange}
                onShowSizeChange={(current, size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              />
            </div>
          </>
        )}
      </div>

      <UserCreateModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          fetchUsers(currentPage, pageSize, roleFilter);
          setCreateModalOpen(false);
        }}
      />

      <UserEditModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={() => {
          fetchUsers(currentPage, pageSize, roleFilter);
          setEditModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />
    </div>
  );
};
