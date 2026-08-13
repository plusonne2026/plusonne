const DynamoDBHelper = require('../clients/dynamodb.client');
const config = require('../config/env');
const crypto = require('crypto');

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
}

module.exports = ChatController;
