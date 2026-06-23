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
    const input = (await rl.question('Enter input: ')).trim();
    rl.close();

    switch(input) {
        case '1':
            const newData = await addStudyPeriod();
            if (!newData) break;
            if (studyPeriods[newData.topic] === undefined) studyPeriods[newData.topic] = [];
            studyPeriods[newData.topic].push({
                timeRecorded: newData.timeRecorded,
                minutes: newData.minutes
            });
            await writeJSON(filePath, studyPeriods);
            break;
        case '2':
            const overviewString = await getOverview(studyPeriods);
            console.log(overviewString);
            break;
        case '3':
            const partialOverviewString = await getPartialOverview(studyPeriods);
            if (!partialOverviewString) break;
            console.log(partialOverviewString);
            break;
        default:
            console.log('Please enter an input of "1", "2", or "3"')
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
        rl.close();

        const topic = topicInput.trim();
        const minutes = Number(minutesInput);
        
        const issues = [];
        if (topic.length === 0) issues.push('Topic can not be blank');
        if (Number.isNaN(minutes) || minutes % 1 !== 0) {
            issues.push('Study time must be a whole number');
        } else if (minutes <= 0) {
            issues.push('Study time must be longer than 0 minutes');
        }
        if (issues.length > 0) throw Error(issues.join(', '));

        if (topicInput !== topic) console.log(`Topic storing as "${topic}"`);

        data = {
            topic: topic,
            timeRecorded: Date.now(),
            minutes: minutes
        }
    } catch(Error) {
        console.log(`Something went wrong.\n    ${Error}`);
    }

    return data
}

async function getPartialOverview(overviewInfo) {
    const rl = readline.promises.createInterface({
        input: stdin,
        output: stdout
    });

    const daysInput = await rl.question("How many days of history would you like to see? ");
    const days = Number(daysInput);
    rl.close();

    if (Number.isNaN(days)) {
        throw Error('Days must be a valid number');
    } else if (days <= 0) {
        throw Error('Days must be a higher number than 0');
    }

    const filterCallback = (value) => value.timeRecorded >= Date.now()-(86400 * days * 1000);
    return await getOverview(overviewInfo, filterCallback);
}

async function getOverview(overviewInfo, filterCallback = () => true) {
    let overview = [];
    let totalTime = 0;
    for (let topic in overviewInfo) {
        const history = overviewInfo[topic].filter(filterCallback);
        if (history.length === 0) continue;
        overview.push(`---------- ${topic} ----------`);
        history.forEach(entry => {
            overview.push(`${new Date(entry.timeRecorded).toDateString()}: ${entry.minutes} minutes`);
        });
        overview.push(`--------------------`);
        const totalMinutes = history.reduce((sum, entry) => sum + entry.minutes, 0);
        overview.push(`Total time: ${totalMinutes} minutes\n`);
        totalTime += totalMinutes;
    }
    if (overview.length === 0) { return '- No history found -' } else {
        overview.push(`--------------------`);
        overview.push(`Total time: ${totalTime} minutes\n`);
    }
    return overview.join('\n');
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

    await fs.promises.writeFile(filePath, jsonData)
}

main()