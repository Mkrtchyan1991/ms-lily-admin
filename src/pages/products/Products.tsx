import { useEffect, useState } from 'react';
import { productsApi } from '@/service/products/products.api';
import { BrandProps, CategoryProps, IProduct, ProductFilterParams, TagProps } from '@/service/service.types';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Input, Row, Select, Table, Typography } from 'antd';

import styles from './products.module.scss';

import { ProductCreateModal } from './components/product-create-modal/ProductCreateModal';
import ProductEditModal from './components/product-edit-modal/ProductEditModal';
import { createProductsColumns } from './products.utils';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

export const Products = () => {
  const { message } = App.useApp();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>();
  const [selectedTag, setSelectedTag] = useState<string | undefined>();
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [brands, setBrands] = useState<BrandProps[]>([]);
  const [tags, setTags] = useState<TagProps[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

      console.log(filters);
      const response = await productsApi.getAllProducts({ page, per_page: pageSize, ...filters });

      if (response.data) {
        setProducts(response.data.data);
        setPagination({
          current: response.data.current_page,
          pageSize: response.data.per_page,
          total: response.data.total,
        });
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      message.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Fetch filter options from the new consolidated endpoint
  const fetchFilterOptions = async () => {
    try {
      const response = await productsApi.getFilterOptions();
      if (response.data) {
        setCategories(response.data.categories);
        setBrands(response.data.brands);
        setTags(response.data.tags);
      }
    } catch (error) {
      console.error('Failed to fetch filter options:', error);
      message.error('Failed to load filter options');
    }
  };

  // Initialize data on component mount
  useEffect(() => {
    const initializePageData = async () => {
      setLoading(true);
      try {
        // Fetch products and filter options concurrently
        await Promise.all([fetchProducts(), fetchFilterOptions()]);
      } catch (error) {
        console.error('Failed to initialize page data:', error);
        message.error('Failed to load page data');
      } finally {
        setLoading(false);
      }
    };

    initializePageData();
  }, []);

  // Filter products based on search text (client-side filtering)
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchText === '' ||
      product.name.toLowerCase().includes(searchText.toLowerCase()) ||
      product.description.toLowerCase().includes(searchText.toLowerCase());

    return matchesSearch;
  });

  const handleEdit = (product: IProduct) => {
    setEditingProduct(product);
    setIsEditModalOpen(true);
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

    fetchProducts(newPagination.current, newPagination.pageSize, { category: categoryId, brand: brandId, tag: tagId });
  };

  return (
    <div className={styles.productsContainer}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
              <Col>
                <Title level={3}>Products Management</Title>
              </Col>
              <Col>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)}>
                  Add Product
                </Button>
              </Col>
            </Row>

            {/* Search and Filter Controls */}
            <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={12} md={6}>
                <Search
                  placeholder="Search products..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  prefix={<SearchOutlined />}
                />
              </Col>
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

      <ProductCreateModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          fetchProducts(pagination.current, pagination.pageSize);
        }}
      />
      <ProductEditModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        product={editingProduct}
        onSuccess={() => {
          setIsEditModalOpen(false);
          setEditingProduct(null);
          fetchProducts(pagination.current, pagination.pageSize);
        }}
      />
    </div>
  );
};
