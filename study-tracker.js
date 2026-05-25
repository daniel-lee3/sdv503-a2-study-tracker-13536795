const { stdin, stdout } = require('node:process');
const readline = require('node:readline');
const fs = require('node:fs');

const filePath = 'recorded-studies.json'

async function main() {
    const rl = readline.promises.createInterface({
        input: stdin,
        output: stdout
    });
    const studyPeriods = await loadJSON(filePath, {});

    console.log('---------- Study Tracker ----------');
    console.log('   1. Add Study Session');
    console.log('   2. View full history');
    console.log('   3. View history');
    console.log();
    const input = await rl.question('Enter input: ');
    rl.close();

    switch(input) {
        case '1':
            const newData = await addStudyPeriod();
            studyPeriods[newData.topic].push({
                timeRecorded: newData.timeRecorded,
                minutes: newData.minutes
            });
            writeJSON(filePath, studyPeriods);
            break;
        case '2':
            const overviewString = await getOverview(studyPeriods);
            console.log(overviewString);
            break;
        case '3':
            const partialOverviewString = await getPartialOverview(studyPeriods);
            console.log(partialOverviewString);
            break;
    }
}

async function addStudyPeriod() {
    const rl = readline.promises.createInterface({
        input: stdin,
        output: stdout
    });

    let data;

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
            issues.push('Study time must be longer than 0 minutes');
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
        data = {
            topic: topic,
            timeRecorded: Date.now(),
            minutes: minutes
        }
    } catch(Error) {
        console.log(`Something went wrong.\n    %c${Error}`, 'color: red;');
    } finally {
        rl.close();
    }

    return data
}

async function getPartialOverview(overviewInfo) {
    const rl = readline.promises.createInterface({
        input: stdin,
        output: stdout
    });

    const days = await rl.question("How many days of history would you like to see? ");
    rl.close();
    const filterCallback = (value) => value.timeRecorded >= Date.now()-(86400 * days * 1000);
    return await getOverview(overviewInfo, filterCallback);
}

async function getOverview(overviewInfo, filterCallback = () => true) {
    let overview = [];
    for (let topic in overviewInfo) {
        const history = overviewInfo[topic].filter(filterCallback)
        overview.push(`---------- ${topic} ----------`)
        history.map((entry, index) => {
            overview.push(`${new Date(entry.timeRecorded).toDateString()}: ${entry.minutes} minutes`)
        })
        overview.push(`--------------------`)
        overview.push(`Total time: ${history.reduce((sum, entry) => sum + entry.minutes, 0)} minutes\n`)
    }
    return overview.join('\n')
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