import React, { useContext, useState } from 'react'
import './CartItems.css'
import { ShopContext } from '../../Context/ShopContext'
import remove_icon from '../Assets/cart_cross_icon.png'
import PaymentModal from '../PaymentModal/PaymentModal'


const CartItems = () => {
    const {getTotalCartAmount,all_product, CartItems,removeFromCart, clearCart} = useContext(ShopContext);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    const handlePaymentSuccess = () => {
        alert('Payment successful! Your order has been placed. 🎉');
        clearCart(); // Clear the cart after successful payment
        setShowPaymentModal(false);
    };

  return (
    <div className='cartitems'>
      <div className='cartitems-format-main'>
        <p>Products</p>
        <p>Title</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>
        <p>Remove</p>
      </div>
      <hr />
    {all_product.map((e)=>{
        if(CartItems[e.id]>0)
        {
            return  <div>
                        <div className='cartitems-format cartitems-format-main'>
                            <img className='carticon-product-icon' src={e.image} alt='' />
                            <p>{e.name}</p>
                            <p>₹{e.new_price}</p>
                            <button className='cartitems-quantity'>{CartItems[e.id]}</button>
                            <p>₹{e.new_price*CartItems[e.id]}</p>
                            <img className='carticons-remove-icon' src={remove_icon} onClick={()=>(removeFromCart(e.id))} alt='' />
                        </div>
                        <hr/>
                    </div>
        }
        return null;
    })}
    <div className='cartitem-down'>
      <div className='cartitems-total'>
        <h1>Cart Totals</h1>
        <div>
          <div className='cartitems-total-item'>
            <p>Subtotal</p>
            <p>₹{getTotalCartAmount()}</p>
          </div>
          <hr />
          <div className='cartitems-total-item'>
            <p>Shipping fee</p>
            <p>Free</p>
          </div>
          <hr />
          <div className='cartitems-total-item'>
            <h3>Total</h3>
            <h3>₹{getTotalCartAmount()}</h3>
          </div>
        </div>
        <button onClick={() => setShowPaymentModal(true)}>PROCEED TO CHECKOUT</button>
      </div>
      <div className='cartitems-promocode'>
        <p>If you have a promo code, Enter it here</p>
        <div className='cartitems-promobox'>
          <input type='text' placeholder='promo code' />
          <button>Submit</button>
        </div>
      </div>
    </div>
     {/* Payment Modal */}
            {showPaymentModal && (
                <PaymentModal
                    totalAmount={getTotalCartAmount()}
                    onClose={() => setShowPaymentModal(false)}
                    onPaymentSuccess={handlePaymentSuccess}
                    cartItems={CartItems}
                    allProducts={all_product}
                />
            )}
    </div>
  )
}

export default CartItems
