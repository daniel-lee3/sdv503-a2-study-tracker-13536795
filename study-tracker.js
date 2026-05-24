const { stdin, stdout } = require('node:process');
const readline = require('node:readline');

const studyPeriods = {
    // For the data structure I decided the index will be the topic the user inputs
    // The value will be an array showcasing a history allowing for filtering over time periods
    // I decided not to include a totalMinutes as it can be calculated by adding all-time history
    // The history will be saved as JSON where it can be read
    // -------- STRUCTURE --------
    // topic: [
    //   {
    //     timeRecorded: timestamp
    //     minutes: number
    //   }
    // ]
}

async function main() {
    const rl = readline.promises.createInterface({
        input: stdin,
        output: stdout
    });

    try {
        const topicInput = await rl.question('What is the topic? ');
        const minutesInput = await rl.question('How long did you study for? (in minutes) ');

        const topic = topicInput.trim();
        const minutes = Number(minutesInput);
        
        const issues = [];
        if (topic.length === 0) {
            issues.push('Topic can not be blank');
        }
        if (Number.isNaN(minutes)) {
            issues.push('Study time must be a number');
        } else if (minutes <= 0) {
            issues.push('Study time must be longer than 0 minutes')
        }
        if (issues.length > 0) {
            throw Error(issues.join(', '))
        }
    } catch(Error) {
        console.log(`Something went wrong.\n    %c${Error}`, 'color: red;')
    } finally {
        rl.close();
    }
}

main()