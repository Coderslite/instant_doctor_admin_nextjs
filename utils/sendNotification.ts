// utils/sendNotification.ts
import { UserModel } from '@/app/model/user_model';

export async function sendNotification(
    user: UserModel,
    title: string,
    body: string,
    orderId: string,
    type: string
) {
    if (!user.token) {
        console.warn('User has no notification token');
        return;
    }

    try {
        const response = await fetch(
            'https://us-central1-instant-doctor-a4e4c.cloudfunctions.net/api/notification',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    body,
                    tokens: [user.token], // Array of tokens (can send to multiple devices)
                    id: orderId,
                    type,
                }),
            }
        );

        if (!response.ok) {
            throw new Error('Failed to send notification');
        }
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

export async function sendNotificationToUsers(
    users: UserModel[],
    title: string,
    body: string,
    orderId: string,
    type: string
): Promise<void> {
    // Filter out users without a valid notification token
    const tokens = users
        .filter(user => user.token && typeof user.token === 'string')
        .map(user => user.token);

    if (tokens.length === 0) {
        console.warn('No valid notification tokens found for users');
        return;
    }

    try {
        const response = await fetch(
            'https://us-central1-instant-doctor-a4e4c.cloudfunctions.net/api/notification',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    body,
                    tokens, // Send array of tokens
                    id: orderId,
                    type,
                }),
            }
        );

        if (!response.ok) {
            throw new Error('Failed to send notifications to users');
        }
    } catch (error) {
        console.error('Error sending notifications:', error);
    }
}