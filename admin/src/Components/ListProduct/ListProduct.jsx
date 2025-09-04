import React, { useEffect, useState } from 'react'
import './ListProduct.css'
import cross_icon from '../../assets/cross_icon.png'
import edit_icon from '../../assets/edit_icon.jpg'
import SimpleEditModal from '../SimpleEditModal/SimpleEditModal'

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const ListProduct = () => {
    const [allproducts, setAllProducts] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const fetchInfo = async () => {
        try {
            const response = await fetch(`${API_URL}/allproducts`);
            const data = await response.json();
            setAllProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }

    useEffect(() => {
        fetchInfo();
    }, [])

    const remove_product = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            await fetch(`${API_URL}/removeproduct`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: id })
            });
            await fetchInfo();
        }
    }

    const edit_product = (product) => {
        setEditingProduct(product);
        setShowEditModal(true);
    }

    const handleProductUpdate = () => {
        fetchInfo(); // Refresh the list
        setShowEditModal(false);
        setEditingProduct(null);
    }

    return (
        <div className='list-product'>
            <h1>All Product List</h1>
            <div className='listproduct-format-main'>
                <p>Product</p>
                <p>Title</p>
                <p>Old Price</p>
                <p>New Price</p>
                <p>Category</p>
                <p>Actions</p>
            </div>
            <div className='listproduct-allproducts'>
                <hr />
                {allproducts.map((product, index) => (
                    <div key={index}>
                        <div className='listproduct-format-main listproduct-format'>
                            <img src={product.image} alt='' className='listproduct-product-icon' />
                            <p>{product.name}</p>
                            <p>₹{product.old_price}</p>
                            <p>₹{product.new_price}</p>
                            <p>{product.category}</p>
                            <div className='listproduct-actions'>
                                <img 
                                    onClick={() => edit_product(product)} 
                                    src={edit_icon} 
                                    alt='Edit' 
                                    className='listproduct-edit-icon' 
                                    title='Edit Product' 
                                />
                                <img 
                                    onClick={() => remove_product(product.id)} 
                                    src={cross_icon} 
                                    alt='Remove' 
                                    className='listproduct-remove-icon' 
                                    title='Remove Product' 
                                />
                            </div>
                        </div>
                        <hr />
                    </div>
                ))}
            </div>

            {showEditModal && editingProduct && (
                <SimpleEditModal
                    product={editingProduct}
                    onClose={() => setShowEditModal(false)}
                    onUpdate={handleProductUpdate}
                />
            )}
        </div>
    )
}

export default ListProduct;