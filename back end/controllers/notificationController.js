
const Notification = require("../models/notificationSchema");

// Get logged-in user's notifications
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.user.userId
    }).sort({ _id: -1 });

    return res.status(200).json({
      count: notifications.length,
      notifications
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Could not get notifications"
    });
  }
};

// Mark a notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      _id: notificationId,
      user: req.user.userId
    });

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found"
      });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json({
      message: "Notification marked as read",
      notification
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Could not update notification"
    });
  }
};

module.exports = {
  getMyNotifications,
  markNotificationAsRead
};
