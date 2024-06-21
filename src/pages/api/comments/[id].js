import dbConnect from '../../../lib/mongoose';
import Comment from '../../../models/comment';

export default async function handler(req, res) {
  const { method } = req;
  const { id } = req.query;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const comment = await Comment.findById(id);
        if (!comment) {
          return res.status(404).json({ success: false });
        }
        res.status(200).json({ success: true, data: comment });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;
    case 'PUT':
      try {
        const comment = await Comment.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        if (!comment) {
          return res.status(404).json({ success: false });
        }
        res.status(200).json({ success: true, data: comment });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;
    case 'DELETE':
      try {
        const deletedComment = await Comment.deleteOne({ _id: id });
        if (!deletedComment) {
          return res.status(404).json({ success: false });
        }
        res.status(200).json({ success: true, data: {} });
      } catch (error) {
        res.status(400).json({ success: false });
      }
      break;
    default:
      res.status(400).json({ success: false });
      break;
  }
}
