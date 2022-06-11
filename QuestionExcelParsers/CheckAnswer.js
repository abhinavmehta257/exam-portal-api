const assert = require('assert');

function checkAnswer(answer, question) {
    let ansCorrect = true;

    if (`${question.formatID}` === '61bace9584476677d477e76e') {
        const tmpEquation = question.data.equation;
        try {
            // TODO: Convert answer array to number
            question.data.variablePos.forEach((pos) => {
                if (isNaN(parseInt(answer[pos])))
                    throw new Error('Invalid Answer');
            });
            question.data.variablePos.forEach((pos, ind) => tmpEquation[pos] = answer[pos]);
            const isEquationCorrect = eval(tmpEquation.join('').replace(/=/, '==='));
            ansCorrect = isEquationCorrect;
        } catch (exe1) {
            console.log(exe1);
            ansCorrect = false;
        }
        return ansCorrect;
    }

    try {
        console.log('answer',answer);
        console.log('given:',question.answer);
        assert.deepEqual(question.answer, answer);
        ansCorrect = true;
    } catch (e) {
        console.log('answer',answer);
        console.log('given:',question.answer);
        ansCorrect = false;
    }
    return ansCorrect;
}

module.exports = checkAnswer;