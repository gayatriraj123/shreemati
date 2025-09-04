import React, { useState } from 'react'
import './SimpleEditModal.css'

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const SimpleEditModal = ({ product, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: product.name,
        old_price: product.old_price,
        new_price: product.new_price,
        category: product.category
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/updateproduct`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: product.id,
                    name: formData.name,
                    old_price: formData.old_price,
                    new_price: formData.new_price,
                    category: formData.category
                })
            });

            const data = await response.json();
            
            if (data.success) {
                alert("Product updated successfully!");
                onUpdate();
                onClose();
            } else {
                alert("Failed to update product: " + data.error);
            }
        } catch (error) {
            console.error('Update error:', error);
            alert("Failed to update product");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="simple-edit-modal">
            <div className="simple-edit-content">
                <div className="simple-edit-header">
                    <h2>Edit Product: {product.name}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                
                <form onSubmit={handleSubmit} className="simple-edit-form">
                    <div className='simple-edit-field'>
                        <label>Product Name</label>
                        <input 
                            type='text' 
                            name='name' 
                            value={formData.name} 
                            onChange={handleChange}
                            required 
                        />
                    </div>
                    
                    <div className='simple-edit-row'>
                        <div className='simple-edit-field'>
                            <label>Original Price (₹)</label>
                            <input 
                                type='number' 
                                name='old_price' 
                                value={formData.old_price} 
                                onChange={handleChange}
                                required 
                            />
                        </div>
                        
                        <div className='simple-edit-field'>
                            <label>Sale Price (₹)</label>
                            <input 
                                type='number' 
                                name='new_price' 
                                value={formData.new_price} 
                                onChange={handleChange}
                                required 
                            />
                        </div>
                    </div>
                    
                    <div className='simple-edit-field'>
                        <label>Category</label>
                        <select 
                            name='category' 
                            value={formData.category} 
                            onChange={handleChange}
                        >
                            <option value="women">Women</option>
                            <option value="men">Men</option>
                            <option value="kid">Kid</option>
                        </select>
                    </div>
                    
                    <div className='simple-edit-buttons'>
                        <button type="button" onClick={onClose} className='cancel-btn'>
                            Cancel
                        </button>
                        <button type="submit" className='update-btn' disabled={loading}>
                            {loading ? 'Updating...' : 'Update Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SimpleEditModal;