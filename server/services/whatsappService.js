const axios = require('axios');

/**
 * Technical Trigger: Sends the Digital Bill via WhatsApp API.
 * Currently uses a skeleton for Meta WhatsApp Cloud API.
 * User should provide ACCESS_TOKEN and PHONE_NUMBER_ID in .env
 */
const sendDigitalBill = async (contactNumber, imageDataBase64, customerName) => {
    const accessToken = process.env.WHATSAPP_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_ID;

    if (!accessToken || !phoneNumberId) {
        console.log('⚠️ [MOCK] WhatsApp API not configured. Logging bill data...');
        console.log(`To: ${contactNumber}, Customer: ${customerName}`);
        return { success: false, message: 'API not configured' };
    }

    try {
        // 1. Upload media or send as message? 
        // Meta API requires uploading media first or using a hosted URL.
        // For simplicity, we assume we send a prepared template or a link.

        // This is a placeholder for the actual Meta Graph API call
        const response = await axios.post(
            `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`,
            {
                messaging_product: 'whatsapp',
                to: `91${contactNumber.replace(/\D/g, '')}`,
                type: 'template',
                template: {
                    name: 'digital_bill_notification',
                    language: { code: 'en' },
                    components: [
                        {
                            type: 'header',
                            parameters: [
                                {
                                    type: 'image',
                                    image: { link: 'https://placeholder.link/bill.png' } // Replace with actual hosted URL
                                }
                            ]
                        }
                    ]
                }
            },
            {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            }
        );

        return { success: true, data: response.data };
    } catch (error) {
        console.error('❌ WhatsApp API Error:', error.response?.data || error.message);
        return { success: false, error: error.message };
    }
};

module.exports = { sendDigitalBill };
