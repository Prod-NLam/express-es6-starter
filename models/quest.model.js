import mongoose from 'mongoose';
import { SSL_OP_NO_QUERY_MTU } from 'constants';

const QuestSchema = mongoose.Schema(
    {
        quest : String,
        answers : [Number]
    }, {collection : 'Quest'}
);

let QuestModel = mongoose.model('Quest', QuestSchema);

QuestModel.getAll = () => {
    return QuestModel.find({});
}

QuestModel.addQuest = (questToAdd) => {
    return questToAdd.save();
}

export default QuestModel;