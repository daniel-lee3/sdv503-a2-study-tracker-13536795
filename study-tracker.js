const { stdin, stdout } = require('node:process');
const readline = require('node:readline');

async function main() {
    const rl = readline.promises.createInterface({
        input: stdin,
        output: stdout
    });

    try {
        const topicInput = await rl.question('What is the topic? ');
        const lengthInput = await rl.question('How long did you study for? (in minutes) ');

        const topic = topicInput.trim();
        const length = Number(lengthInput);
        
        const issues = [];
        if (topic.length === 0) {
            issues.push('Topic can not be blank');
        }
        if (Number.isNaN(length)) {
            issues.push('Study length must be a number');
        } else if (length <= 0) {
            issues.push('Study length must be longer than 0 minutes')
        }
        if (issues.length > 0) {
            throw Error(issues.join(', '))
        }
    } finally {
        rl.close();
    }
}

main()