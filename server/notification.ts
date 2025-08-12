import { sendNotification, sendNotificationToUsers } from "@/utils/sendNotification";
import { getDoctors } from "./doctors";
import { getPatients } from "./patients";
import { getAllUsers } from "./user";
import { v4 as uuidv4 } from 'uuid';
import { UserModel } from "@/app/model/user_model";

export const sendCustomNotification = async (title: string, message: string, type: string) => {

    const validTypes = ['all', 'user', 'doctor'];
    if (!validTypes.includes(type)) {
        throw new Error(`Invalid type: ${type}. Must be one of ${validTypes.join(', ')}`);
    }

    let users: UserModel[] = [];
    if (type === 'all') {
        users = await getAllUsers();
    } else if (type === 'user') {
        users = await getPatients();
    } else if (type === 'doctor') {
        users = await getDoctors();
    }

    if (users.length === 0) {
        throw new Error('No users found for the specified type');
    }

    const orderId = uuidv4(); // Generate a unique orderId
    await sendNotificationToUsers(users, title, message, orderId, type);
}