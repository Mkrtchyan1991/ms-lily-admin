import React, { useEffect, useState } from 'react';
import { commentsApi } from '@/service/comments/comments.api';
import { ProductComment } from '@/service/service.types';
import { ExclamationCircleOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Empty, Input, Row, Select, Statistic, Table, Typography } from 'antd';

import styles from './comments.module.scss';

import { createCommentsColumns } from './comments.utils';
import { CommentDetails } from './components/comment-details/CommentDetails';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

interface CommentsTableData extends ProductComment {
  key: string;
}

type StatusFilter = ProductComment['status'] | 'all';

export const CommentsPage = () => {
  const { message, modal } = App.useApp();
  const [comments, setComments] = useState<ProductComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedComment, setSelectedComment] = useState<ProductComment | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  // Fetch comments from API
  const fetchComments = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        per_page: pagination.pageSize,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchText && { search: searchText }),
        sort_by: 'created_at' as const,
        sort_order: 'desc' as const,
      };

      const response = await commentsApi.admin.getAllComments(params);

      if (response.data) {
        setComments(response.data.data);
        setPagination({
          current: response.data.current_page,
          pageSize: response.data.per_page,
          total: response.data.total,
        });
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      message.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [pagination.current, pagination.pageSize, statusFilter, searchText]);

  // Filter comments based on search text and status
  const filteredComments = comments.filter((comment) => {
    const matchesSearch =
      searchText === '' ||
      comment.id.toString().includes(searchText) ||
      comment.content?.toLowerCase().includes(searchText?.toLowerCase()) ||
      comment.user.name?.toLowerCase().includes(searchText?.toLowerCase()) ||
      comment.user.email?.toLowerCase().includes(searchText?.toLowerCase()) ||
      (comment.product?.name && comment.product.name?.toLowerCase().includes(searchText?.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || comment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleView = (comment: ProductComment) => {
    setSelectedComment(comment);
    setIsDetailsModalOpen(true);
  };

  const handleRefresh = () => {
    fetchComments();
  };

  // New status change handler similar to orders
  const handleStatusChange = async (id: number, status: ProductComment['status']) => {
    try {
      await commentsApi.admin.updateCommentStatus(id, status);
      setComments((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
      if (selectedComment && selectedComment.id === id) {
        setSelectedComment({ ...selectedComment, status });
      }
      message.success('Comment status updated');
    } catch (error) {
      console.error('Failed to update comment status:', error);
      message.error('Failed to update comment status');
    }
  };

  // Keep existing handlers for backward compatibility
  const handleApprove = async (id: number) => {
    await handleStatusChange(id, 'approved');
  };

  const handleReject = async (id: number) => {
    await handleStatusChange(id, 'rejected');
  };

  const handleDelete = async (id: number) => {
    modal.confirm({
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
          fetchComments();
        } catch (error) {
          console.error('Failed to delete comment:', error);
          message.error('Failed to delete comment');
        }
      },
    });
  };

  // Calculate statistics
  const stats = {
    total: comments.length,
    pending: comments.filter((c) => c.status === 'pending').length,
    approved: comments.filter((c) => c.status === 'approved').length,
    rejected: comments.filter((c) => c.status === 'rejected').length,
  };

  // Create columns with handler functions
  const commentsColumns = createCommentsColumns({
    handleView,
    handleStatusChange,
    handleDelete,
  });

  const tableData: CommentsTableData[] = filteredComments.map((comment) => ({
    ...comment,
    key: comment.id.toString(),
  }));

  return (
    <div className={styles.container}>
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic title="Total Comments" value={stats.total} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Pending" value={stats.pending} valueStyle={{ color: '#fa8c16' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Approved" value={stats.approved} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="Rejected" value={stats.rejected} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: '24px' }}>
          <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
            <Col>
              <Title level={3} style={{ margin: 0 }}>
                Comments Management
              </Title>
            </Col>
            <Col>
              <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
                Refresh
              </Button>
            </Col>
          </Row>

          {/* Filters */}
          <Row gutter={16} style={{ marginBottom: '16px' }}>
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="Search by comment ID, content, user name, email, or product..."
                allowClear
                enterButton={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Select
                placeholder="Filter by status"
                allowClear
                style={{ width: '100%' }}
                value={statusFilter}
                onChange={setStatusFilter}
              >
                <Option value="all">All Status</Option>
                <Option value="pending">Pending</Option>
                <Option value="approved">Approved</Option>
                <Option value="rejected">Rejected</Option>
              </Select>
            </Col>
          </Row>
        </div>

        {/* Comments Table */}
        <Table
          columns={commentsColumns}
          dataSource={tableData}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} comments`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize: pageSize || 10 });
            },
          }}
          scroll={{ x: 1200 }}
          locale={{
            emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No comments found" />,
          }}
        />
      </Card>

      {/* Comment Details Modal */}
      <CommentDetails
        open={isDetailsModalOpen}
        comment={selectedComment}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedComment(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};
