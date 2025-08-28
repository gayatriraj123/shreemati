import React, { useEffect, useState } from 'react'
import './ListProduct.css'
import cross_icon from '../../assets/cross_icon.png'

const ListProduct = () => {

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
    const [allproducts,setAllProducts] = useState([]);
    const fetchInfo = async ()=>{
      await fetch(`${API_URL}/allproducts`)
      .then((res)=>res.json())
      .then((data)=>{setAllProducts(data)});
    }

    useEffect (()=>{
      fetchInfo();
    },[])

    const remove_product = async (id)=>{
      await fetch(`${API_URL}/removeproduct`,{
        method:'POST',
        headers:{
          Accept:'application/json',
          'Content-Type':'application/json',
        },
        body:JSON.stringify({id:id})
      })
      await fetchInfo();
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
        <p>Remove</p>
      </div>
      <div className='listproduct-allproducts'>
        <hr />
        {allproducts.map((product,index)=>{
          return <> 
          <div key={index} className='listproduct-format-main listproduct-format'>
            <img src={product.image} alt='' className='listproduct-product-icon' />
            <p>{product.name}</p>
            <p>${product.old_price}</p>
            <p>${product.new_price}</p>
            <p>{product.category}</p>
            <img onClick={()=>{remove_product(product.id)}} src={cross_icon} alt='' className='listproduct-remove-icon' />
          </div>
          <hr />
          </>
        })}
      </div>
    </div>
  )
}

export default ListProduct
