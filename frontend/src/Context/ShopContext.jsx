import React, { createContext, useEffect, useState } from 'react';
// import all_product from '../Components/Assets/all_product';

export const ShopContext = createContext(null);

const getDefaultCart = () =>{
    let cart = {};
    for (let index = 0; index < 300+1; index++) {
        cart[index] = 0;
        
    }
    return cart;
}

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";
const ShopContextProvider = (props) =>{

    const [all_product,setAll_Product] = useState([]);
    const [CartItems, setCartItems] = useState(getDefaultCart());

    useEffect(()=>{
        fetch(`${API_URL}/allproducts`)
        .then((response)=>response.json())
        .then((data)=>setAll_Product(data))

        if(localStorage.getItem('auth-token')){
            fetch(`${API_URL}/getcart`,{
                method:'POST',
                headers:{
                    Accept:'application/form-data',
                    'auth-token':`${localStorage.getItem('auth-token')}`,
                    'Content-Type':'application/json',
                },
                body:"",
            }).then((response)=>response.json())
            .then((data)=>setCartItems(data));
        }
    },[])
    
    // console.log(cartItems);
    const addToCart = (itemId) =>{
        setCartItems((prev)=>({...prev,[itemId]:prev[itemId]+1}))
        // console.log(CartItems);
        if(localStorage.getItem('auth-token')){
            fetch(`${API_URL}/addtocart`,{
                method:'POST',
                headers:{
                    Accept:'application/form-data',
                    'auth-token':`${localStorage.getItem('auth-token')}`,
                    'Content-Type':'application/json',
                },
                body:JSON.stringify({"itemId":itemId}),
            })
            .then((response)=>response.json())
            .then((data)=>console.log(data));
        }
    }
    const removeFromCart = (itemId) =>{
        setCartItems((prev)=>({...prev,[itemId]:prev[itemId]-1}));
        if(localStorage.getItem('auth-token')){
            fetch(`${API_URL}/removefromcart`,{
                method:'POST',
                headers:{
                    Accept:'application/form-data',
                    'auth-token':`${localStorage.getItem('auth-token')}`,
                    'Content-Type':'application/json',
                },
                body:JSON.stringify({"itemId":itemId}),
            })
            .then((response)=>response.json())
            .then((data)=>console.log(data));
        }
    }

    
    // ADD THIS NEW FUNCTION: clearCart
    const clearCart = () => {
        // Clear local cart state
        setCartItems(getDefaultCart());
        
        // Clear cart on server if user is authenticated
        if (localStorage.getItem('auth-token')) {
            // You might want to create a backend endpoint to clear the cart
            // For now, we'll just set all quantities to 0 on the frontend
            console.log('Cart cleared');
            
            // If you have a backend endpoint to clear cart, you can call it here:
            // fetch(`${API_URL}/clearcart`, {
            //     method: 'POST',
            //     headers: {
            //         'auth-token': `${localStorage.getItem('auth-token')}`,
            //         'Content-Type': 'application/json',
            //     },
            // })
            // .then(response => response.json())
            // .then(data => console.log('Server cart cleared:', data));
        }
    }
    const getTotalCartAmount = () =>{
        let totalAmount = 0;
        for(const item in CartItems)
        {
            if(CartItems[item]>0)
            {
                let itemInfo = all_product.find((product)=>product.id===Number(item));
                totalAmount += itemInfo.new_price * CartItems[item];
            }
            
        }
        return totalAmount;
    }

    const getTotalCartItems = () =>{
        let totalItem = 0;
        for(const item in CartItems)
        {
            if(CartItems[item]>0)
            {
                totalItem +=CartItems[item];
            }
        }
        return totalItem;
    }
    
    const contextValue = { getTotalCartItems, getTotalCartAmount, all_product, CartItems, addToCart, removeFromCart, clearCart};
    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider;
