import React, { useEffect, useState } from 'react';
import { commentsApi } from '@/service/comments/comments.api';
import { Comment } from '@/service/service.types';
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

interface CommentsTableData extends Comment {
  key: string;
}

type StatusFilter = Comment['status'] | 'all';

// Helper functions outside component
const getStatusColor = (status: Comment['status']) => {
  const statusColors = {
    approved: 'success',
    pending: 'warning',
    rejected: 'error',
  };
  return statusColors[status] || 'default';
};

const getStatusText = (status: Comment['status']) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

// User info component for better reusability
const UserInfo: React.FC<{ user: Comment['user'] }> = ({ user }) => (
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
  comment: Comment | null;
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
      <div className={styles.commentDetails}>
        <div className={styles.userSection}>
          <Avatar size={48} icon={<UserOutlined />}>
            {comment.user.name.charAt(0).toUpperCase()}
          </Avatar>
          <div className={styles.userInfo}>
            <Title level={5}>
              {comment.user.name} {comment.user.last_name}
            </Title>
            <Text type="secondary">{comment.user.email}</Text>
            <br />
            <Text type="secondary">ID: #{comment.user.id}</Text>
          </div>
        </div>

        <div className={styles.commentSection}>
          <Title level={5}>Comment Content</Title>
          <Paragraph className={styles.content}>{comment.content}</Paragraph>
        </div>

        <div className={styles.metaSection}>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div>
              <Text strong>Product ID: </Text>
              <Text>#{comment.product_id}</Text>
            </div>
            <div>
              <Text strong>Status: </Text>
              <Tag color={getStatusColor(comment.status)}>{getStatusText(comment.status)}</Tag>
            </div>
            <div>
              <Text strong>Created: </Text>
              <Text>{dayjs(comment.created_at).format('YYYY-MM-DD HH:mm:ss')}</Text>
            </div>
            {comment.updated_at && (
              <div>
                <Text strong>Updated: </Text>
                <Text>{dayjs(comment.updated_at).format('YYYY-MM-DD HH:mm:ss')}</Text>
              </div>
            )}
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export const Comments: React.FC = () => {
  const { message } = App.useApp();

  // State management
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');

  // Fetch comments function
  const fetchComments = async (
    page: number = currentPage,
    perPage: number = pageSize,
    status: StatusFilter = statusFilter,
    search: string = searchText,
  ) => {
    try {
      setLoading(true);

      const response = await commentsApi.admin.getAllComments({
        page,
        per_page: perPage,
        status: status === 'all' ? undefined : status,
        search,
        sort_by: 'created_at',
        sort_order: 'desc',
      });

      if (response.data) {
        setComments(response.data.data);
        setTotal(response.data.total);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      message.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  // Load comments on mount and when filters change
  useEffect(() => {
    fetchComments(currentPage, pageSize, statusFilter, searchText);
  }, [currentPage, pageSize, statusFilter]);

  // Action handlers
  const handleApprove = async (commentId: number) => {
    try {
      // Optimistic update
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId ? { ...comment, status: 'approved' as Comment['status'] } : comment,
        ),
      );

      await commentsApi.admin.approveComment(commentId);
      message.success('Comment approved successfully');

      // Remove from view if filtering by pending
      if (statusFilter === 'pending') {
        setComments((prev) => prev.filter((comment) => comment.id !== commentId));
        setTotal((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to approve comment:', error);
      message.error('Failed to approve comment');
      // Refresh on error
      fetchComments();
    }
  };

  const handleReject = async (commentId: number) => {
    try {
      // Optimistic update
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId ? { ...comment, status: 'rejected' as Comment['status'] } : comment,
        ),
      );

      await commentsApi.admin.rejectComment(commentId);
      message.success('Comment rejected successfully');

      // Remove from view if filtering by pending
      if (statusFilter === 'pending') {
        setComments((prev) => prev.filter((comment) => comment.id !== commentId));
        setTotal((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to reject comment:', error);
      message.error('Failed to reject comment');
      // Refresh on error
      fetchComments();
    }
  };

  const handleDelete = (commentId: number) => {
    confirm({
      title: 'Delete Comment',
      icon: <ExclamationCircleOutlined />,
      content: 'Are you sure you want to delete this comment? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await commentsApi.admin.deleteComment(commentId);
          message.success('Comment deleted successfully');

          // Remove from current view
          setComments((prev) => prev.filter((comment) => comment.id !== commentId));
          setTotal((prev) => Math.max(0, prev - 1));
        } catch (error) {
          console.error('Failed to delete comment:', error);
          message.error('Failed to delete comment');
        }
      },
    });
  };

  const handleView = (comment: Comment) => {
    setSelectedComment(comment);
    setDetailsModalOpen(true);
  };

  const handleRefresh = () => {
    fetchComments();
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
    fetchComments(1, pageSize, statusFilter, value);
  };

  const handleStatusFilterChange = (value: StatusFilter) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handlePaginationChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
    }
  };

  // Table columns configuration
  const columns: ColumnsType<CommentsTableData> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'User',
      key: 'user',
      width: 200,
      render: (_, record) => <UserInfo user={record.user} />,
    },
    {
      title: 'Comment',
      dataIndex: 'content',
      key: 'content',
      ellipsis: {
        showTitle: false,
      },
      render: (content: string) => (
        <Tooltip title={content}>
          <Text ellipsis style={{ maxWidth: 300 }}>
            {content}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: 'Product ID',
      dataIndex: 'product_id',
      key: 'product_id',
      width: 100,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: Comment['status']) => <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>,
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date: string) => (
        <Tooltip title={dayjs(date).format('YYYY-MM-DD HH:mm:ss')}>{dayjs(date).format('MMM DD, YYYY')}</Tooltip>
      ),
      sorter: (a, b) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)} />
          </Tooltip>
          {record.status === 'pending' && (
            <>
              <Tooltip title="Approve">
                <Button
                  type="text"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={() => handleApprove(record.id)}
                  style={{ color: '#52c41a' }}
                />
              </Tooltip>
              <Tooltip title="Reject">
                <Button
                  type="text"
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={() => handleReject(record.id)}
                  style={{ color: '#ff4d4f' }}
                />
              </Tooltip>
            </>
          )}
          <Tooltip title="Delete">
            <Button type="text" size="small" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} danger />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Transform comments to table data
  const tableData: CommentsTableData[] = comments.map((comment) => ({
    ...comment,
    key: comment.id.toString(),
  }));

  return (
    <div className={styles.container}>
      <Card>
        <div className={styles.header}>
          <Title level={3}>Comments Management</Title>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
              Refresh
            </Button>
          </Space>
        </div>

        <div className={styles.filters}>
          <Space size="middle" wrap>
            <Search
              placeholder="Search comments, users, or IDs..."
              allowClear
              style={{ width: 300 }}
              onSearch={handleSearch}
              prefix={<SearchOutlined />}
            />
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              style={{ width: 150 }}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
              ]}
            />
          </Space>
        </div>

        <div className={styles.tableContainer}>
          {loading ? (
            <div className={styles.loading}>
              <Spin size="large" />
            </div>
          ) : comments.length === 0 ? (
            <Empty description="No comments found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
          ) : (
            <>
              <Table
                columns={columns}
                dataSource={tableData}
                pagination={false}
                size="middle"
                className={styles.table}
              />
              <div className={styles.pagination}>
                <Pagination
                  current={currentPage}
                  total={total}
                  pageSize={pageSize}
                  showSizeChanger
                  showQuickJumper
                  showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} comments`}
                  onChange={handlePaginationChange}
                  onShowSizeChange={handlePaginationChange}
                />
              </div>
            </>
          )}
        </div>
      </Card>

      <CommentDetailsModal
        comment={selectedComment}
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};
