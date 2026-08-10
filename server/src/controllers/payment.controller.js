const BillingService = require("../services/billing.service");
const BookingService = require("../services/booking.service");

class PaymentController {
  /**
   * POST /api/v1/payments/create-order
   */
  static async createOrder(req, res, next) {
    try {
      const { bookingId } = req.body;
      if (!bookingId) {
        return res.status(400).json({ success: false, message: "bookingId is required" });
      }

      // Fetch booking to get the total amount
      const booking = await BookingService.getBookingById(bookingId);
      if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }

      if (booking.status !== "pending_payment") {
        return res.status(400).json({ success: false, message: "Booking is not awaiting payment" });
      }

      const amount = booking.price?.total || 0;
      if (amount <= 0) {
        return res.status(400).json({ success: false, message: "Invalid booking amount" });
      }

      const order = await BillingService.createOrder(amount, bookingId);

      return res.status(200).json({
        success: true,
        data: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * POST /api/v1/payments/verify
   */
  static async verifyPayment(req, res, next) {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;
      const userId = req.user.userId;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !bookingId) {
        return res.status(400).json({ success: false, message: "Missing payment verification parameters" });
      }

      const isValid = BillingService.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

      if (!isValid) {
        return res.status(400).json({ success: false, message: "Invalid payment signature" });
      }

      const booking = await BookingService.getBookingById(bookingId);
      if (!booking) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }

      // Record payment
      await BillingService.recordPayment({
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        bookingId: bookingId,
        userId: userId,
        amount: booking.price?.total || 0,
        status: "success",
      });

      // Update booking status to active/host_assigned (For MVP, we'll assume auto-assignment or pending host acceptance)
      const updatedBooking = await BookingService.updateBookingStatus(bookingId, "host_assigned", "system", "system");

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        data: updatedBooking,
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PaymentController;
