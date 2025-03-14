import React, { useMemo } from 'react';
import './Products.css';

function Products({
  productsData,
  searchTerm,
  addToCart,
  formatProductPrice
}) {
  // Memoize the filtered products to prevent unnecessary recalculations
  const filteredProducts = useMemo(() => 
    productsData.filter(product =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.id.toString().includes(searchTerm)
    ), 
    [productsData, searchTerm]  // Only recalculate when these dependencies change
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
            <div className="product-id">Artikelnummer: {product.id}</div>
          </div>
          <div className="product-info">
            <h3>{product.title}</h3>
            <p className="product-description">{product.description}</p>
            {/* Lägg till price-container div runt priset */}
            <div className="price-container">
              <span className="price">{formatProductPrice(product.price)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Products;