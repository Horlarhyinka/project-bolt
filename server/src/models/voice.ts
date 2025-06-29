import mongoose from 'mongoose';

const voiceSchema = new mongoose.Schema({
    name: { type: String, required: true},
    id: { type: String, required: true, unique: true},
})

const Voice = mongoose.models.voice ?? mongoose.model('voice', voiceSchema)

export default Voice