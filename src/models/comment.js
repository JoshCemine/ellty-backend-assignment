// models/Comment.js
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const CommentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['post', 'comment'],
    required: [true, 'Please specify the type (post or comment)'],
  },
  id: {
    type: String,
    default: uuidv4,
    unique: true,
  },
  author: {
    type: String,
    required: [true, 'Please add an author'],
  },
  text: {
    type: String,
    required: [true, 'Please add text'],
    default: 'DEFAULT'
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  score: {
    type: Number,
    default: 0,
  },
  total_comments: {
    type: Number,
    default: 0,
  },
  post_parent_id: {
    type: String,
    default: '',
  },
  comment_parent_id: {
    type: String,
    default: '',
  },
});

export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema);
