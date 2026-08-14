const { getMessaging } = require('firebase-admin/messaging');
const app = require('../config/firebase.config');

class FCMClient {
  /**
   * Send a push notification to a specific device
   * @param {string} token FCM Token of the target device
   * @param {string} title Notification title
   * @param {string} body Notification body text
   * @param {object} data Optional data payload
   */
  static async sendPushNotification(token, title, body, data = {}) {
    if (!token) return false;

    const message = {
      token,
      notification: {
        title,
        body
      },
      data: {
        ...data,
        click_action: "FLUTTER_NOTIFICATION_CLICK" // Generic action handler
      },
      // Optional Android & iOS specific configs
      android: {
        priority: "high",
        notification: {
          sound: "default"
        }
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1
          }
        }
      }
    };

    try {
      const response = await getMessaging(app).send(message);
      console.log('Successfully sent message:', response);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }
}

module.exports = FCMClient;
