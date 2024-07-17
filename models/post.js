import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  username: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    }
  ]
}, { timestamps: true });

// Pre-save hook to ensure unique likes
postSchema.pre('save', function (next) {
  this.likes = Array.from(new Set(this.likes.map(like => like.toString()))).map(id => new mongoose.Types.ObjectId(id));
  next();
});

const postModel = mongoose.model('post', postSchema);
export default postModel;
