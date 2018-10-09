import mongoose from 'mongoose';

const CmSchema = mongoose.Schema(
    {
        photos : [{path : String, N : Number, E : Number}],
        questions : [{quest : String, answer : Number}]
    }, {collection : 'Cm'}
);

let CmModel = mongoose.model('Cm', CmSchema);

CmModel.getAll = () => {
    return CmModel.find({});
}

CmModel.addCm = (cmToAdd) => {
    return cmToAdd.save();
}

export default CmModel;