import { useEffect, useState } from 'react';
import { productsApi } from '@/service/products/products.api';
import { BrandProps, CategoryProps, IProduct } from '@/service/service.types';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Input, Row, Select, Table, Typography } from 'antd';

import styles from './products.module.scss';

import { ProductCreateModal } from './components/product-create-modal/ProductCreateModal';
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
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const [brands, setBrands] = useState<BrandProps[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Fetch products from API
  const fetchProducts = async (page = 1, pageSize = 10) => {
    try {
      const response = await productsApi.getProducts({
        page,
        per_page: pageSize,
      });

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
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await productsApi.getCategories();
      if (response.data) setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  // Fetch brands from API
  const fetchBrands = async () => {
    try {
      const response = await productsApi.getBrands();
      if (response.data) setBrands(response.data);
    } catch (error) {
      console.error('Failed to fetch brands:', error);
    }
  };

  // Filter products by category
  const filterByCategory = async (categoryId: number) => {
    try {
      setLoading(true);
      const response = await productsApi.filterByCategory(categoryId);
      if (response.data) {
        setProducts(response.data.data);
        setPagination({
          current: response.data.current_page,
          pageSize: response.data.per_page,
          total: response.data.total,
        });
      }
    } catch (error) {
      console.error('Failed to filter by category:', error);
      message.error('Failed to filter products');
    } finally {
      setLoading(false);
    }
  };

  // Filter products by brand
  const filterByBrand = async (brandId: number) => {
    try {
      setLoading(true);
      const response = await productsApi.filterByBrand(brandId);
      if (response.data) {
        setProducts(response.data.data);
        setPagination({
          current: response.data.current_page,
          pageSize: response.data.per_page,
          total: response.data.total,
        });
      }
    } catch (error) {
      console.error('Failed to filter by brand:', error);
      message.error('Failed to filter products');
    } finally {
      setLoading(false);
    }
  };

  // Initialize data on component mount - FIXED: Consolidated into single useEffect
  useEffect(() => {
    const initializePageData = async () => {
      setLoading(true);
      try {
        // Fetch all data concurrently to prevent duplicate calls
        await Promise.all([fetchProducts(), fetchCategories(), fetchBrands()]);
      } catch (error) {
        console.error('Failed to initialize page data:', error);
        message.error('Failed to load page data');
      } finally {
        setLoading(false);
      }
    };

    initializePageData();
  }, []); // Empty dependency array - only run once on mount

  // Filter products based on search text (client-side filtering)
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      searchText === '' ||
      product.name.toLowerCase().includes(searchText.toLowerCase()) ||
      product.description.toLowerCase().includes(searchText.toLowerCase());

    return matchesSearch;
  });

  const handleEdit = (product: IProduct) => {
    console.log('Edit product:', product);
    // TODO: Implement edit functionality
  };

  const handleDelete = async (productId: number) => {
    try {
      await productsApi.deleteProduct(productId);
      message.success('Product deleted successfully');
      fetchProducts(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('Failed to delete product:', error);
      message.error('Failed to delete product');
    }
  };

  const handleView = (product: IProduct) => {
    console.log('View product:', product);
    // TODO: Implement view functionality
  };

  const handleCategoryChange = (value: string | undefined) => {
    setSelectedCategory(value);
    if (value) {
      const category = categories.find((cat) => cat.name === value);
      if (category) {
        filterByCategory(category.id);
      }
    } else {
      fetchProducts();
    }
  };

  const handleBrandChange = (value: string | undefined) => {
    setSelectedBrand(value);
    if (value) {
      const brand = brands.find((b) => b.name === value);
      if (brand) {
        filterByBrand(brand.id);
      }
    } else {
      fetchProducts();
    }
  };

  const handleTableChange = (pagination: any) => {
    fetchProducts(pagination.current, pagination.pageSize);
  };

  const handleCreateProduct = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateSuccess = () => {
    fetchProducts(pagination.current, pagination.pageSize);
    setIsCreateModalOpen(false);
  };

  // Create columns with handler functions
  const productsColumns = createProductsColumns({ handleEdit, handleDelete, handleView });

  return (
    <div className={styles.container}>
      <Card>
        <div style={{ marginBottom: '24px' }}>
          <Row justify="space-between" align="middle" style={{ marginBottom: '16px' }}>
            <Col>
              <Title level={3} style={{ margin: 0 }}>
                Products Management
              </Title>
            </Col>
            <Col>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateProduct}>
                Add New Product
              </Button>
            </Col>
          </Row>

          {/* Filters */}
          <Row gutter={16} style={{ marginBottom: '16px' }}>
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="Search products..."
                allowClear
                enterButton={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>
            <Col xs={12} sm={6} md={4} lg={3}>
              <Select
                placeholder="Category"
                allowClear
                style={{ width: '100%' }}
                value={selectedCategory}
                onChange={handleCategoryChange}
              >
                {categories.map((category) => (
                  <Option key={category.id} value={category.name}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} sm={6} md={4} lg={3}>
              <Select
                placeholder="Brand"
                allowClear
                style={{ width: '100%' }}
                value={selectedBrand}
                onChange={handleBrandChange}
              >
                {brands.map((brand) => (
                  <Option key={brand.id} value={brand.name}>
                    {brand.name}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>
        </div>

        {/* Products Table */}
        <Table
          columns={productsColumns}
          dataSource={filteredProducts}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} products`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Create Product Modal */}
      <ProductCreateModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};
