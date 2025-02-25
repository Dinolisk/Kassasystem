import React from 'react';
import './Products.css';

function Products({
  productsData,
  searchTerm,
  addToCart,
  formatProductPrice
}) {
  const filteredProducts = productsData.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.id.toString().includes(searchTerm)
  );
  return (
    <div className="products-list">
      {filteredProducts.map(product => (
        <div
          key={product.id}
          className="product-card"
          onClick={() => addToCart(product)}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              addToCart(product);
            }
          }}
        >
          <div className="product-image-container">
            <img src={product.thumbnail} alt={product.title} />
            <div className="product-id">ID Nr: {product.id}</div>
          </div>
          <div className="product-info">
            <h3>{product.title}</h3>
            <p className="product-description">{product.description}</p>
            <p className="price">{formatProductPrice(product.price)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Products;