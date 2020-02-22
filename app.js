const Manager = require('./lib/Manager');
const Engineer = require('./lib/Engineer');
const Intern = require('./lib/Intern');
const inquirer = require("inquirer");
const render = require("./lib/htmlRenderer");

const path = require("path");
const fs = require("fs");
const util = require("util");
const writeFileAsync = util.promisify(fs.writeFile);

const OUTPUT_DIR = path.resolve(__dirname, "output");
const outputPath = path.join(OUTPUT_DIR, "team.html");

console.log('---------------------------------------------------');
console.log('---------------------------------------------------');


function readySetGo() {
    return inquirer.prompt({
        type: 'confirm',
        name: 'start',
        message: 'You are about to build an engineering team. An engineering team may consist of a manager, and any number of engineers and interns. Are you ready?'
    })
}

function isEmployee(role) {
    return inquirer.prompt({
        type: 'confirm',
        name: 'any',
        message: `Is there ${role} in your team?`
    });
}

function howMany() {
    return inquirer.prompt({
        type: 'input',
        name: 'count',
        message: 'How many of them do you have in your team?',
        validate: function (input) {
            const nums = /^[0-9]+$/;
            if (!input.match(nums)) {
                return 'Incorrect answer. Provide a number';
            }
            return true;
        }
    })
}

function getCommonInfo(role, n) {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: role === 'Manager' ? `Please type name of ${role}` : `Please type name of ${role} ${n}`,
            validate: function (input) {
                const letters = /^[A-Za-z\s]+$/;
                if (!input.match(letters)) {
                    return 'Incorrect answer. Provide a name. Letters and whitespaces only please';
                }
                return true;
            }
        },
        {
            type: 'input',
            name: 'id',
            message: role === 'Manager' ? `Please type id of ${role}` : `Please type id of ${role} ${n}`,
            validate: function (input) {
                const nums = /^[0-9]+$/;
                if (!input.match(nums)) {
                    return 'Incorrect answer. Provide an id. Numbers only please';
                }
                return true;
            }
        },
        {
            type: 'input',
            name: 'email',
            message: role === 'Manager' ? `Please type email of ${role}` : `Please type email of ${role} ${n}`,
            validate: function (input) {
                const emailregex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                if (!input.match(emailregex)) {
                    return 'Incorrect answer. Provide a valid email';
                }
                return true;
            }
        }
    ])
}

function getManagerInfo() {
    return inquirer.prompt({
        type: 'input',
        name: 'officeNum',
        message: 'Please type office number of the Manager',
        validate: function (input) {
            const nums = /^[0-9]+$/;
            if (!input.match(nums)) {
                return 'Incorrect answer. Numbers only please';
            }
            return true;
        }
    })
}

function getEngineerInfo(n) {
    return inquirer.prompt({
        type: 'input',
        name: 'gitHub',
        message: `Please type a GitHub username of an Engineer ${n}`,
        validate: function (input) {
            const gitHubRegEx = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;
            if (!input.match(gitHubRegEx)) {
                return 'Incorrect answer. Provide a valid username please';
            }
            return true;
        }
    })
}

function getInternInfo(n) {
    return inquirer.prompt({
        type: 'input',
        name: 'school',
        message: `Please type a school name of an Intern ${n}`,
        validate: function (input) {
            const lettersNums = /^[A-Za-z0-9 _]*[A-Za-z0-9][A-Za-z0-9 _]*$/;
            if (!input.match(lettersNums)) {
                return 'Incorrect answer. Provide school name. Letters, numbers, and whitespaces only please';
            }
            return true;
        }
    })
}


async function init() {

    console.log('Getting started...');

    const allEmployeeSet = [];

    const ready = await readySetGo();
    if (ready.start) {

        const confirmManager = await isEmployee('Manager');
        if (confirmManager.any) {

            const managerCommonData = await getCommonInfo('Manager', -1);
            const managerData = await getManagerInfo();
            const managerObj = new Manager(managerCommonData.name, managerCommonData.id, managerCommonData.email, managerData.officeNum);
            allEmployeeSet.push(managerObj);
        }        

        const confirmEngineer = await isEmployee('Engineer');
        if (confirmEngineer.any) {

            const engineerCount = await howMany();
            if (engineerCount.count > 0) {
                for (let i = 0; i < engineerCount.count; i++) {
                    const engineerCommonData = await getCommonInfo('Engineer', i + 1)
                    const engineerData = await getEngineerInfo(i + 1);
                    const engineerObj = new Engineer(engineerCommonData.name, engineerCommonData.id, engineerCommonData.email, engineerData.gitHub);
                    allEmployeeSet.push(engineerObj);
                }
            }
        }

        const confirmInterns = await isEmployee('Intern');
        if (confirmInterns.any) {

            const internCount = await howMany();
            if (internCount.count > 0) {
                for (let i = 0; i < internCount.count; i++) {
                    const internCommontData = await getCommonInfo('Intern', i + 1);
                    const internData = await getInternInfo(i + 1);
                    const internObj = new Intern(internCommontData.name, internCommontData.id, internCommontData.email, internData.school);
                    allEmployeeSet.push(internObj);
                }
            }
        }
    }

    const myHTML = await render(allEmployeeSet);

    await writeFileAsync(outputPath, myHTML);
    console.log('Successfully wrote to team.html in the output folder');
    console.log('-----------------------------------------------------');
    console.log('-----------------------------------------------------');
}

init();
