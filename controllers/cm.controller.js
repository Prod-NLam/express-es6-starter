import Cm from '../models/cm.model'
import logger from '../core/logger/app-logger'

const controller = {};

controller.getAll = async (req, res) => {
    try {
        const cm = await Cm.getAll();
        logger.info('sending all cm...');
        res.send(cm);
    }
    catch(err) {
        logger.error('Error in getting cm- ' + err);
        res.send('Got error in getAll');
    }
}

controller.addCm = async (req, res) => {
    let cmToAdd = Cm({
        photos : [req.body.photos],
        questions : [req.body.questions]
    });
    try {
        const savedCm = await Cm.addCm(cmToAdd);
        logger.info('Adding cm...');

        pushMessage();
        res.send('added: ' + savedCm);

    }
    catch(err) {
        logger.error('Error in getting cm- ' + err);
        res.send('Got error in getAll');
    }
}

export default controller;