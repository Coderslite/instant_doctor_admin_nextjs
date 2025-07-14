export interface TransferRequest {
    source: string;
    amount: number | string;
    reference: string;
    recipient: string;
    reason: string;
}

interface PaystackResponse {
    status: boolean;
    message: string;
    data?: {
        id: number;
        amount: number;
        currency: string;
        status: string;
        reference: string;
        recipient: string;
        createdAt: string;
        updatedAt: string;
        // Add other fields as needed based on Paystack API response
    };
}

interface PaystackError {
    status: boolean;
    message: string;
}

// Example usage
export const performTransfer = async (amount: string, recipient: string, reference: string) => {
    const transferData: TransferRequest = {
        source: 'balance',
        amount: amount,
        reference: reference,
        recipient: recipient,
        reason: 'Instant Doctor Payment',
    };

    const secretKey = "sk_test_5a009cc631c4d56e7c8b7dccdfdf471ebc4a8cba";
    const url = 'https://api.paystack.co/transfer';

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${secretKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(transferData),
        });
        console.log(response.body);
    }
    catch (error) {
        console.error('Transfer failed:', error);
        throw error;
    }
};
