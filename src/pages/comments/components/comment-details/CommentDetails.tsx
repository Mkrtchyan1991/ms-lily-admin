import React from 'react';
import { ProductComment } from '@/service/service.types';
import { formatDateTime } from '@/utils/date';
import { CheckOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, Modal, Space, Tag, Typography } from 'antd';

import styles from './comment-details.module.scss';

import { getStatusColor, getStatusText } from '../../comments.utils';

const { Title, Text, Paragraph } = Typography;

interface CommentDetailsModalProps {
  open: boolean;
  comment: ProductComment | null;
  onClose: () => void;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
}

// User info component for better reusability
const UserInfo: React.FC<{ user: ProductComment['user'] }> = ({ user }) => (
  <div className={styles.userInfo}>
    <Avatar size="default" icon={<UserOutlined />} className={styles.avatar}>
      {user.name.charAt(0).toUpperCase()}
    </Avatar>
    <div className={styles.userDetails}>
      <Text className={styles.userName}>
        {user.name} {user.last_name}
      </Text>
      <Text type="secondary" className={styles.userEmail}>
        {user.email}
      </Text>
    </div>
  </div>
);

export const CommentDetails: React.FC<CommentDetailsModalProps> = ({ open, comment, onClose, onApprove, onReject }) => {
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
    <Modal
      title={
        <div className={styles.modalTitle}>
          <Title level={4} className={styles.titleText}>
            Comment Details
          </Title>
          <Tag color={getStatusColor(comment.status)}>{getStatusText(comment.status)}</Tag>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={footer}
      width={700}
      className={styles.modal}
    >
      <Space direction="vertical" size="large" className={styles.content}>
        {/* User Information */}
        <div className={styles.section}>
          <Title level={5} className={styles.sectionTitle}>
            User Information
          </Title>
          <Card size="small" className={styles.infoCard}>
            <UserInfo user={comment.user} />
          </Card>
        </div>

        {/* Product Information */}
        {comment.product && (
          <div className={styles.section}>
            <Title level={5} className={styles.sectionTitle}>
              Product Information
            </Title>
            <Card size="small" className={styles.infoCard}>
              <Space direction="vertical" size="small" className={styles.productInfo}>
                <Space>
                  <Text strong>Product:</Text>
                  <Text>{comment.product.name}</Text>
                </Space>
                <Space>
                  <Text strong>Product ID:</Text>
                  <Text>#{comment.product.id}</Text>
                </Space>
              </Space>
            </Card>
          </div>
        )}

        {/* Comment Content */}
        <div className={styles.section}>
          <Title level={5} className={styles.sectionTitle}>
            Comment Content
          </Title>
          <Card size="small" className={styles.commentCard}>
            <Paragraph className={styles.commentContent}>{comment.content}</Paragraph>
          </Card>
        </div>

        {/* Metadata */}
        <div className={styles.section}>
          <Title level={5} className={styles.sectionTitle}>
            Metadata
          </Title>
          <Card size="small" className={styles.infoCard}>
            <Space direction="vertical" size="small" className={styles.metadata}>
              <div className={styles.metadataRow}>
                <Text strong>Comment ID:</Text>
                <Text>#{comment.id}</Text>
              </div>
              <div className={styles.metadataRow}>
                <Text strong>Status:</Text>
                <Tag color={getStatusColor(comment.status)}>{getStatusText(comment.status)}</Tag>
              </div>
              <div className={styles.metadataRow}>
                <Text strong>Posted:</Text>
                <Text>{formatDateTime(comment.created_at, { dateStyle: 'medium', timeStyle: 'medium' })}</Text>
              </div>
              {comment.updated_at !== comment.created_at && (
                <div className={styles.metadataRow}>
                  <Text strong>Last Updated:</Text>
                  <Text>{formatDateTime(comment.updated_at, { dateStyle: 'medium', timeStyle: 'medium' })}</Text>
                </div>
              )}
            </Space>
          </Card>
        </div>
      </Space>
    </Modal>
  );
};
