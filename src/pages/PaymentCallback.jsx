import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getOrderById } from "../api/woocommerce";

/**
 * PaymentCallback Component
 * 
 * Handles payment gateway callbacks (Tabby, Tamara, Stripe, etc)
 * Checks backend order status and displays appropriate page
 * 
 * Features:
 * - Checks if order exists in backend
 * - Gets payment method from order
 * - Shows success page for COD (Cash on Delivery)
 * - Shows failed page for payment gateway methods if order not confirmed
 * - Shows success page if order status is "completed" or "processing"
 */

export default function PaymentCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('loading'); // loading, success, failed
  const [order, setOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const checkOrderStatus = async () => {
      try {
        // Get order ID from URL query params
        const queryParams = new URLSearchParams(location.search);
        const orderId = queryParams.get('order_id');
        const orderKey = queryParams.get('key');

        if (!orderId) {
          setStatus('failed');
          setErrorMessage('No order ID found. Please check your payment confirmation email.');
          return;
        }

        console.log('🔍 Checking order status for Order ID:', orderId);

        // Fetch order from backend
        const orderData = await getOrderById(orderId);

        if (!orderData) {
          // Order doesn't exist yet
          console.warn('❌ Order not found in backend');
          setStatus('failed');
          setErrorMessage('Order not found. Please contact support.');
          return;
        }

        console.log('📦 Order found:', orderData);

        // Get payment method from order
        const method = orderData.payment_method || 'unknown';
        setPaymentMethod(method);
        setOrder(orderData);

        // Check order status
        const orderStatus = orderData.status || 'pending';
        console.log('💳 Payment Method:', method);
        console.log('📊 Order Status:', orderStatus);

        // ============================================
        // PAYMENT METHOD LOGIC
        // ============================================
        // COD (Cash on Delivery) orders ALWAYS show success
        if (method === 'cod') {
          console.log('✅ COD Order - ALWAYS showing success page (regardless of status)');
          setStatus('success');
          return;
        }

        // For payment gateway methods (card, tabby, tamara, stripe, etc)
        // Only show success if payment was confirmed
        const isPaid = orderData.paid || orderStatus === 'completed' || orderStatus === 'processing';
        
        if (isPaid) {
          console.log('✅ Payment gateway confirmed - Showing success page');
          setStatus('success');
        } else {
          console.log('❌ Payment gateway NOT confirmed - Showing failed page');
          setStatus('failed');
          setErrorMessage('Payment could not be confirmed. Please try again or contact support.');
        }
      } catch (error) {
        console.error('❌ Error checking order status:', error);
        setStatus('failed');
        setErrorMessage('An error occurred while checking your order. Please try again later.');
      }
    };

    checkOrderStatus();
  }, [location]);

  // Loading State
  if (status === 'loading') {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f7fafc',
        padding: 16
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          padding: '40px 24px',
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: 48,
            marginBottom: 16,
            animation: 'spin 1s linear infinite'
          }}>⏳</div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 12px 0', color: '#222' }}>
            Checking Payment Status...
          </h1>
          <p style={{ color: '#666', fontSize: 14 }}>
            Please wait while we confirm your order
          </p>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Success State
  if (status === 'success') {
    const paymentMethodLabel = {
      'cod': 'Cash on Delivery',
      'tabby': 'Tabby',
      'tamara': 'Tamara',
      'stripe': 'Stripe',
      'paypal': 'PayPal'
    }[paymentMethod] || 'Unknown';

    const isCOD = paymentMethod === 'cod';

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f7fafc',
        padding: 16
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          padding: '40px 24px',
          maxWidth: 500,
          width: '100%',
        }}>
          {/* Success Icon */}
          <div style={{ fontSize: 64, color: '#39B54A', marginBottom: 16, textAlign: 'center' }}>
            ✓
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            margin: '0 0 12px 0',
            color: '#222',
            textAlign: 'center'
          }}>
            {isCOD ? 'Order Confirmed!' : 'Payment Successful'}
          </h1>

          {/* Message */}
          <p style={{
            color: '#555',
            fontSize: 16,
            marginBottom: 24,
            textAlign: 'center',
            lineHeight: 1.5
          }}>
            {isCOD
              ? 'Your order has been confirmed. We will deliver your items soon.'
              : `Your payment via ${paymentMethodLabel} was successful. Your order is being prepared for delivery.`}
          </p>

          {/* Order Details */}
          {order && (
            <div style={{
              background: '#f5f5f5',
              padding: 16,
              borderRadius: 8,
              marginBottom: 24
            }}>
              <div style={{ marginBottom: 12 }}>
                <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: 12 }}>Order Number</p>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#222' }}>
                  #{order.id}
                </p>
              </div>

              <div style={{ marginBottom: 12 }}>
                <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: 12 }}>Payment Method</p>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 500, color: '#222' }}>
                  {paymentMethodLabel}
                </p>
              </div>

              <div>
                <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: 12 }}>Total Amount</p>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#39B54A' }}>
                  AED {parseFloat(order.total || 0).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Product Details */}
          {order && order.line_items && order.line_items.length > 0 && (
            <div style={{
              marginBottom: 24,
              borderTop: '1px solid #e0e0e0',
              paddingTop: 16
            }}>
              <h3 style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#222',
                margin: '0 0 16px 0'
              }}>
                Order Items
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {order.line_items.map((item, index) => (
                  <div key={item.id || index} style={{
                    display: 'flex',
                    gap: 12,
                    padding: 12,
                    background: '#fff',
                    borderRadius: 8,
                    border: '1px solid #e0e0e0'
                  }}>
                    {/* Product Image */}
                    <div style={{
                      width: 60,
                      height: 60,
                      flexShrink: 0,
                      borderRadius: 6,
                      overflow: 'hidden',
                      background: '#f5f5f5'
                    }}>
                      {item.image?.src ? (
                        <img 
                          src={item.image.src} 
                          alt={item.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 24,
                          color: '#ccc'
                        }}>📦</div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        margin: '0 0 4px 0',
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#222',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {item.name}
                      </p>
                      <p style={{
                        margin: '0 0 4px 0',
                        fontSize: 12,
                        color: '#666'
                      }}>
                        Qty: {item.quantity}
                      </p>
                      <p style={{
                        margin: 0,
                        fontSize: 14,
                        fontWeight: 600,
                        color: '#39B54A'
                      }}>
                        AED {parseFloat(item.total || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div style={{
                marginTop: 16,
                paddingTop: 16,
                borderTop: '1px solid #e0e0e0'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 8
                }}>
                  <span style={{ fontSize: 13, color: '#666' }}>Subtotal:</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#222' }}>
                    AED {parseFloat(order.total - (order.total >= 100 ? 0 : 15)).toFixed(2)}
                  </span>
                </div>
                
                {order.total < 100 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: 8
                  }}>
                    <span style={{ fontSize: 13, color: '#666' }}>Shipping:</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#222' }}>
                      AED 15.00
                    </span>
                  </div>
                )}
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: 8,
                  borderTop: '1px solid #e0e0e0'
                }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#222' }}>Total:</span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: '#39B54A' }}>
                    AED {parseFloat(order.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => navigate(`/track-order?order_id=${order?.id}`)}
              style={{
                flex: 1,
                padding: '12px 20px',
                background: '#2f86eb',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#1e5ac7'}
              onMouseLeave={(e) => e.target.style.background = '#2f86eb'}
            >
              Track Order
            </button>

            <button
              onClick={() => navigate('/')}
              style={{
                flex: 1,
                padding: '12px 20px',
                background: '#f0f0f0',
                color: '#222',
                border: 'none',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#e0e0e0'}
              onMouseLeave={(e) => e.target.style.background = '#f0f0f0'}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Failed State
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f7fafc',
      padding: 16
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        padding: '40px 24px',
        maxWidth: 500,
        width: '100%',
      }}>
        {/* Error Icon */}
        <div style={{ fontSize: 64, color: '#dc3545', marginBottom: 16, textAlign: 'center' }}>
          ✕
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 28,
          fontWeight: 700,
          margin: '0 0 12px 0',
          color: '#222',
          textAlign: 'center'
        }}>
          Payment Failed
        </h1>

        {/* Message */}
        <p style={{
          color: '#555',
          fontSize: 16,
          marginBottom: 24,
          textAlign: 'center',
          lineHeight: 1.5
        }}>
          {errorMessage || 'We could not process your payment. Please check your payment details and try again.'}
        </p>

        {/* Info Box */}
        <div style={{
          background: '#fff3cd',
          border: '1px solid #ffc107',
          padding: 16,
          borderRadius: 8,
          marginBottom: 24
        }}>
          <p style={{ margin: 0, color: '#856404', fontSize: 13, lineHeight: 1.5 }}>
            <strong>What's next?</strong><br />
            • Check your payment method details<br />
            • Ensure you have sufficient balance<br />
            • Contact your bank if the issue persists<br />
            • Click "Try Again" to retry the payment
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => navigate('/checkout')}
            style={{
              flex: 1,
              padding: '12px 20px',
              background: '#dc3545',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#c82333'}
            onMouseLeave={(e) => e.target.style.background = '#dc3545'}
          >
            Try Again
          </button>

          <button
            onClick={() => navigate('/')}
            style={{
              flex: 1,
              padding: '12px 20px',
              background: '#f0f0f0',
              color: '#222',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#e0e0e0'}
            onMouseLeave={(e) => e.target.style.background = '#f0f0f0'}
          >
            Return Home
          </button>
        </div>

        {/* Support Text */}
        <p style={{
          color: '#999',
          fontSize: 12,
          marginTop: 20,
          textAlign: 'center'
        }}>
          Need help? <a href="/support" style={{ color: '#2f86eb', textDecoration: 'none' }}>Contact Support</a>
        </p>
      </div>
    </div>
  );
}
