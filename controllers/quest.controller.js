import Quest from '../models/quest.model'
import logger from '../core/logger/app-logger'

const controller = {};

controller.getAll = async (req, res) => {
    try {
        const quest = await Quest.getAll();
        logger.info('sending all quest...');
        res.send(quest);
    }
    catch(err) {
        logger.error('Error in getting quest- ' + err);
        res.send('Got error in getAll');
    }
}

controller.addQuest = async (req, res) => {
    let questToAdd = Quest({
        quest : req.body.quest,
        answers : req.body.answers
    });
    try {
        const savedQuest = await Quest.addQuest(questToAdd);
        logger.info('Adding quest...');
        res.send('added: ' + savedQuest);

    }
    catch(err) {
        logger.error('Error in getting quest- ' + err);
        res.send('Got error in getAll');
    }
}

export default controller;