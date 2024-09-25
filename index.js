// AfricastalkingController.js
require('dotenv').config();
const express =require ('express');
const post =require ('axios') ;
const urlencoded = require ('body-parser' ) ;
const app = express();


// Use specific middlewares instead of bodyParser
app.use(express.json()); // To handle JSON data
app.use(express.urlencoded({ extended: true })); // To handle form URL-encoded data

app.use(urlencoded({ extended: true }));

const AFRICASTALKING_USERNAME = process.env.AFRICASTALKING_USERNAME;
const AFRICASTALKING_API_KEY = process.env.AFRICASTALKING_API_KEY;
const AFRICASTALKING_BASE_URL = 'https://api.sandbox.africastalking.com';

// Handle USSD
app.post('/ussd', (req, res) => {
    const { text } = req.body; // Extract 'text' from the request body

    if (!text || text === "") {
        response = `CON Welcome. Choose an option:\n1. Disability benefits and financial assistance\n2. Employment Assistance`;
    } else if (text === "1") {
        response = `CON Choose a service:\n1. Disability pensions & allowances\n2. Supplemental income for caregivers\n3. Grants for assistive devices\n4. Medical rehabilitation coverage\n5. Social security disability insurance\n6. Emergency assistance\n7. Housing grants\n8. Child disability benefits`;
    } else if (text.startsWith("1*")) {
        const subOption = text.split("*")[1];
        switch(subOption) {
            case "1":
                response = "END Disability pensions & allowances details.";
                break;
            case "2":
                response = "END Supplemental income for caregivers details.";
                break;
            // Add other cases for sub-options
            default:
                response = "END Invalid input. Try again.";
        }
    } else if (text === "2") {
        response = `CON Choose a service:\n1. Job placement services\n2. Vocational training & skill development\n3. Entrepreneurship & self-employment grants\n4. Career counseling & mentorship\n5. Rights and legal support\n6. Supported employment programs`;
    } else if (text.startsWith("2*")) {
        const subOption = text.split("*")[1];
        switch(subOption) {
            case "1":
                response = "END Job placement services details.";
                break;
            case "2":
                response = "END Vocational training & skill development details.";
                break;
            // Add other cases for sub-options
            default:
                response = "END Invalid input. Try again.";
        }
    } else {
        response = "END Invalid input. Try again.";
    }

    res.send(response); // Send the response back to the user
});


// Send SMS via Africa's Talking API
app.post('/sendSms', async (req, res) => {
    const url = `${AFRICASTALKING_BASE_URL}/version1/messaging`;
    const recipients = "+254702769333";  // Example number
    const message = "Hello from Node.js via HTTP!";
    
    const headers = {
        apiKey: AFRICASTALKING_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
    };
    
    const body = new URLSearchParams({
        username: AFRICASTALKING_USERNAME,
        to: recipients,
        message: message,
        from: 'AT_VICTOR',
    }).toString();
    
    try {
        const response = await post(url, body, { headers });
        res.json(response.data);
    } catch (error) {
        console.error('Error sending SMS:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Handle Incoming SMS
app.post('/incomingSms', (req, res) => {
    const { from, to, text, date, id, linkId } = req.body;

    console.log(`Received SMS from ${from}: ${text}`);

    if (text.toLowerCase() === 'balance') {
        sendAutoReply(from, 'Your balance is KES 1,000.');
    }

    res.set('Content-Type', 'text/plain');
    res.status(200).send('SMS received');
});

// Function to send auto-reply SMS using Africa's Talking API
async function sendAutoReply(recipient, replyMessage) {
    const url = `${AFRICASTALKING_BASE_URL}/version1/messaging`;
    const headers = {
        apiKey: AFRICASTALKING_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
    };

    const body = new URLSearchParams({
        username: AFRICASTALKING_USERNAME,
        to: recipient,
        message: replyMessage,
    }).toString();

    try {
        const response = await post(url, body, { headers });
        console.log('Reply sent:', response.data);
    } catch (error) {
        console.error('Error sending SMS:', error.message);
    }
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`AfricastalkingController running on port ${PORT}`);
});
