const DynamoDBHelper = require('../clients/dynamodb.client');
const config = require('../config/env');
const crypto = require('crypto');
const FCMClient = require('../clients/fcm.client');

class ChatController {
  /**
   * Save chat session from RTDB to DynamoDB (called internally or via API)
   * This is generally called when a session ends.
   */
  static async saveSessionChat(bookingId, messages) {
    if (!messages || messages.length === 0) return;

    const tableName = config.tables.chats || "PlusOne_Chats";
    
    // We store the entire chat array as one document for the booking
    const chatDoc = {
      bookingId,
      messages,
      savedAt: new Date().toISOString()
    };

    try {
      await DynamoDBHelper.putItem(tableName, chatDoc);
      console.log(`[ChatController] Saved ${messages.length} messages for booking ${bookingId}`);
    } catch (err) {
      console.error("[ChatController] Error saving chat history:", err);
    }
  }

  /**
   * GET /api/v1/chats/:bookingId
   * Retrieve historical chat logs from DynamoDB
   */
  static async getChatHistory(req, res, next) {
    try {
      const { bookingId } = req.params;
      const tableName = config.tables.chats || "PlusOne_Chats";
      
      const chatDoc = await DynamoDBHelper.getItem(tableName, { bookingId });
      
      return res.status(200).json({
        success: true,
        data: chatDoc ? chatDoc.messages : []
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/chats/:bookingId/notify
   * Notify the other party in a booking that a new message arrived
   */
  static async notifyRecipient(req, res, next) {
    try {
      const { bookingId } = req.params;
      const { messageText } = req.body;
      const { uid, role, name } = req.user; // Note: req.user.name or req.user.displayName depending on auth middleware

      const booking = await DynamoDBHelper.getItem(config.tables.bookings, { bookingId });
      if (!booking) return res.status(404).json({ success: false, error: "Booking not found" });

      // Determine who to notify
      const targetUserId = (role === "host") ? booking.userId : booking.hostId;
      if (!targetUserId) {
        return res.status(400).json({ success: false, error: "Recipient not found for this booking" });
      }

      const targetUser = await DynamoDBHelper.getItem(config.tables.users, { userId: targetUserId });
      if (targetUser && targetUser.fcmToken) {
        // Fetch sender details if needed, but we can just say "New message"
        const senderUser = await DynamoDBHelper.getItem(config.tables.users, { userId: uid });
        const senderName = (senderUser && senderUser.displayName) ? senderUser.displayName : "Someone";
        
        const bodyText = messageText || "Sent an attachment";
        
        await FCMClient.sendPushNotification(
          targetUser.fcmToken,
          `New message from ${senderName}`,
          bodyText,
          { type: "chat", bookingId }
        );
      }

      return res.status(200).json({ success: true, message: "Notification sent if applicable" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ChatController;
