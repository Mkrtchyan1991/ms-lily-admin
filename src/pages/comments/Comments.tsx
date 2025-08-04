import React, { useEffect, useState } from 'react';
import { commentsApi } from '@/service/comments/comments.api';
import { Comment as ProductComment } from '@/service/service.types';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  App,
  Avatar,
  Button,
  Card,
  Empty,
  Input,
  Modal,
  Pagination,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

import styles from './comments.module.scss';

const { Title, Text, Paragraph } = Typography;
const { Search } = Input;
const { confirm } = Modal;

interface CommentsTableData extends ProductComment {
  key: string;
}

type StatusFilter = ProductComment['status'] | 'all';

// Helper functions outside component
const getStatusColor = (status: ProductComment['status']) => {
  const statusColors = {
    approved: 'success',
    pending: 'warning',
    rejected: 'error',
  };
  return statusColors[status] || 'default';
};

const getStatusText = (status: ProductComment['status']) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// User info component for better reusability
const UserInfo: React.FC<{ user: ProductComment['user'] }> = ({ user }) => (
  <div className={styles.userInfo}>
    <Avatar size="small" icon={<UserOutlined />}>
      {user.name.charAt(0).toUpperCase()}
    </Avatar>
    <div className={styles.details}>
      <Text className={styles.name}>
        {user.name} {user.last_name}
      </Text>
      <Text type="secondary" className={styles.email}>
        {user.email}
      </Text>
    </div>
  </div>
);

// Comment details modal component
const CommentDetailsModal: React.FC<{
  comment: ProductComment | null;
  open: boolean;
  onClose: () => void;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
}> = ({ comment, open, onClose, onApprove, onReject }) => {
  if (!comment) return null;

  const footer = [
    <Button key="close" onClick={onClose}>
      Close
    </Button>,
  ];

  if (comment.status === 'pending') {
    footer.push(
      <Button
        key="approve"
        type="primary"
        icon={<CheckOutlined />}
        onClick={() => {
          onApprove?.(comment.id);
          onClose();
        }}
      >
        Approve
      </Button>,
      <Button
        key="reject"
        danger
        icon={<CloseOutlined />}
        onClick={() => {
          onReject?.(comment.id);
          onClose();
        }}
      >
        Reject
      </Button>,
    );
  }

  return (
    <Modal title="Comment Details" open={open} onCancel={onClose} footer={footer} width={600}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <Text strong>User: </Text>
          <UserInfo user={comment.user} />
        </div>

        {comment.product && (
          <div>
            <Text strong>Product: </Text>
            <Text>{comment.product.name}</Text>
          </div>
        )}

        <div>
          <Text strong>Status: </Text>
          <Tag color={getStatusColor(comment.status)}>{getStatusText(comment.status)}</Tag>
        </div>

        <div>
          <Text strong>Posted: </Text>
          <Text>{dayjs(comment.created_at).format('YYYY-MM-DD HH:mm:ss')}</Text>
        </div>

        <div>
          <Text strong>Content:</Text>
          <Paragraph style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
            {comment.content}
          </Paragraph>
        </div>
      </Space>
    </Modal>
  );
};

