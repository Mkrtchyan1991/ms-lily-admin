import React, { useCallback, useEffect, useState } from 'react';
import { isResourceApiType, optionsApi, OptionType } from '@/service/options/options.api';
import { App, Button, Input, Modal, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import styles from './options.module.scss';

interface OptionItem {
  key: string;
  id?: number;
  name: string;
}

const labels: Record<OptionType, string> = {
  categories: 'Category',
  brands: 'Brand',
  tags: 'Tag',
  colors: 'Color',
  sizes: 'Size',
};

const OptionManager: React.FC<{ type: OptionType }> = ({ type }) => {
  const { message, modal } = App.useApp();
  const [items, setItems] = useState<OptionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<OptionItem | null>(null);
  const [name, setName] = useState('');

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await optionsApi[type].getAll();
      const data = res.data;
      const formatted = data.map((item: string | { id: number; name: string }) =>
        typeof item === 'string'
          ? { key: item, name: item }
          : { key: item.id.toString(), id: item.id, name: item.name },
      );
      setItems(formatted);
    } catch {
      message.error(`Failed to load ${labels[type].toLowerCase()}s`);
    } finally {
      setLoading(false);
    }
  }, [message, type]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleCreate = () => {
    setEditingItem(null);
    setName('');
    setIsModalOpen(true);
  };

  const handleEdit = (item: OptionItem) => {
    setEditingItem(item);
    setName(item.name);
    setIsModalOpen(true);
  };

  const handleDelete = (item: OptionItem) => {
    modal.confirm({
      title: `Delete ${labels[type]}`,
      content: `Are you sure you want to delete this ${labels[type].toLowerCase()}?`,
      okType: 'danger',
      onOk: async () => {
        try {
          if (isResourceApiType(type)) {
            // TypeScript now knows this is a ResourceApi
            if (item.id !== undefined) {
              await optionsApi[type].delete(item.id);
            } else {
              throw new Error('ID is required for resource-based deletion');
            }
          } else {
            // TypeScript now knows this is a SimpleApi
            await optionsApi[type].delete(item.name);
          }
          message.success(`${labels[type]} deleted`);
          fetchItems();
        } catch {
          message.error(`Failed to delete ${labels[type].toLowerCase()}`);
        }
      },
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingItem) {
        if (isResourceApiType(type)) {
          // TypeScript now knows this is a ResourceApi
          if (editingItem.id !== undefined) {
            await optionsApi[type].update(editingItem.id, { name });
          } else {
            throw new Error('ID is required for resource-based update');
          }
        } else {
          // TypeScript now knows this is a SimpleApi
          await optionsApi[type].update(editingItem.name, { name });
        }
        message.success(`${labels[type]} updated`);
      } else {
        await optionsApi[type].create({ name });
        message.success(`${labels[type]} created`);
      }
      setIsModalOpen(false);
      fetchItems();
    } catch {
      message.error(`Failed to save ${labels[type].toLowerCase()}`);
    }
  };

  const columns: ColumnsType<OptionItem> = [
    { title: labels[type], dataIndex: 'name', key: 'name' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div>
          <Button size="small" onClick={() => handleEdit(record)} style={{ marginRight: 8 }}>
            Edit
          </Button>
          <Button size="small" danger onClick={() => handleDelete(record)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>{labels[type]} Management</h2>
        <Button type="primary" onClick={handleCreate}>
          Add {labels[type]}
        </Button>
      </div>
      <Table rowKey="key" columns={columns} dataSource={items} loading={loading} pagination={false} />

      <Modal
        open={isModalOpen}
        title={editingItem ? `Edit ${labels[type]}` : `Add ${labels[type]}`}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
      >
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`Enter ${labels[type].toLowerCase()} name`}
        />
      </Modal>
    </div>
  );
};

export const CategoriesPage = () => <OptionManager type="categories" />;
export const BrandsPage = () => <OptionManager type="brands" />;
export const TagsPage = () => <OptionManager type="tags" />;
export const ColorsPage = () => <OptionManager type="colors" />;
export const SizesPage = () => <OptionManager type="sizes" />;

export default OptionManager;
