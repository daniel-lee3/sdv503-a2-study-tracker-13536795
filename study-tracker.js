const { stdin, stdout } = require('node:process');
const readline = require('node:readline');
const fs = require('node:fs');

const filePath = 'recorded-studies.json'

async function main() {
    const studyPeriods = await loadJSON(filePath, {
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
    })

    const rl = readline.promises.createInterface({
        input: stdin,
        output: stdout
    });

    try {
        const topicInput = await rl.question('What is the topic? ');
        const minutesInput = await rl.question('How long did you study for? (in minutes) ');
        const overviewInput = await rl.question('Would you like an overview? (y/n) ')
        const overviewAcceptedInputs = {
            yes: [
                'yes',
                'y'
            ],
            no: [
                'no',
                'n'
            ]
        }


        const topic = topicInput.trim();
        const minutes = Number(minutesInput);
        let overview = '';
        
        const issues = [];
        if (topic.length === 0) {
            issues.push('Topic can not be blank');
        }
        if (Number.isNaN(minutes)) {
            issues.push('Study time must be a number');
        } else if (minutes <= 0) {
            issues.push('Study time must be longer than 0 minutes');
        }
        if (overviewAcceptedInputs.yes.includes(overviewInput.toLowerCase())) {
            overview = true
        } else if (overviewAcceptedInputs.no.includes(overviewInput.toLowerCase())) {
            overview = false
        } else {
            issues.push('Overview must be either "y" or "n"');
        }
        if (issues.length > 0) {
            throw Error(issues.join(', '));
        }

        if (topicInput !== topic) {
            console.log(`Topic storing as "${topic}"`);
        }

        if (studyPeriods[topic] == undefined) {
            studyPeriods[topic] = [];
        }
        studyPeriods[topic].push({
            timeRecorded: Date.now(),
            minutes: minutes
        })

        if (overview) {
            let overview = [];
            for (let topic in studyPeriods) {
                const history = studyPeriods[topic]
                overview.push(`---------- ${topic} ----------`)
                history.map((entry, index) => {overview.push(`${new Date(entry.timeRecorded).toDateString()}: ${entry.minutes} minutes`)})
                overview.push(`--------------------`)
                overview.push(`Total time: ${history.reduce((sum, entry) => sum + entry.minutes, 0)} minutes\n`)
            }
            console.log(overview.join('\n'))
        }
    } catch(Error) {
        console.log(`Something went wrong.\n    %c${Error}`, 'color: red;');
    } finally {
        rl.close();

        writeJSON(filePath, studyPeriods);
    }
}

async function loadJSON(filePath, defaultValue) {
    try {
        const json = await fs.promises.readFile(filePath, 'utf8');
        return JSON.parse(json);
    } catch(err) {
        return defaultValue;
    }
}

async function writeJSON(filePath, data) {
    const jsonData = JSON.stringify(data, null, 2);

    fs.promises.writeFile(filePath, jsonData)
}

main()