export const CommentsPage: React.FC = () => {
  const { message } = App.useApp();
  const [comments, setComments] = useState<ProductComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalComments, setTotalComments] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedComment, setSelectedComment] = useState<ProductComment | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const fetchComments = async (page = 1, status: StatusFilter = 'all', search = '') => {
    try {
      setLoading(true);
      const params = {
        page,
        per_page: pageSize,
        ...(status !== 'all' && { status }),
        ...(search && { search }),
        sort_by: 'created_at' as const,
        sort_order: 'desc' as const,
      };

      const response = await commentsApi.admin.getAllComments(params);
      if (response.data) {
        setComments(response.data.data);
        setTotalComments(response.data.total);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      message.error('Failed to fetch comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments(currentPage, statusFilter, searchText);
  }, [currentPage, statusFilter, searchText, pageSize]);

  const handleApprove = async (id: number) => {
    try {
      await commentsApi.admin.approveComment(id);
      message.success('Comment approved successfully');
      fetchComments(currentPage, statusFilter, searchText);
    } catch (error) {
      console.error('Failed to approve comment:', error);
      message.error('Failed to approve comment');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await commentsApi.admin.rejectComment(id);
      message.success('Comment rejected successfully');
      fetchComments(currentPage, statusFilter, searchText);
    } catch (error) {
      console.error('Failed to reject comment:', error);
      message.error('Failed to reject comment');
    }
  };

  const handleDelete = async (id: number) => {
    confirm({
      title: 'Are you sure you want to delete this comment?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await commentsApi.admin.deleteComment(id);
          message.success('Comment deleted successfully');
          fetchComments(currentPage, statusFilter, searchText);
        } catch (error) {
          console.error('Failed to delete comment:', error);
          message.error('Failed to delete comment');
        }
      },
    });
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: StatusFilter) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const showCommentDetails = (comment: ProductComment) => {
    setSelectedComment(comment);
    setDetailsModalOpen(true);
  };

  const columns: ColumnsType<CommentsTableData> = [
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      render: (user: ProductComment['user']) => <UserInfo user={user} />,
      width: 200,
    },
    {
      title: 'Product',
      dataIndex: 'product',
      key: 'product',
      render: (product: ProductComment['product']) => <Text>{product?.name || 'N/A'}</Text>,
      width: 150,
    },
    {
      title: 'Content',
      dataIndex: 'content',
      key: 'content',
      render: (content: string) => (
        <Text ellipsis={{ tooltip: content }} style={{ maxWidth: 300 }}>
          {content}
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: ProductComment['status']) => <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>,
      width: 100,
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => (
        <Tooltip title={dayjs(date).format('YYYY-MM-DD HH:mm:ss')}>
          <Text>{dayjs(date).format('MM/DD HH:mm')}</Text>
        </Tooltip>
      ),
      width: 120,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record: CommentsTableData) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button type="text" icon={<EyeOutlined />} onClick={() => showCommentDetails(record)} />
          </Tooltip>
          {record.status === 'pending' && (
            <>
              <Tooltip title="Approve">
                <Button
                  type="text"
                  icon={<CheckOutlined />}
                  onClick={() => handleApprove(record.id)}
                  style={{ color: '#52c41a' }}
                />
              </Tooltip>
              <Tooltip title="Reject">
                <Button
                  type="text"
                  icon={<CloseOutlined />}
                  onClick={() => handleReject(record.id)}
                  style={{ color: '#ff4d4f' }}
                />
              </Tooltip>
            </>
          )}
          <Tooltip title="Delete">
            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
          </Tooltip>
        </Space>
      ),
      width: 150,
      fixed: 'right',
    },
  ];

  const tableData: CommentsTableData[] = comments.map((comment) => ({
    ...comment,
    key: comment.id.toString(),
  }));

  return (
    <div className={styles.container}>
      <Card>
        <div className={styles.header}>
          <Title level={2}>Comments Management</Title>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => fetchComments(currentPage, statusFilter, searchText)}
            loading={loading}
          >
            Refresh
          </Button>
        </div>

        <div className={styles.filters}>
          <Space size="large">
            <Search
              placeholder="Search comments..."
              allowClear
              onSearch={handleSearch}
              style={{ width: 300 }}
              prefix={<SearchOutlined />}
            />
            <Select
              placeholder="Filter by status"
              value={statusFilter}
              onChange={handleStatusFilterChange}
              style={{ width: 150 }}
            >
              <Select.Option value="all">All Status</Select.Option>
              <Select.Option value="pending">Pending</Select.Option>
              <Select.Option value="approved">Approved</Select.Option>
              <Select.Option value="rejected">Rejected</Select.Option>
            </Select>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={tableData}
          loading={loading}
          pagination={false}
          scroll={{ x: 1000 }}
          locale={{
            emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No comments found" />,
          }}
        />

        <div className={styles.pagination}>
          <Pagination
            current={currentPage}
            total={totalComments}
            pageSize={pageSize}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} comments`}
            onChange={(page, size) => {
              setCurrentPage(page);
              if (size !== pageSize) {
                setPageSize(size);
              }
            }}
          />
        </div>
      </Card>

      <CommentDetailsModal
        comment={selectedComment}
        open={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedComment(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};

export default CommentsPage;
