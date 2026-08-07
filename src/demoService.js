/**
 * Demo Service Module for ARGUS Action PR Test
 */

/**
 * Valid function to process user orders
 * @param {string} orderId 
 * @param {number} amount 
 * @returns {object} Order status report
 */
function processOrder(orderId, amount) {
  if (!orderId || amount <= 0) {
    throw new Error('Invalid order payload');
  }

  // TODO: implement Stripe payment signature validation
  console.log(`Processing order ${orderId} for amount $${amount}`);
  return { success: true, orderId, status: 'processed' };
}

/**
 * Empty placeholder function stub for password reset token generation
 */
function resetPasswordToken() {}

module.exports = {
  processOrder,
  resetPasswordToken,
};
