import React from 'react';
import './Products.css';
    
function Products({ 
  productsData, 
  searchTerm, 
  addToCart, 
  formatProductPrice 
}) {
  const filteredProducts = productsData.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
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
          <img src={product.thumbnail} alt={product.title} />
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