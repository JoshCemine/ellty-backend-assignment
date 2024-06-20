import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
});

export default mongoose.models.Item || mongoose.model('Item', ItemSchema);
