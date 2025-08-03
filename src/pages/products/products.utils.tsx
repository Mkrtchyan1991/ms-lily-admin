import { baseURL } from '@/configs/axios.config';
import { IProduct, TagProps } from '@/service/service.types';
import { getFile } from '@/service/service.utils';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Badge, Button, Image, Space, Tag, Tooltip } from 'antd';
import { ColumnsType } from 'antd/es/table';

const getStockStatus = (stock: number) => {
  if (stock === 0) return { color: 'error', text: 'Out of Stock' };
  if (stock <= 5) return { color: 'warning', text: 'Low Stock' };
  return { color: 'success', text: 'In Stock' };
};

interface ProductsColumnsProps {
  handleEdit: (product: IProduct) => void;
  handleDelete: (productId: number) => void;
}

export const createProductsColumns = ({ handleEdit, handleDelete }: ProductsColumnsProps): ColumnsType<IProduct> => [
  {
    title: 'Image',
    dataIndex: 'image',
    key: 'image',
    width: 80,
    render: (image: string | null) => (
      <Image
        width={50}
        height={50}
        src={image ? getFile(image) : '  https://placehold.co/50x50?text=No+Image'}
        fallback="  https://placehold.co/50x50?text=No+Image"
        style={{ objectFit: 'cover', borderRadius: '4px' }}
      />
    ),
  },
  {
    title: 'Product Name',
    dataIndex: 'name',
    key: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
    render: (text: string, record: IProduct) => (
      <div>
        <div style={{ fontWeight: 500 }}>{text}</div>
        <div style={{ fontSize: '12px', color: '#666' }}>{record.description}</div>
      </div>
    ),
  },
  {
    title: 'Category',
    dataIndex: ['category', 'name'],
    key: 'category',
    render: (category: string) => <Tag color="blue">{category}</Tag>,
  },
  {
    title: 'Brand',
    dataIndex: ['brand', 'name'],
    key: 'brand',
    render: (brand: string) => <Tag color="green">{brand}</Tag>,
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
    sorter: (a, b) => parseFloat(a.price) - parseFloat(b.price),
    render: (price: string) => <span style={{ fontWeight: 500 }}>${price}</span>,
  },
  {
    title: 'Stock',
    dataIndex: 'stock',
    key: 'stock',
    sorter: (a, b) => a.stock - b.stock,
    render: (stock: number) => {
      const status = getStockStatus(stock);
      return <Badge status={status.color as any} text={`${stock} (${status.text})`} />;
    },
  },
  {
    title: 'Size/Color',
    key: 'details',
    render: (_, record: IProduct) => (
      <div>
        <Tag color="default">Size: {record.size}</Tag>
        <Tag color="default">{record.color}</Tag>
      </div>
    ),
  },
  {
    title: 'Tags',
    dataIndex: 'tags',
    key: 'tags',
    render: (tags: TagProps[]) => (
      <div>
        {tags.map((tag) => (
          <Tag key={tag.id} color="purple" style={{ marginBottom: '2px' }}>
            {tag.name}
          </Tag>
        ))}
      </div>
    ),
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 150,
    render: (_, record: IProduct) => {
      return (
        <Space size="small">
          <Tooltip title="Edit">
            <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
          </Tooltip>
        </Space>
      );
    },
  },
];
