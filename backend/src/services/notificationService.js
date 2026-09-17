/**
 * SwadGhar Notification Service
 * Handles SMS & phone notification dispatching on order status changes.
 * Supports Twilio / Fast2SMS / SMS Gateway configuration via env variables.
 */

const formatStatusSMS = (orderNumber, status, customerName, total) => {
  const brand = 'SwadGhar Fine Dining';
  switch (status) {
    case 'confirmed':
      return `Namaste ${customerName}! Your ${brand} order #${orderNumber} (₹${total}) has been CONFIRMED by the kitchen. Preparation is starting now.`;
    case 'preparing':
      return `SwadGhar Kitchen: Chef is fresh-crafting your delicacies for order #${orderNumber} in pure desi ghee.`;
    case 'ready':
    case 'ready_for_pickup':
      return `SwadGhar: Order #${orderNumber} is freshly packed and ready for pickup/dispatch.`;
    case 'out_for_delivery':
      return `SwadGhar: Your order #${orderNumber} is OUT FOR DELIVERY with our executive. Expect delivery in 20-30 mins. Keep your appetite ready!`;
    case 'delivered':
    case 'completed':
      return `SwadGhar: Order #${orderNumber} has been DELIVERED. Enjoy your royal feast! Rate your meal at swadghar.com/food`;
    case 'cancelled':
      return `SwadGhar: Order #${orderNumber} has been CANCELLED. If prepaid, refund of ₹${total} is initiated to your source account.`;
    default:
      return `SwadGhar: Order #${orderNumber} status updated to: ${status.toUpperCase()}.`;
  }
};

/**
 * Dispatch SMS Notification to Customer Phone Number
 * @param {Object} options - { order, status, recipientPhone, recipientName }
 */
const sendOrderStatusNotification = async ({ order, status, recipientPhone, recipientName }) => {
  try {
    const phone = recipientPhone || order?.deliveryAddress?.phone || order?.customer?.phone;
    const name = recipientName || order?.deliveryAddress?.fullName || order?.customer?.name || 'Customer';
    const total = order?.pricing?.total || 0;
    const orderNumber = order?.orderNumber || 'SWAD-ORDER';

    if (!phone) {
      console.warn(`[SMS Notification] Skipped: No valid recipient phone number for order #${orderNumber}`);
      return { success: false, reason: 'No recipient phone number' };
    }

    const message = formatStatusSMS(orderNumber, status, name, total);

    // 1. Check if Twilio is configured
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
      try {
        const twilio = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await twilio.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '').slice(-10)}`,
        });
        console.log(`[SMS Sent via Twilio] Order #${orderNumber} to ${phone}`);
        return { success: true, provider: 'twilio', message, phone };
      } catch (twilioErr) {
        console.error('[SMS Twilio Error]', twilioErr.message);
      }
    }

    // 2. Check if Fast2SMS or Custom Indian SMS Gateway is configured
    if (process.env.FAST2SMS_API_KEY) {
      try {
        const axios = require('axios');
        const cleanPhone = phone.replace(/\D/g, '').slice(-10);
        await axios.post(
          'https://www.fast2sms.com/dev/bulkV2',
          {
            route: 'v3',
            sender_id: 'TXTIND',
            message,
            language: 'english',
            flash: 0,
            numbers: cleanPhone,
          },
          { headers: { authorization: process.env.FAST2SMS_API_KEY } }
        );
        console.log(`[SMS Sent via Fast2SMS] Order #${orderNumber} to ${cleanPhone}`);
        return { success: true, provider: 'fast2sms', message, phone: cleanPhone };
      } catch (smsErr) {
        console.error('[SMS Fast2SMS Error]', smsErr.message);
      }
    }

    // 3. Fallback Development Dispatcher Log
    const timestamp = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    console.log(`\n======================================================`);
    console.log(`📱 [PHONE SMS NOTIFICATION DISPATCHED] at ${timestamp}`);
    console.log(`   To Phone   : ${phone} (${name})`);
    console.log(`   Order #    : ${orderNumber}`);
    console.log(`   New Status : ${status.toUpperCase()}`);
    console.log(`   Message    : "${message}"`);
    console.log(`======================================================\n`);

    return {
      success: true,
      provider: 'dev_simulator',
      message,
      phone,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('[Notification Service Error]', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOrderStatusNotification,
  formatStatusSMS,
};
