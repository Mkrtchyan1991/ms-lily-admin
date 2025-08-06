import { useEffect, useState } from 'react';
import { productsApi } from '@/service/products/products.api';
import { IProduct, ProductFilterParams } from '@/service/service.types';
import { selectBrands, selectCategories, selectCommonError, selectTags } from '@/store/common/common.selectors';
import { fetchFilterOptions } from '@/store/common/common.slice';
import { AppDispatch } from '@/store/store';
import { useDispatch, useSelector } from 'react-redux';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Input, Row, Select, Table, Typography } from 'antd';

import styles from './products.module.scss';

// ✨ CHANGE: Import the new unified component instead of separate modals
import { ProductManageModal } from './components/product-manage-modal/ProductManageModal';
import { createProductsColumns } from './products.utils';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

export const Products = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { message } = App.useApp();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>();
  const [selectedTag, setSelectedTag] = useState<string | undefined>();
  const categories = useSelector(selectCategories);
  const brands = useSelector(selectBrands);
  const tags = useSelector(selectTags);
  const commonError = useSelector(selectCommonError);

  // ✨ CHANGE: Unified modal state instead of separate create/edit modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Fetch products with optional filters
  const fetchProducts = async (page = 1, pageSize = 10, filters?: ProductFilterParams) => {
    try {
      setLoading(true);

      const response = await productsApi.getAllProducts({ page, per_page: pageSize, ...filters });

      if (response.data) {
        setProducts(response.data.data);
        setPagination(() => ({ pageSize, current: page, total: response.data.total || 0 }));
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      message.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    const initializePageData = async () => {
      setLoading(true);
      try {
        // Fetch products and filter options concurrently
        await Promise.all([fetchProducts(), dispatch(fetchFilterOptions()).unwrap()]);
      } catch (error) {
        console.error('Failed to initialize page data:', error);
        message.error('Failed to load page data');
      } finally {
        setLoading(false);
      }
    };

    initializePageData();
  }, [dispatch]);

  useEffect(() => {
    if (commonError) {
      message.error(commonError);
    }
  }, [commonError, message]);

  // Filter products based on search text (client-side filtering)
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchText === '' ||
      product.name?.toLowerCase()?.includes(searchText?.toLowerCase()) ||
      product.description?.toLowerCase()?.includes(searchText?.toLowerCase());

    return matchesSearch;
  });

  // ✨ CHANGE: Updated handlers to use unified modal
  const handleEdit = (product: IProduct) => {
    setModalMode('edit');
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (productId: number) => {
    try {
      await productsApi.admin.deleteProduct(productId);
      message.success('Product deleted successfully');
      fetchProducts(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Failed to delete product:', error);
      message.error('Failed to delete product');
    }
  };

  // Updated filter handlers
  const handleCategoryChange = (value: string | undefined) => {
    setSelectedCategory(value);
    const category = categories.find((cat) => cat.name === value);
    const categoryId = category?.id;

    // Reset other filters and fetch products
    setSelectedBrand(undefined);
    setSelectedTag(undefined);
    fetchProducts(1, pagination.pageSize, { category: categoryId });
  };

  const handleBrandChange = (value: string | undefined) => {
    setSelectedBrand(value);
    const brand = brands.find((b) => b.name === value);
    const brandId = brand?.id;

    // Keep category filter but reset tag filter
    const category = categories.find((cat) => cat.name === selectedCategory);
    const categoryId = category?.id;

    setSelectedTag(undefined);
    fetchProducts(1, pagination.pageSize, { category: categoryId, brand: brandId });
  };

  const handleTagChange = (value: string | undefined) => {
    setSelectedTag(value);
    const tag = tags.find((t) => t.name === value);
    const tagId = tag?.id;

    // Keep existing filters
    const category = categories.find((cat) => cat.name === selectedCategory);
    const categoryId = category?.id;
    const brand = brands.find((b) => b.name === selectedBrand);
    const brandId = brand?.id;

    fetchProducts(1, pagination.pageSize, { category: categoryId, brand: brandId, tag: tagId });
  };

  const handleClearFilters = () => {
    setSelectedCategory(undefined);
    setSelectedBrand(undefined);
    setSelectedTag(undefined);
    fetchProducts(1, pagination.pageSize);
  };

  const handleTableChange = (newPagination: any) => {
    // Preserve current filters when changing pages
    const category = categories.find((cat) => cat.name === selectedCategory);
    const categoryId = category?.id;
    const brand = brands.find((b) => b.name === selectedBrand);
    const brandId = brand?.id;
    const tag = tags.find((t) => t.name === selectedTag);
    const tagId = tag?.id;

    fetchProducts(newPagination.current, newPagination.pageSize, {
      category: categoryId,
      brand: brandId,
      tag: tagId,
    });
  };

  // ✨ CHANGE: New handler for create button
  const handleCreateProduct = () => {
    setModalMode('create');
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  // ✨ CHANGE: New handler for modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  // ✨ CHANGE: New handler for modal success
  const handleModalSuccess = () => {
    fetchProducts(pagination.current, pagination.pageSize);
  };

  return (
    <div className={styles.container}>
      <Row gutter={16}>
        <Col span={24}>
          <Card>
            {/* Header Section */}
            <div className={styles.header}>
              <Title level={2}>Products Management</Title>
              {/* ✨ CHANGE: Updated onClick handler */}
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateProduct}>
                Add Product
              </Button>
            </div>

            {/* Search and Filters */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={12} md={8}>
                <Search
                  placeholder="Search products..."
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="middle"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={12} md={6}>
                <Select
                  placeholder="Select Category"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  allowClear
                  style={{ width: '100%' }}
                >
                  {categories.map((category) => (
                    <Option key={category.id} value={category.name}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select
                  placeholder="Select Brand"
                  value={selectedBrand}
                  onChange={handleBrandChange}
                  allowClear
                  style={{ width: '100%' }}
                >
                  {brands.map((brand) => (
                    <Option key={brand.id} value={brand.name}>
                      {brand.name}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Select
                  placeholder="Select Tag"
                  value={selectedTag}
                  onChange={handleTagChange}
                  allowClear
                  style={{ width: '100%' }}
                >
                  {tags.map((tag) => (
                    <Option key={tag.id} value={tag.name}>
                      {tag.name}
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>

            {/* Clear Filters Button */}
            {(selectedCategory || selectedBrand || selectedTag) && (
              <Row style={{ marginBottom: 16 }}>
                <Col>
                  <Button onClick={handleClearFilters}>Clear All Filters</Button>
                </Col>
              </Row>
            )}

            {/* Products Table */}
            <Table
              columns={createProductsColumns({ handleEdit, handleDelete })}
              dataSource={filteredProducts}
              loading={loading}
              pagination={{
                ...pagination,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
              }}
              onChange={handleTableChange}
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>

      {/* ✨ CHANGE: Single unified modal instead of separate create/edit modals */}
      <ProductManageModal
        open={isModalOpen}
        mode={modalMode}
        product={editingProduct}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};
